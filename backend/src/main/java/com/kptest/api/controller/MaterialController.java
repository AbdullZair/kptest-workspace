package com.kptest.api.controller;

import com.kptest.api.dto.EducationalMaterialDto;
import com.kptest.api.dto.MaterialFilters;
import com.kptest.api.dto.MaterialProgressDto;
import com.kptest.application.service.MaterialService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.net.URI;
import java.util.List;
import java.util.Map;
import java.util.UUID;

/**
 * Educational Material REST Controller.
 * Handles all material-related CRUD operations and patient progress tracking.
 */
@Slf4j
@RestController
@RequestMapping("/api/v1/materials")
@RequiredArgsConstructor
@Tag(name = "Educational Materials", description = "Educational material management endpoints")
public class MaterialController {

    private final MaterialService materialService;

    /**
     * Get all materials with filtering.
     */
    @GetMapping
    @PreAuthorize("hasAnyRole('ADMIN', 'DOCTOR', 'NURSE', 'RECEPTIONIST')")
    @Operation(summary = "Get all materials", description = "Returns a list of materials with optional filtering")
    public ResponseEntity<List<EducationalMaterialDto>> getMaterials(
        @Parameter(description = "Project ID to filter by")
        @RequestParam(required = false) UUID projectId,

        @Parameter(description = "Category to filter by")
        @RequestParam(required = false) String category,

        @Parameter(description = "Difficulty level to filter by")
        @RequestParam(required = false) EducationalMaterialDto.DifficultyLevel difficulty,

        @Parameter(description = "Material type to filter by")
        @RequestParam(required = false) EducationalMaterialDto.MaterialType type,

        @Parameter(description = "Published status to filter by")
        @RequestParam(required = false) Boolean published
    ) {
        log.info("GET /api/v1/materials - projectId={}, category={}, difficulty={}, type={}, published={}",
            projectId, category, difficulty, type, published);

        MaterialFilters filters = MaterialFilters.builder()
            .projectId(projectId)
            .category(category)
            .difficulty(difficulty)
            .type(type)
            .published(published)
            .build();

        List<EducationalMaterialDto> materials = materialService.getMaterials(filters);

        return ResponseEntity.ok(materials);
    }

    /**
     * Get material by ID.
     */
    @GetMapping("/{id}")
    @PreAuthorize("hasAnyRole('ADMIN', 'DOCTOR', 'NURSE', 'RECEPTIONIST')")
    @Operation(summary = "Get material by ID", description = "Returns detailed information about a specific material")
    public ResponseEntity<EducationalMaterialDto> getMaterialById(
        @Parameter(description = "Material ID")
        @PathVariable UUID id
    ) {
        log.info("GET /api/v1/materials/{}", id);

        EducationalMaterialDto material = materialService.getMaterialById(id);

        return ResponseEntity.ok(material);
    }

    /**
     * Create a new material.
     */
    @PostMapping
    @PreAuthorize("hasAnyRole('ADMIN', 'DOCTOR', 'NURSE')")
    @Operation(summary = "Create material", description = "Creates a new educational material")
    public ResponseEntity<EducationalMaterialDto> createMaterial(
        @Parameter(description = "Material data")
        @Valid @RequestBody EducationalMaterialDto materialDto
    ) {
        log.info("POST /api/v1/materials - title: {}", materialDto.title());

        EducationalMaterialDto createdMaterial = materialService.createMaterial(materialDto);

        return ResponseEntity
            .created(URI.create("/api/v1/materials/" + createdMaterial.id()))
            .body(createdMaterial);
    }

    /**
     * Update an existing material.
     */
    @PutMapping("/{id}")
    @PreAuthorize("hasAnyRole('ADMIN', 'DOCTOR', 'NURSE')")
    @Operation(summary = "Update material", description = "Updates an existing educational material")
    public ResponseEntity<EducationalMaterialDto> updateMaterial(
        @Parameter(description = "Material ID")
        @PathVariable UUID id,

        @Parameter(description = "Updated material data")
        @Valid @RequestBody EducationalMaterialDto materialDto
    ) {
        log.info("PUT /api/v1/materials/{}", id);

        EducationalMaterialDto updatedMaterial = materialService.updateMaterial(id, materialDto);

        return ResponseEntity.ok(updatedMaterial);
    }

    /**
     * Delete a material.
     */
    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    @Operation(summary = "Delete material", description = "Deletes an educational material")
    public ResponseEntity<Map<String, String>> deleteMaterial(
        @Parameter(description = "Material ID")
        @PathVariable UUID id
    ) {
        log.info("DELETE /api/v1/materials/{}", id);

        materialService.deleteMaterial(id);

        return ResponseEntity.ok(Map.of(
            "message", "Material deleted successfully",
            "id", id.toString()
        ));
    }

    /**
     * Publish a material.
     */
    @PostMapping("/{id}/publish")
    @PreAuthorize("hasAnyRole('ADMIN', 'DOCTOR', 'NURSE')")
    @Operation(summary = "Publish material", description = "Publishes an educational material")
    public ResponseEntity<EducationalMaterialDto> publishMaterial(
        @Parameter(description = "Material ID")
        @PathVariable UUID id
    ) {
        log.info("POST /api/v1/materials/{}/publish", id);

        EducationalMaterialDto publishedMaterial = materialService.publishMaterial(id);

        return ResponseEntity.ok(publishedMaterial);
    }

    /**
     * Unpublish a material.
     */
    @PostMapping("/{id}/unpublish")
    @PreAuthorize("hasAnyRole('ADMIN', 'DOCTOR', 'NURSE')")
    @Operation(summary = "Unpublish material", description = "Unpublishes an educational material")
    public ResponseEntity<EducationalMaterialDto> unpublishMaterial(
        @Parameter(description = "Material ID")
        @PathVariable UUID id
    ) {
        log.info("POST /api/v1/materials/{}/unpublish", id);

        EducationalMaterialDto unpublishedMaterial = materialService.unpublishMaterial(id);

        return ResponseEntity.ok(unpublishedMaterial);
    }

    /**
     * Record a view for a material.
     */
    @PostMapping("/{id}/view")
    @PreAuthorize("hasAnyRole('ADMIN', 'DOCTOR', 'NURSE', 'PATIENT')")
    @Operation(summary = "Record view", description = "Records a view for an educational material")
    public ResponseEntity<EducationalMaterialDto> recordView(
        @Parameter(description = "Material ID")
        @PathVariable UUID id,

        @Parameter(description = "Patient ID")
        @RequestParam UUID patientId
    ) {
        log.info("POST /api/v1/materials/{}/view - patientId: {}", id, patientId);

        EducationalMaterialDto material = materialService.recordView(id, patientId);

        return ResponseEntity.ok(material);
    }

    /**
     * Mark material as complete.
     */
    @PostMapping("/{id}/complete")
    @PreAuthorize("hasAnyRole('ADMIN', 'DOCTOR', 'NURSE', 'PATIENT')")
    @Operation(summary = "Mark as complete", description = "Marks an educational material as completed")
    public ResponseEntity<EducationalMaterialDto> markAsComplete(
        @Parameter(description = "Material ID")
        @PathVariable UUID id,

        @Parameter(description = "Patient ID")
        @RequestParam UUID patientId,

        @Parameter(description = "Quiz score (optional)")
        @RequestParam(required = false) Integer quizScore
    ) {
        log.info("POST /api/v1/materials/{}/complete - patientId: {}, quizScore: {}", id, patientId, quizScore);

        EducationalMaterialDto material = materialService.markAsComplete(id, patientId, quizScore);

        return ResponseEntity.ok(material);
    }

    /**
     * Get materials for current patient.
     */
    @GetMapping("/my")
    @PreAuthorize("hasAnyRole('PATIENT')")
    @Operation(summary = "Get my materials", description = "Returns materials assigned to the current patient")
    public ResponseEntity<List<EducationalMaterialDto>> getMyMaterials(
        @Parameter(description = "Patient ID")
        @RequestParam UUID patientId
    ) {
        log.info("GET /api/v1/materials/my - patientId: {}", patientId);

        List<EducationalMaterialDto> materials = materialService.getPatientMaterials(patientId);

        return ResponseEntity.ok(materials);
    }

    /**
     * Get patient progress for all materials.
     */
    @GetMapping("/progress")
    @PreAuthorize("hasAnyRole('ADMIN', 'DOCTOR', 'NURSE', 'PATIENT')")
    @Operation(summary = "Get progress", description = "Returns progress for all materials for a patient")
    public ResponseEntity<List<MaterialProgressDto>> getProgress(
        @Parameter(description = "Patient ID")
        @RequestParam UUID patientId
    ) {
        log.info("GET /api/v1/materials/progress - patientId: {}", patientId);

        List<MaterialProgressDto> progress = materialService.getPatientProgress(patientId);

        return ResponseEntity.ok(progress);
    }
}
