package com.kptest.api.controller;

import com.kptest.api.dto.BadgeDto;
import com.kptest.api.dto.PatientBadgeDto;
import com.kptest.application.service.BadgeService;
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
 * REST Controller for Badge management.
 */
@Slf4j
@RestController
@RequestMapping("/api/v1/badges")
@RequiredArgsConstructor
@Tag(name = "Badges", description = "Gamification badge management endpoints")
public class BadgeController {

    private final BadgeService badgeService;

    // ==================== Badge CRUD ====================

    /**
     * Get all badges (admin view).
     */
    @GetMapping
    @PreAuthorize("hasAnyRole('ADMIN', 'DOCTOR', 'NURSE', 'RECEPTIONIST')")
    @Operation(summary = "Get all badges", description = "Returns all active badges")
    public ResponseEntity<List<BadgeDto>> getAllBadges() {
        log.info("GET /api/v1/badges");

        List<BadgeDto> badges = badgeService.getAllBadges();

        return ResponseEntity.ok(badges);
    }

    /**
     * Get visible badges (patient view).
     */
    @GetMapping("/visible")
    @PreAuthorize("hasAnyRole('PATIENT')")
    @Operation(summary = "Get visible badges", description = "Returns all visible badges for patients")
    public ResponseEntity<List<BadgeDto>> getVisibleBadges() {
        log.info("GET /api/v1/badges/visible");

        List<BadgeDto> badges = badgeService.getVisibleBadges();

        return ResponseEntity.ok(badges);
    }

    /**
     * Get badge by ID.
     */
    @GetMapping("/{id}")
    @PreAuthorize("hasAnyRole('ADMIN', 'DOCTOR', 'NURSE', 'RECEPTIONIST')")
    @Operation(summary = "Get badge by ID", description = "Returns detailed information about a badge")
    public ResponseEntity<BadgeDto> getBadgeById(
        @Parameter(description = "Badge ID")
        @PathVariable UUID id
    ) {
        log.info("GET /api/v1/badges/{}", id);

        BadgeDto badge = badgeService.getBadgeById(id);

        return ResponseEntity.ok(badge);
    }

    /**
     * Create a new badge.
     */
    @PostMapping
    @PreAuthorize("hasRole('ADMIN')")
    @Operation(summary = "Create badge", description = "Creates a new gamification badge")
    public ResponseEntity<BadgeDto> createBadge(
        @Parameter(description = "Badge data")
        @Valid @RequestBody BadgeDto badgeDto
    ) {
        log.info("POST /api/v1/badges - name: {}", badgeDto.name());

        BadgeDto createdBadge = badgeService.createBadge(badgeDto);

        return ResponseEntity
            .created(URI.create("/api/v1/badges/" + createdBadge.id()))
            .body(createdBadge);
    }

    /**
     * Update an existing badge.
     */
    @PutMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    @Operation(summary = "Update badge", description = "Updates an existing badge")
    public ResponseEntity<BadgeDto> updateBadge(
        @Parameter(description = "Badge ID")
        @PathVariable UUID id,

        @Parameter(description = "Updated badge data")
        @Valid @RequestBody BadgeDto badgeDto
    ) {
        log.info("PUT /api/v1/badges/{}", id);

        BadgeDto updatedBadge = badgeService.updateBadge(id, badgeDto);

        return ResponseEntity.ok(updatedBadge);
    }

    /**
     * Delete a badge.
     */
    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    @Operation(summary = "Delete badge", description = "Deletes a badge")
    public ResponseEntity<Map<String, String>> deleteBadge(
        @Parameter(description = "Badge ID")
        @PathVariable UUID id
    ) {
        log.info("DELETE /api/v1/badges/{}", id);

        badgeService.deleteBadge(id);

        return ResponseEntity.ok(Map.of(
            "message", "Badge deleted successfully",
            "id", id.toString()
        ));
    }

    // ==================== Patient Badges ====================

    /**
     * Get badges earned by a patient.
     */
    @GetMapping("/my")
    @PreAuthorize("hasAnyRole('PATIENT')")
    @Operation(summary = "Get my badges", description = "Returns all badges earned by the current patient")
    public ResponseEntity<List<PatientBadgeDto>> getMyBadges(
        @Parameter(description = "Patient ID")
        @RequestParam UUID patientId
    ) {
        log.info("GET /api/v1/badges/my - patientId={}", patientId);

        List<PatientBadgeDto> badges = badgeService.getPatientBadges(patientId);

        return ResponseEntity.ok(badges);
    }

    /**
     * Get badges for a patient (staff view).
     */
    @GetMapping("/patient/{patientId}")
    @PreAuthorize("hasAnyRole('ADMIN', 'DOCTOR', 'NURSE')")
    @Operation(summary = "Get patient badges", description = "Returns all badges earned by a patient")
    public ResponseEntity<List<PatientBadgeDto>> getPatientBadges(
        @Parameter(description = "Patient ID")
        @PathVariable UUID patientId
    ) {
        log.info("GET /api/v1/badges/patient/{}", patientId);

        List<PatientBadgeDto> badges = badgeService.getPatientBadges(patientId);

        return ResponseEntity.ok(badges);
    }

    /**
     * Get unnotified badges for a patient.
     */
    @GetMapping("/my/unnotified")
    @PreAuthorize("hasAnyRole('PATIENT')")
    @Operation(summary = "Get unnotified badges", description = "Returns badges not yet notified to the patient")
    public ResponseEntity<List<PatientBadgeDto>> getUnnotifiedBadges(
        @Parameter(description = "Patient ID")
        @RequestParam UUID patientId
    ) {
        log.info("GET /api/v1/badges/my/unnotified - patientId={}", patientId);

        List<PatientBadgeDto> badges = badgeService.getUnnotifiedBadges(patientId);

        return ResponseEntity.ok(badges);
    }

    /**
     * Mark a badge as notified.
     */
    @PostMapping("/{patientBadgeId}/notify")
    @PreAuthorize("hasAnyRole('PATIENT')")
    @Operation(summary = "Mark badge as notified", description = "Marks a badge as notified")
    public ResponseEntity<Map<String, String>> markBadgeAsNotified(
        @Parameter(description = "Patient Badge ID")
        @PathVariable UUID patientBadgeId
    ) {
        log.info("POST /api/v1/badges/{}/notify", patientBadgeId);

        badgeService.markBadgeAsNotified(patientBadgeId);

        return ResponseEntity.ok(Map.of(
            "message", "Badge marked as notified",
            "id", patientBadgeId.toString()
        ));
    }

    /**
     * Get badge statistics for a patient.
     */
    @GetMapping("/stats")
    @PreAuthorize("hasAnyRole('ADMIN', 'DOCTOR', 'NURSE', 'PATIENT')")
    @Operation(summary = "Get badge stats", description = "Returns badge statistics for a patient")
    public ResponseEntity<BadgeService.BadgeStatsDto> getBadgeStats(
        @Parameter(description = "Patient ID")
        @RequestParam UUID patientId
    ) {
        log.info("GET /api/v1/badges/stats - patientId={}", patientId);

        BadgeService.BadgeStatsDto stats = badgeService.getBadgeStats(patientId);

        return ResponseEntity.ok(stats);
    }
}
