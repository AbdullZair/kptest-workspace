package com.kptest.application.service;

import com.kptest.api.dto.TherapyStageDto;
import com.kptest.domain.project.PatientProject;
import com.kptest.domain.project.TherapyStageEntity;
import com.kptest.domain.project.TherapyStageEntity.UnlockMode;
import com.kptest.domain.project.repository.PatientStageProgressRepository;
import com.kptest.domain.project.repository.TherapyStageRepository;
import com.kptest.exception.ResourceNotFoundException;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

import static org.assertj.core.api.Assertions.*;
import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.*;

/**
 * Unit tests for TherapyStageService
 */
@ExtendWith(MockitoExtension.class)
class TherapyStageServiceTest {

    @Mock
    private TherapyStageRepository therapyStageRepository;

    @Mock
    private PatientStageProgressRepository patientStageProgressRepository;

    @InjectMocks
    private TherapyStageService therapyStageService;

    private UUID stageId;
    private UUID projectId;
    private UUID patientProjectId;
    private UUID userId;
    private TherapyStageEntity stage;

    @BeforeEach
    void setUp() {
        stageId = UUID.randomUUID();
        projectId = UUID.randomUUID();
        patientProjectId = UUID.randomUUID();
        userId = UUID.randomUUID();

        stage = new TherapyStageEntity();
        stage.setId(stageId);
        stage.setName("Stage 1");
        stage.setDescription("First stage");
        stage.setProjectId(projectId);
        stage.setOrderIndex(0);
        stage.setUnlockMode(UnlockMode.MANUAL);
        stage.setActive(true);
        stage.setCreatedBy(userId);
    }

    @Test
    @DisplayName("Should get stages by project")
    void getStagesByProject_ShouldReturnStages() {
        // Given
        when(therapyStageRepository.findByProjectIdOrderByOrderIndex(projectId))
            .thenReturn(List.of(stage));

        // When
        List<TherapyStageDto> result = therapyStageService.getStagesByProject(projectId);

        // Then
        assertThat(result).hasSize(1);
        assertThat(result.get(0).id()).isEqualTo(stageId);
        verify(therapyStageRepository).findByProjectIdOrderByOrderIndex(projectId);
    }

    @Test
    @DisplayName("Should get stage by ID")
    void getStageById_ShouldReturnStage() {
        // Given
        when(therapyStageRepository.findById(stageId)).thenReturn(Optional.of(stage));

        // When
        TherapyStageDto result = therapyStageService.getStageById(stageId);

        // Then
        assertThat(result.id()).isEqualTo(stageId);
        assertThat(result.name()).isEqualTo("Stage 1");
        verify(therapyStageRepository).findById(stageId);
    }

    @Test
    @DisplayName("Should throw exception when stage not found")
    void getStageById_ShouldThrowException_WhenNotFound() {
        // Given
        when(therapyStageRepository.findById(stageId)).thenReturn(Optional.empty());

        // When & Then
        assertThatThrownBy(() -> therapyStageService.getStageById(stageId))
            .isInstanceOf(ResourceNotFoundException.class)
            .hasMessageContaining("Therapy stage not found");
    }

    @Test
    @DisplayName("Should create stage")
    void createStage_ShouldReturnCreatedStage() {
        // Given
        TherapyStageDto dto = new TherapyStageDto(
            null, "New Stage", "Description", projectId, null,
            UnlockMode.MANUAL, null, null, true, userId, null, null
        );
        when(therapyStageRepository.findMaxOrderIndexByProjectId(projectId)).thenReturn(0);
        when(therapyStageRepository.save(any(TherapyStageEntity.class)))
            .thenAnswer(i -> i.getArguments()[0]);

        // When
        TherapyStageDto result = therapyStageService.createStage(dto);

        // Then
        assertThat(result.name()).isEqualTo("New Stage");
        assertThat(result.orderIndex()).isEqualTo(1);
        verify(therapyStageRepository).save(any(TherapyStageEntity.class));
    }

    @Test
    @DisplayName("Should update stage")
    void updateStage_ShouldReturnUpdatedStage() {
        // Given
        when(therapyStageRepository.findById(stageId)).thenReturn(Optional.of(stage));
        when(therapyStageRepository.save(any(TherapyStageEntity.class)))
            .thenAnswer(i -> i.getArguments()[0]);

        TherapyStageDto updateDto = new TherapyStageDto(
            null, "Updated Stage", null, null, null,
            UnlockMode.AUTO_QUIZ, null, null, null, null, null, null
        );

        // When
        TherapyStageDto result = therapyStageService.updateStage(stageId, updateDto);

        // Then
        assertThat(result.name()).isEqualTo("Updated Stage");
        assertThat(result.unlockMode()).isEqualTo(UnlockMode.AUTO_QUIZ);
        verify(therapyStageRepository).save(stage);
    }

    @Test
    @DisplayName("Should delete stage")
    void deleteStage_ShouldDeleteStage() {
        // Given
        when(therapyStageRepository.findById(stageId)).thenReturn(Optional.of(stage));

        // When
        therapyStageService.deleteStage(stageId);

        // Then
        verify(therapyStageRepository).delete(stage);
    }

    @Test
    @DisplayName("Should reorder stages")
    void reorderStages_ShouldReorderStages() {
        // Given
        TherapyStageEntity stage1 = createStage("Stage 1", 0);
        TherapyStageEntity stage2 = createStage("Stage 2", 1);
        TherapyStageEntity stage3 = createStage("Stage 3", 2);

        when(therapyStageRepository.findByProjectIdOrderByOrderIndex(projectId))
            .thenReturn(List.of(stage1, stage2, stage3));
        when(therapyStageRepository.saveAll(anyList()))
            .thenAnswer(i -> i.getArguments()[0]);

        List<UUID> newOrder = List.of(stage3.getId(), stage1.getId(), stage2.getId());

        // When
        List<TherapyStageDto> result = therapyStageService.reorderStages(projectId, newOrder);

        // Then
        assertThat(result).hasSize(3);
        assertThat(result.get(0).name()).isEqualTo("Stage 3");
        verify(therapyStageRepository).saveAll(anyList());
    }

    @Test
    @DisplayName("Should get patient stage progress")
    void getPatientStageProgress_ShouldReturnProgress() {
        // Given
        var progress = new com.kptest.domain.project.PatientStageProgress();
        progress.setId(UUID.randomUUID());
        progress.setPatientProject(new PatientProject());
        progress.getPatientProject().setId(patientProjectId);
        progress.setStage(stage);

        when(patientStageProgressRepository.findByPatientProjectId(patientProjectId))
            .thenReturn(List.of(progress));

        // When
        var result = therapyStageService.getPatientStageProgress(patientProjectId);

        // Then
        assertThat(result).hasSize(1);
        verify(patientStageProgressRepository).findByPatientProjectId(patientProjectId);
    }

    @Test
    @DisplayName("Should unlock stage for patient")
    void unlockStage_ShouldUnlockStage() {
        // Given
        var progress = new com.kptest.domain.project.PatientStageProgress();
        progress.setId(UUID.randomUUID());
        progress.setPatientProject(new PatientProject());
        progress.getPatientProject().setId(patientProjectId);
        progress.setStage(stage);

        when(patientStageProgressRepository.findByPatientProjectIdAndStageId(patientProjectId, stageId))
            .thenReturn(Optional.of(progress));
        when(patientStageProgressRepository.save(any()))
            .thenAnswer(i -> i.getArguments()[0]);

        // When
        var result = therapyStageService.unlockStage(patientProjectId, stageId, userId);

        // Then
        assertThat(result).isNotNull();
        verify(patientStageProgressRepository).save(progress);
    }

    @Test
    @DisplayName("Should complete stage for patient")
    void completeStage_ShouldCompleteStage() {
        // Given
        var progress = new com.kptest.domain.project.PatientStageProgress();
        progress.setId(UUID.randomUUID());
        progress.setPatientProject(new PatientProject());
        progress.getPatientProject().setId(patientProjectId);
        progress.setStage(stage);

        when(patientStageProgressRepository.findByPatientProjectIdAndStageId(patientProjectId, stageId))
            .thenReturn(Optional.of(progress));
        when(patientStageProgressRepository.save(any()))
            .thenAnswer(i -> i.getArguments()[0]);
        when(patientStageProgressRepository.findByPatientProjectId(patientProjectId))
            .thenReturn(List.of(progress));

        // When
        var result = therapyStageService.completeStage(patientProjectId, stageId, userId, "Completed");

        // Then
        assertThat(result).isNotNull();
        verify(patientStageProgressRepository).save(progress);
    }

    private TherapyStageEntity createStage(String name, int orderIndex) {
        TherapyStageEntity s = new TherapyStageEntity();
        s.setId(UUID.randomUUID());
        s.setName(name);
        s.setProjectId(projectId);
        s.setOrderIndex(orderIndex);
        s.setUnlockMode(UnlockMode.MANUAL);
        s.setActive(true);
        return s;
    }
}
