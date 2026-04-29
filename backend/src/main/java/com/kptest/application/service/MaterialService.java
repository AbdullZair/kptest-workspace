package com.kptest.application.service;

import com.kptest.api.dto.EducationalMaterialDto;
import com.kptest.api.dto.MaterialFilters;
import com.kptest.api.dto.MaterialProgressDto;
import com.kptest.api.dto.PushPayload;
import com.kptest.domain.material.EducationalMaterial;
import com.kptest.domain.material.EducationalMaterial.DifficultyLevel;
import com.kptest.domain.material.EducationalMaterial.MaterialType;
import com.kptest.domain.material.MaterialProgress;
import com.kptest.domain.material.repository.EducationalMaterialRepository;
import com.kptest.domain.material.repository.MaterialProgressRepository;
import com.kptest.domain.patient.PatientRepository;
import com.kptest.exception.ResourceNotFoundException;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Instant;
import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.UUID;

/**
 * Material service handling all educational material operations.
 */
@Slf4j
@Service
@RequiredArgsConstructor
@Transactional
public class MaterialService {

    private final EducationalMaterialRepository materialRepository;
    private final MaterialProgressRepository progressRepository;
    private final PatientRepository patientRepository;
    private final NotificationService notificationService;

    /**
     * Get materials with filters.
     *
     * @param filters Search filters
     * @return List of materials
     */
    @Transactional(readOnly = true)
    public List<EducationalMaterialDto> getMaterials(MaterialFilters filters) {
        log.debug("Finding materials with filters: {}", filters);

        UUID projectId = filters.projectId();
        if (projectId == null) {
            throw new IllegalArgumentException("Project ID is required");
        }

        List<EducationalMaterial> materials = materialRepository.findAllWithFilters(
            projectId,
            filters.category(),
            filters.difficulty(),
            filters.type(),
            filters.published(),
            Pageable.unpaged()
        );

        return materials.stream()
            .map(EducationalMaterialDto::fromMaterial)
            .toList();
    }

    /**
     * Get material by ID.
     *
     * @param id Material ID
     * @return Material DTO
     * @throws ResourceNotFoundException if material not found
     */
    @Transactional(readOnly = true)
    public EducationalMaterialDto getMaterialById(UUID id) {
        log.debug("Finding material by ID: {}", id);

        EducationalMaterial material = materialRepository.findById(id)
            .orElseThrow(() -> new ResourceNotFoundException("Material not found with id: " + id));

        return EducationalMaterialDto.fromMaterial(material);
    }

    /**
     * Create a new material.
     *
     * @param materialDto Material DTO
     * @return Created material DTO
     */
    public EducationalMaterialDto createMaterial(EducationalMaterialDto materialDto) {
        log.info("Creating material with title: {}", materialDto.title());

        // Validate material type and URLs
        validateMaterialUrls(materialDto);

        // Wymagane created_by — jeśli klient nie podał, ustal z SecurityContext.
        java.util.UUID createdBy = materialDto.createdBy();
        if (createdBy == null) {
            var auth = org.springframework.security.core.context.SecurityContextHolder
                .getContext().getAuthentication();
            if (auth != null && auth.getPrincipal() instanceof String userIdStr) {
                try { createdBy = java.util.UUID.fromString(userIdStr); }
                catch (IllegalArgumentException ignored) { /* leave null */ }
            }
        }

        // Create material
        EducationalMaterial material = EducationalMaterial.create(
            materialDto.projectId(),
            materialDto.title(),
            materialDto.content(),
            materialDto.type(),
            materialDto.category(),
            materialDto.difficulty(),
            createdBy
        );

        // Set optional fields
        if (materialDto.fileUrl() != null) {
            material.setFileUrl(materialDto.fileUrl());
        }
        if (materialDto.externalUrl() != null) {
            material.setExternalUrl(materialDto.externalUrl());
        }
        if (materialDto.assignedToPatients() != null) {
            material.setAssignedToPatients(materialDto.assignedToPatients());
        }
        if (materialDto.assignedToStages() != null) {
            material.setAssignedToStages(materialDto.assignedToStages());
        }
        if (materialDto.published() != null && materialDto.published()) {
            material.publish();
        }

        EducationalMaterial savedMaterial = materialRepository.save(material);
        log.info("Created material with ID: {}", savedMaterial.getId());

        // Send push notification to assigned patients
        if (materialDto.assignedToPatients() != null && !materialDto.assignedToPatients().isEmpty()) {
            for (UUID patientId : materialDto.assignedToPatients()) {
                notificationService.sendPushNotification(
                    patientId,
                    new PushPayload(
                        "Nowy materiał",
                        materialDto.title(),
                        Map.of("materialId", savedMaterial.getId().toString()),
                        PushPayload.PushType.MATERIAL
                    )
                );
            }
        }

        return EducationalMaterialDto.fromMaterial(savedMaterial);
    }

    /**
     * Update an existing material.
     *
     * @param id Material ID
     * @param materialDto Material DTO with updated data
     * @return Updated material DTO
     * @throws ResourceNotFoundException if material not found
     */
    public EducationalMaterialDto updateMaterial(UUID id, EducationalMaterialDto materialDto) {
        log.info("Updating material with ID: {}", id);

        EducationalMaterial material = materialRepository.findById(id)
            .orElseThrow(() -> new ResourceNotFoundException("Material not found with id: " + id));

        // Update fields
        if (materialDto.title() != null) {
            material.setTitle(materialDto.title());
        }
        if (materialDto.content() != null) {
            material.setContent(materialDto.content());
        }
        if (materialDto.type() != null) {
            material.setType(materialDto.type());
        }
        if (materialDto.category() != null) {
            material.setCategory(materialDto.category());
        }
        if (materialDto.difficulty() != null) {
            material.setDifficulty(materialDto.difficulty());
        }
        if (materialDto.fileUrl() != null) {
            material.setFileUrl(materialDto.fileUrl());
        }
        if (materialDto.externalUrl() != null) {
            material.setExternalUrl(materialDto.externalUrl());
        }
        if (materialDto.assignedToPatients() != null) {
            material.setAssignedToPatients(materialDto.assignedToPatients());
        }
        if (materialDto.assignedToStages() != null) {
            material.setAssignedToStages(materialDto.assignedToStages());
        }

        EducationalMaterial updatedMaterial = materialRepository.save(material);
        log.info("Updated material with ID: {}", updatedMaterial.getId());

        return EducationalMaterialDto.fromMaterial(updatedMaterial);
    }

    /**
     * Delete a material.
     *
     * @param id Material ID
     * @throws ResourceNotFoundException if material not found
     */
    public void deleteMaterial(UUID id) {
        log.info("Deleting material with ID: {}", id);

        EducationalMaterial material = materialRepository.findById(id)
            .orElseThrow(() -> new ResourceNotFoundException("Material not found with id: " + id));

        // Delete associated progress records
        List<MaterialProgress> progressRecords = progressRepository.findByMaterialId(id);
        progressRepository.deleteAll(progressRecords);

        // Delete material
        materialRepository.delete(material);

        log.info("Deleted material with ID: {}", id);
    }

    /**
     * Publish a material.
     *
     * @param id Material ID
     * @return Published material DTO
     * @throws ResourceNotFoundException if material not found
     */
    public EducationalMaterialDto publishMaterial(UUID id) {
        log.info("Publishing material with ID: {}", id);

        EducationalMaterial material = materialRepository.findById(id)
            .orElseThrow(() -> new ResourceNotFoundException("Material not found with id: " + id));

        material.publish();

        EducationalMaterial publishedMaterial = materialRepository.save(material);
        log.info("Published material with ID: {}", publishedMaterial.getId());

        return EducationalMaterialDto.fromMaterial(publishedMaterial);
    }

    /**
     * Unpublish a material.
     *
     * @param id Material ID
     * @return Unpublished material DTO
     * @throws ResourceNotFoundException if material not found
     */
    public EducationalMaterialDto unpublishMaterial(UUID id) {
        log.info("Unpublishing material with ID: {}", id);

        EducationalMaterial material = materialRepository.findById(id)
            .orElseThrow(() -> new ResourceNotFoundException("Material not found with id: " + id));

        material.unpublish();

        EducationalMaterial unpublishedMaterial = materialRepository.save(material);
        log.info("Unpublished material with ID: {}", unpublishedMaterial.getId());

        return EducationalMaterialDto.fromMaterial(unpublishedMaterial);
    }

    /**
     * Record a view for a material.
     *
     * @param materialId Material ID
     * @param patientId Patient ID
     * @return Material DTO
     */
    public EducationalMaterialDto recordView(UUID materialId, UUID patientId) {
        log.info("Recording view for material: {}, patient: {}", materialId, patientId);

        EducationalMaterial material = materialRepository.findById(materialId)
            .orElseThrow(() -> new ResourceNotFoundException("Material not found with id: " + materialId));

        // Increment view count
        material.incrementViewCount();

        // Create or update progress
        MaterialProgress progress = getOrCreateProgress(materialId, patientId);
        progress.start();

        materialRepository.save(material);
        progressRepository.save(progress);

        return EducationalMaterialDto.fromMaterial(material);
    }

    /**
     * Mark material as complete for a patient.
     *
     * @param materialId Material ID
     * @param patientId Patient ID
     * @param quizScore Optional quiz score
     * @return Material DTO
     */
    public EducationalMaterialDto markAsComplete(UUID materialId, UUID patientId, Integer quizScore) {
        log.info("Marking material as complete for material: {}, patient: {}", materialId, patientId);

        EducationalMaterial material = materialRepository.findById(materialId)
            .orElseThrow(() -> new ResourceNotFoundException("Material not found with id: " + materialId));

        // Increment completion count
        material.incrementCompletionCount();

        // Update progress
        MaterialProgress progress = getOrCreateProgress(materialId, patientId);
        progress.complete(quizScore);

        materialRepository.save(material);
        progressRepository.save(progress);

        return EducationalMaterialDto.fromMaterial(material);
    }

    /**
     * Get materials for a patient.
     *
     * @param patientId Patient ID
     * @return List of materials
     */
    @Transactional(readOnly = true)
    public List<EducationalMaterialDto> getPatientMaterials(UUID patientId) {
        log.debug("Finding materials for patient: {}", patientId);

        // Find patient to get project
        var patient = patientRepository.findById(patientId)
            .orElseThrow(() -> new ResourceNotFoundException("Patient not found with id: " + patientId));

        // Get patient's project
        var patientProjects = patientRepository.findAllWithFilters(
            null, null, null, null, null, Pageable.unpaged()
        );

        // For now, get all published materials (in real app, filter by patient's project)
        List<EducationalMaterial> materials = materialRepository.findAllWithFilters(
            null, null, null, null, true, Pageable.unpaged()
        );

        return materials.stream()
            .map(EducationalMaterialDto::fromMaterial)
            .toList();
    }

    /**
     * Get patient progress for all materials.
     *
     * @param patientId Patient ID
     * @return List of progress records
     */
    @Transactional(readOnly = true)
    public List<MaterialProgressDto> getPatientProgress(UUID patientId) {
        log.debug("Finding progress for patient: {}", patientId);

        List<MaterialProgress> progressRecords = progressRepository.findByPatientId(patientId);

        return progressRecords.stream()
            .map(MaterialProgressDto::fromProgress)
            .toList();
    }

    /**
     * Get progress for a specific material and patient.
     *
     * @param materialId Material ID
     * @param patientId Patient ID
     * @return Progress DTO or null if not found
     */
    @Transactional(readOnly = true)
    public MaterialProgressDto getProgress(UUID materialId, UUID patientId) {
        log.debug("Finding progress for material: {}, patient: {}", materialId, patientId);

        return progressRepository.findByMaterialIdAndPatientId(materialId, patientId)
            .map(MaterialProgressDto::fromProgress)
            .orElse(null);
    }

    /**
     * Get or create progress record.
     */
    private MaterialProgress getOrCreateProgress(UUID materialId, UUID patientId) {
        return progressRepository.findByMaterialIdAndPatientId(materialId, patientId)
            .orElseGet(() -> {
                MaterialProgress progress = MaterialProgress.create(materialId, patientId);
                return progressRepository.save(progress);
            });
    }

    /**
     * Validate material URLs based on type.
     */
    private void validateMaterialUrls(EducationalMaterialDto materialDto) {
        MaterialType type = materialDto.type();
        String fileUrl = materialDto.fileUrl();
        String externalUrl = materialDto.externalUrl();

        switch (type) {
            case PDF, IMAGE, VIDEO, AUDIO -> {
                if (fileUrl == null || fileUrl.isBlank()) {
                    throw new IllegalArgumentException("File URL is required for " + type + " materials");
                }
            }
            case LINK -> {
                if (externalUrl == null || externalUrl.isBlank()) {
                    throw new IllegalArgumentException("External URL is required for LINK materials");
                }
            }
            case ARTICLE -> {
                // Article content is in the content field, no URL required
            }
        }
    }
}
