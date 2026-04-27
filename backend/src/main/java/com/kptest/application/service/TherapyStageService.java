package com.kptest.application.service;

import com.kptest.api.dto.PatientStageProgressDto;
import com.kptest.api.dto.TherapyStageDto;
import com.kptest.domain.patient.PatientRepository;
import com.kptest.domain.project.*;
import com.kptest.domain.project.PatientStageProgress.StageStatus;
import com.kptest.domain.project.repository.PatientStageProgressRepository;
import com.kptest.domain.project.repository.TherapyStageRepository;
import com.kptest.domain.quiz.Quiz;
import com.kptest.domain.quiz.repository.QuizRepository;
import com.kptest.exception.ResourceNotFoundException;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.ArrayList;
import java.util.Comparator;
import java.util.List;
import java.util.UUID;

/**
 * Service for managing therapy stages and patient progression.
 */
@Slf4j
@Service
@RequiredArgsConstructor
@Transactional
public class TherapyStageService {

    private final TherapyStageRepository therapyStageRepository;
    private final PatientStageProgressRepository patientStageProgressRepository;
    private final PatientRepository patientRepository;
    private final QuizRepository quizRepository;

    // ==================== Therapy Stage CRUD ====================

    /**
     * Get all stages for a project.
     */
    @Transactional(readOnly = true)
    public List<TherapyStageDto> getStagesByProject(UUID projectId) {
        log.debug("Finding stages for project: {}", projectId);

        List<TherapyStageEntity> stages = therapyStageRepository.findByProjectIdOrderByOrderIndex(projectId);

        return stages.stream()
            .map(TherapyStageDto::fromStage)
            .toList();
    }

    /**
     * Get stage by ID.
     */
    @Transactional(readOnly = true)
    public TherapyStageDto getStageById(UUID id) {
        log.debug("Finding stage by ID: {}", id);

        TherapyStageEntity stage = therapyStageRepository.findById(id)
            .orElseThrow(() -> new ResourceNotFoundException("Therapy stage not found with id: " + id));

        return TherapyStageDto.fromStage(stage);
    }

    /**
     * Create a new therapy stage.
     */
    public TherapyStageDto createStage(TherapyStageDto stageDto) {
        log.info("Creating therapy stage: {}", stageDto.name());

        // Get project
        var projectRef = Project.create(null, "Reference", null, null);
        projectRef.setId(stageDto.projectId());

        // Get next order index
        Integer maxOrder = therapyStageRepository.findMaxOrderIndexByProjectId(stageDto.projectId());
        Integer orderIndex = stageDto.orderIndex() != null ? stageDto.orderIndex() : (maxOrder + 1);

        TherapyStageEntity stage = TherapyStageEntity.create(
            stageDto.name(),
            stageDto.description(),
            projectRef,
            orderIndex,
            stageDto.unlockMode(),
            stageDto.createdBy()
        );

        // Set required quiz if AUTO_QUIZ mode
        if (stageDto.unlockMode() == TherapyStageEntity.UnlockMode.AUTO_QUIZ && stageDto.requiredQuizId() != null) {
            Quiz quiz = quizRepository.findById(stageDto.requiredQuizId())
                .orElseThrow(() -> new ResourceNotFoundException("Quiz not found with id: " + stageDto.requiredQuizId()));
            stage.setRequiredQuiz(quiz.getId(), quiz.getTitle());
        }

        TherapyStageEntity savedStage = therapyStageRepository.save(stage);
        log.info("Created therapy stage with ID: {}", savedStage.getId());

        return TherapyStageDto.fromStage(savedStage);
    }

    /**
     * Update an existing therapy stage.
     */
    public TherapyStageDto updateStage(UUID id, TherapyStageDto stageDto) {
        log.info("Updating therapy stage with ID: {}", id);

        TherapyStageEntity stage = therapyStageRepository.findById(id)
            .orElseThrow(() -> new ResourceNotFoundException("Therapy stage not found with id: " + id));

        if (stageDto.name() != null) {
            stage.setName(stageDto.name());
        }
        if (stageDto.description() != null) {
            stage.setDescription(stageDto.description());
        }
        if (stageDto.unlockMode() != null) {
            stage.setUnlockMode(stageDto.unlockMode());
        }
        if (stageDto.active() != null) {
            if (stageDto.active()) {
                stage.activate();
            } else {
                stage.deactivate();
            }
        }

        // Update required quiz
        if (stageDto.unlockMode() == TherapyStageEntity.UnlockMode.AUTO_QUIZ && stageDto.requiredQuizId() != null) {
            Quiz quiz = quizRepository.findById(stageDto.requiredQuizId())
                .orElseThrow(() -> new ResourceNotFoundException("Quiz not found with id: " + stageDto.requiredQuizId()));
            stage.setRequiredQuiz(quiz.getId(), quiz.getTitle());
        } else {
            stage.setRequiredQuiz(null, null);
        }

        TherapyStageEntity updatedStage = therapyStageRepository.save(stage);
        log.info("Updated therapy stage with ID: {}", updatedStage.getId());

        return TherapyStageDto.fromStage(updatedStage);
    }

    /**
     * Delete a therapy stage.
     */
    public void deleteStage(UUID id) {
        log.info("Deleting therapy stage with ID: {}", id);

        TherapyStageEntity stage = therapyStageRepository.findById(id)
            .orElseThrow(() -> new ResourceNotFoundException("Therapy stage not found with id: " + id));

        therapyStageRepository.delete(stage);
        log.info("Deleted therapy stage with ID: {}", id);
    }

    /**
     * Reorder stages using drag & drop.
     */
    public List<TherapyStageDto> reorderStages(UUID projectId, List<UUID> stageIds) {
        log.info("Reordering stages for project: {}", projectId);

        List<TherapyStageEntity> stages = therapyStageRepository.findByProjectIdOrderByOrderIndex(projectId);

        // Create a map for quick lookup
        var stageMap = new java.util.HashMap<UUID, TherapyStageEntity>();
        for (TherapyStageEntity s : stages) {
            stageMap.put(s.getId(), s);
        }

        // Update order indices
        for (int i = 0; i < stageIds.size(); i++) {
            TherapyStageEntity stage = stageMap.get(stageIds.get(i));
            if (stage != null) {
                stage.setOrderIndex(i);
            }
        }

        List<TherapyStageEntity> savedStages = therapyStageRepository.saveAll(stages);
        log.info("Reordered {} stages", savedStages.size());

        return savedStages.stream()
            .sorted(Comparator.comparing(TherapyStageEntity::getOrderIndex))
            .map(TherapyStageDto::fromStage)
            .toList();
    }

    // ==================== Patient Stage Progress ====================

    /**
     * Initialize stage progress for a patient enrolling in a project.
     */
    public void initializePatientStages(UUID patientProjectId) {
        log.info("Initializing stage progress for patient project: {}", patientProjectId);

        // Get patient project to find project ID
        var patientProject = PatientProject.enroll(null, null);
        patientProject.setId(patientProjectId);

        // Get all stages for the project (we need to get project ID first from patientProject)
        // For now, we'll need to get this from the PatientProject entity
        // This method would be called after PatientProject is created

        List<TherapyStageEntity> stages = new ArrayList<>();
        // In real implementation, we'd fetch stages from the project

        for (TherapyStageEntity stage : stages) {
            PatientStageProgress progress = PatientStageProgress.create(patientProject, stage);

            // Unlock first stage automatically
            if (stage.getOrderIndex() == 0) {
                progress.unlock();
            }

            patientStageProgressRepository.save(progress);
        }

        log.info("Initialized {} stage progress records", stages.size());
    }

    /**
     * Get stage progress for a patient project.
     */
    @Transactional(readOnly = true)
    public List<PatientStageProgressDto> getPatientStageProgress(UUID patientProjectId) {
        log.debug("Finding stage progress for patient project: {}", patientProjectId);

        List<PatientStageProgress> progressList = patientStageProgressRepository.findByPatientProjectId(patientProjectId);

        return progressList.stream()
            .map(PatientStageProgressDto::fromProgress)
            .toList();
    }

    /**
     * Unlock a stage manually for a patient.
     */
    public PatientStageProgressDto unlockStage(UUID patientProjectId, UUID stageId, UUID unlockedBy) {
        log.info("Unlocking stage {} for patient project {}", stageId, patientProjectId);

        PatientStageProgress progress = patientStageProgressRepository
            .findByPatientProjectIdAndStageId(patientProjectId, stageId)
            .orElseThrow(() -> new ResourceNotFoundException(
                "Stage progress not found for patient project " + patientProjectId + " and stage " + stageId));

        progress.unlock();
        patientStageProgressRepository.save(progress);

        log.info("Unlocked stage {} for patient project {}", stageId, patientProjectId);

        return PatientStageProgressDto.fromProgress(progress);
    }

    /**
     * Complete a stage for a patient.
     */
    public PatientStageProgressDto completeStage(
        UUID patientProjectId,
        UUID stageId,
        UUID completedBy,
        String reason
    ) {
        log.info("Completing stage {} for patient project {}", stageId, patientProjectId);

        PatientStageProgress progress = patientStageProgressRepository
            .findByPatientProjectIdAndStageId(patientProjectId, stageId)
            .orElseThrow(() -> new ResourceNotFoundException(
                "Stage progress not found for patient project " + patientProjectId + " and stage " + stageId));

        progress.complete(completedBy, reason);
        patientStageProgressRepository.save(progress);

        // Auto-unlock next stage if exists
        unlockNextStage(patientProjectId, progress.getStage().getOrderIndex());

        log.info("Completed stage {} for patient project {}", stageId, patientProjectId);

        return PatientStageProgressDto.fromProgress(progress);
    }

    /**
     * Automatically unlock next stage after quiz completion.
     */
    public void onQuizPassed(UUID patientProjectId, UUID quizId) {
        log.info("Processing quiz pass for patient project {}, quiz {}", patientProjectId, quizId);

        // Find stages that require this quiz
        List<TherapyStageEntity> stages = therapyStageRepository.findByRequiredQuizQuizId(quizId);

        for (TherapyStageEntity stage : stages) {
            PatientStageProgress progress = patientStageProgressRepository
                .findByPatientProjectIdAndStageId(patientProjectId, stage.getId())
                .orElse(null);

            if (progress != null && !progress.isCompleted()) {
                progress.unlock();
                progress.complete(null, "AUTO_QUIZ_PASS");
                patientStageProgressRepository.save(progress);

                // Unlock next stage
                unlockNextStage(patientProjectId, stage.getOrderIndex());

                log.info("Auto-completed stage {} after quiz pass", stage.getId());
            }
        }
    }

    /**
     * Unlock the next stage after completing current one.
     */
    private void unlockNextStage(UUID patientProjectId, Integer currentOrderIndex) {
        List<PatientStageProgress> allProgress = patientStageProgressRepository.findByPatientProjectId(patientProjectId);

        // Find the next stage
        PatientStageProgress nextProgress = allProgress.stream()
            .filter(p -> p.getStage().getOrderIndex() == currentOrderIndex + 1)
            .filter(p -> !p.isUnlocked())
            .findFirst()
            .orElse(null);

        if (nextProgress != null) {
            nextProgress.unlock();
            patientStageProgressRepository.save(nextProgress);
            log.info("Auto-unlocked next stage {}", nextProgress.getStage().getId());
        }
    }

    /**
     * Check if a patient can access a material based on stage.
     */
    @Transactional(readOnly = true)
    public boolean canPatientAccessMaterial(UUID patientProjectId, UUID stageId) {
        log.debug("Checking material access for patient project {}, stage {}", patientProjectId, stageId);

        PatientStageProgress progress = patientStageProgressRepository
            .findByPatientProjectIdAndStageId(patientProjectId, stageId)
            .orElse(null);

        if (progress == null) {
            return false;
        }

        // Patient can access if stage is unlocked (available or completed)
        return progress.isUnlocked();
    }

    /**
     * Get current stage for a patient.
     */
    @Transactional(readOnly = true)
    public PatientStageProgressDto getCurrentStage(UUID patientProjectId) {
        log.debug("Finding current stage for patient project: {}", patientProjectId);

        // Find first available (unlocked but not completed) stage
        return patientStageProgressRepository
            .findFirstByPatientProjectIdAndStatusOrderByStageOrderIndex(patientProjectId, StageStatus.AVAILABLE)
            .map(PatientStageProgressDto::fromProgress)
            .orElse(null);
    }
}
