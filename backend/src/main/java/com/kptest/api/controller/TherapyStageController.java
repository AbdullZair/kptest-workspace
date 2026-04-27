package com.kptest.api.controller;

import com.kptest.api.dto.PatientStageProgressDto;
import com.kptest.api.dto.TherapyStageDto;
import com.kptest.application.service.TherapyStageService;
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
 * REST Controller for Therapy Stage management.
 */
@Slf4j
@RestController
@RequestMapping("/api/v1/therapy-stages")
@RequiredArgsConstructor
@Tag(name = "Therapy Stages", description = "Therapy stage management endpoints")
public class TherapyStageController {

    private final TherapyStageService therapyStageService;

    // ==================== Therapy Stage CRUD ====================

    /**
     * Get all stages for a project.
     */
    @GetMapping
    @PreAuthorize("hasAnyRole('ADMIN', 'DOCTOR', 'NURSE', 'RECEPTIONIST')")
    @Operation(summary = "Get stages by project", description = "Returns all therapy stages for a project")
    public ResponseEntity<List<TherapyStageDto>> getStagesByProject(
        @Parameter(description = "Project ID")
        @RequestParam UUID projectId
    ) {
        log.info("GET /api/v1/therapy-stages - projectId={}", projectId);

        List<TherapyStageDto> stages = therapyStageService.getStagesByProject(projectId);

        return ResponseEntity.ok(stages);
    }

    /**
     * Get stage by ID.
     */
    @GetMapping("/{id}")
    @PreAuthorize("hasAnyRole('ADMIN', 'DOCTOR', 'NURSE', 'RECEPTIONIST')")
    @Operation(summary = "Get stage by ID", description = "Returns detailed information about a therapy stage")
    public ResponseEntity<TherapyStageDto> getStageById(
        @Parameter(description = "Stage ID")
        @PathVariable UUID id
    ) {
        log.info("GET /api/v1/therapy-stages/{}", id);

        TherapyStageDto stage = therapyStageService.getStageById(id);

        return ResponseEntity.ok(stage);
    }

    /**
     * Create a new therapy stage.
     */
    @PostMapping
    @PreAuthorize("hasAnyRole('ADMIN', 'DOCTOR', 'NURSE')")
    @Operation(summary = "Create therapy stage", description = "Creates a new therapy stage")
    public ResponseEntity<TherapyStageDto> createStage(
        @Parameter(description = "Stage data")
        @Valid @RequestBody TherapyStageDto stageDto
    ) {
        log.info("POST /api/v1/therapy-stages - name: {}", stageDto.name());

        TherapyStageDto createdStage = therapyStageService.createStage(stageDto);

        return ResponseEntity
            .created(URI.create("/api/v1/therapy-stages/" + createdStage.id()))
            .body(createdStage);
    }

    /**
     * Update an existing therapy stage.
     */
    @PutMapping("/{id}")
    @PreAuthorize("hasAnyRole('ADMIN', 'DOCTOR', 'NURSE')")
    @Operation(summary = "Update therapy stage", description = "Updates an existing therapy stage")
    public ResponseEntity<TherapyStageDto> updateStage(
        @Parameter(description = "Stage ID")
        @PathVariable UUID id,

        @Parameter(description = "Updated stage data")
        @Valid @RequestBody TherapyStageDto stageDto
    ) {
        log.info("PUT /api/v1/therapy-stages/{}", id);

        TherapyStageDto updatedStage = therapyStageService.updateStage(id, stageDto);

        return ResponseEntity.ok(updatedStage);
    }

    /**
     * Delete a therapy stage.
     */
    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    @Operation(summary = "Delete therapy stage", description = "Deletes a therapy stage")
    public ResponseEntity<Map<String, String>> deleteStage(
        @Parameter(description = "Stage ID")
        @PathVariable UUID id
    ) {
        log.info("DELETE /api/v1/therapy-stages/{}", id);

        therapyStageService.deleteStage(id);

        return ResponseEntity.ok(Map.of(
            "message", "Therapy stage deleted successfully",
            "id", id.toString()
        ));
    }

    /**
     * Reorder stages (drag & drop).
     */
    @PostMapping("/reorder")
    @PreAuthorize("hasAnyRole('ADMIN', 'DOCTOR', 'NURSE')")
    @Operation(summary = "Reorder stages", description = "Reorders therapy stages using drag & drop")
    public ResponseEntity<List<TherapyStageDto>> reorderStages(
        @Parameter(description = "Project ID")
        @RequestParam UUID projectId,

        @Parameter(description = "Ordered list of stage IDs")
        @RequestBody List<UUID> stageIds
    ) {
        log.info("POST /api/v1/therapy-stages/reorder - projectId={}, stages={}", projectId, stageIds.size());

        List<TherapyStageDto> stages = therapyStageService.reorderStages(projectId, stageIds);

        return ResponseEntity.ok(stages);
    }

    // ==================== Patient Stage Progress ====================

    /**
     * Get stage progress for a patient project.
     */
    @GetMapping("/progress")
    @PreAuthorize("hasAnyRole('ADMIN', 'DOCTOR', 'NURSE', 'PATIENT')")
    @Operation(summary = "Get patient stage progress", description = "Returns stage progress for a patient project")
    public ResponseEntity<List<PatientStageProgressDto>> getPatientStageProgress(
        @Parameter(description = "Patient project ID")
        @RequestParam UUID patientProjectId
    ) {
        log.info("GET /api/v1/therapy-stages/progress - patientProjectId={}", patientProjectId);

        List<PatientStageProgressDto> progress = therapyStageService.getPatientStageProgress(patientProjectId);

        return ResponseEntity.ok(progress);
    }

    /**
     * Unlock a stage manually.
     */
    @PostMapping("/progress/unlock")
    @PreAuthorize("hasAnyRole('ADMIN', 'DOCTOR', 'NURSE')")
    @Operation(summary = "Unlock stage", description = "Manually unlocks a stage for a patient")
    public ResponseEntity<PatientStageProgressDto> unlockStage(
        @Parameter(description = "Patient project ID")
        @RequestParam UUID patientProjectId,

        @Parameter(description = "Stage ID")
        @RequestParam UUID stageId
    ) {
        log.info("POST /api/v1/therapy-stages/progress/unlock - patientProjectId={}, stageId={}", patientProjectId, stageId);

        // In real app, userId would come from authentication context
        UUID unlockedBy = patientProjectId; // Placeholder

        PatientStageProgressDto progress = therapyStageService.unlockStage(patientProjectId, stageId, unlockedBy);

        return ResponseEntity.ok(progress);
    }

    /**
     * Complete a stage.
     */
    @PostMapping("/progress/complete")
    @PreAuthorize("hasAnyRole('ADMIN', 'DOCTOR', 'NURSE')")
    @Operation(summary = "Complete stage", description = "Marks a stage as completed for a patient")
    public ResponseEntity<PatientStageProgressDto> completeStage(
        @Parameter(description = "Patient project ID")
        @RequestParam UUID patientProjectId,

        @Parameter(description = "Stage ID")
        @RequestParam UUID stageId,

        @Parameter(description = "Completion reason")
        @RequestParam(required = false) String reason
    ) {
        log.info("POST /api/v1/therapy-stages/progress/complete - patientProjectId={}, stageId={}", patientProjectId, stageId);

        // In real app, userId would come from authentication context
        UUID completedBy = patientProjectId; // Placeholder

        PatientStageProgressDto progress = therapyStageService.completeStage(patientProjectId, stageId, completedBy, reason);

        return ResponseEntity.ok(progress);
    }

    /**
     * Get current stage for a patient.
     */
    @GetMapping("/progress/current")
    @PreAuthorize("hasAnyRole('ADMIN', 'DOCTOR', 'NURSE', 'PATIENT')")
    @Operation(summary = "Get current stage", description = "Returns the current stage for a patient project")
    public ResponseEntity<PatientStageProgressDto> getCurrentStage(
        @Parameter(description = "Patient project ID")
        @RequestParam UUID patientProjectId
    ) {
        log.info("GET /api/v1/therapy-stages/progress/current - patientProjectId={}", patientProjectId);

        PatientStageProgressDto currentStage = therapyStageService.getCurrentStage(patientProjectId);

        if (currentStage != null) {
            return ResponseEntity.ok(currentStage);
        } else {
            return ResponseEntity.noContent().build();
        }
    }
}
