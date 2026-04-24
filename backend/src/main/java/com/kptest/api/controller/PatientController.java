package com.kptest.api.controller;

import com.kptest.api.dto.*;
import com.kptest.application.service.PatientService;
import com.kptest.domain.user.VerificationStatus;
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
import java.util.Set;
import java.util.UUID;

/**
 * Patient REST Controller.
 * Handles all patient-related CRUD operations and HIS verification.
 */
@Slf4j
@RestController
@RequestMapping("/api/v1/patients")
@RequiredArgsConstructor
@Tag(name = "Patients", description = "Patient management endpoints")
public class PatientController {

    private final PatientService patientService;

    /**
     * Get all patients with filtering and pagination.
     */
    @GetMapping
    @PreAuthorize("hasAnyRole('ADMIN', 'DOCTOR', 'NURSE', 'RECEPTIONIST')")
    @Operation(summary = "Get all patients", description = "Returns a paginated list of patients with optional filtering")
    public ResponseEntity<PatientSearchResponse> getPatients(
        @Parameter(description = "PESEL number to filter by")
        @RequestParam(required = false) String pesel,

        @Parameter(description = "Name to search for (first or last name)")
        @RequestParam(required = false) String name,

        @Parameter(description = "HIS patient ID to filter by")
        @RequestParam(required = false) String hisPatientId,

        @Parameter(description = "User status to filter by (ACTIVE, BLOCKED, etc.)")
        @RequestParam(required = false) List<String> status,

        @Parameter(description = "Verification status to filter by (PENDING, APPROVED, REJECTED)")
        @RequestParam(required = false) List<VerificationStatus> verificationStatus,

        @Parameter(description = "Project to filter by")
        @RequestParam(required = false) String project,

        @Parameter(description = "Page number (0-indexed)")
        @RequestParam(defaultValue = "0") int page,

        @Parameter(description = "Page size")
        @RequestParam(defaultValue = "20") int size,

        @Parameter(description = "Sort field (name, created_at, status)")
        @RequestParam(defaultValue = "name") String sort,

        @Parameter(description = "Sort order (asc, desc)")
        @RequestParam(defaultValue = "asc") String sortOrder
    ) {
        log.info("GET /api/v1/patients - page={}, size={}, sort={}", page, size, sort);

        PatientSearchRequest filters = PatientSearchRequest.builder()
            .pesel(pesel)
            .name(name)
            .hisPatientId(hisPatientId)
            .status(status != null ? Set.copyOf(status) : null)
            .verificationStatus(verificationStatus != null ? Set.copyOf(verificationStatus) : null)
            .project(project)
            .page(page)
            .size(size)
            .sort(sort)
            .sortOrder(sortOrder)
            .build();

        PatientSearchResponse response = patientService.findAll(filters);

        return ResponseEntity.ok(response);
    }

    /**
     * Get patient by ID.
     */
    @GetMapping("/{id}")
    @PreAuthorize("hasAnyRole('ADMIN', 'DOCTOR', 'NURSE', 'RECEPTIONIST')")
    @Operation(summary = "Get patient by ID", description = "Returns detailed information about a specific patient")
    public ResponseEntity<PatientDto> getPatientById(
        @Parameter(description = "Patient ID")
        @PathVariable UUID id
    ) {
        log.info("GET /api/v1/patients/{}", id);

        PatientDto patient = patientService.findById(id);

        return ResponseEntity.ok(patient);
    }

    /**
     * Create a new patient.
     */
    @PostMapping
    @PreAuthorize("hasAnyRole('ADMIN', 'DOCTOR', 'NURSE', 'RECEPTIONIST')")
    @Operation(summary = "Create patient", description = "Creates a new patient record")
    public ResponseEntity<PatientDto> createPatient(
        @Parameter(description = "Patient data")
        @Valid @RequestBody PatientDto patientDto
    ) {
        log.info("POST /api/v1/patients - PESEL: {}", patientDto.pesel());

        PatientDto createdPatient = patientService.create(patientDto);

        return ResponseEntity
            .created(URI.create("/api/v1/patients/" + createdPatient.id()))
            .body(createdPatient);
    }

    /**
     * Update an existing patient.
     */
    @PutMapping("/{id}")
    @PreAuthorize("hasAnyRole('ADMIN', 'DOCTOR', 'NURSE', 'RECEPTIONIST')")
    @Operation(summary = "Update patient", description = "Updates an existing patient record")
    public ResponseEntity<PatientDto> updatePatient(
        @Parameter(description = "Patient ID")
        @PathVariable UUID id,

        @Parameter(description = "Updated patient data")
        @Valid @RequestBody PatientDto patientDto
    ) {
        log.info("PUT /api/v1/patients/{}", id);

        PatientDto updatedPatient = patientService.update(id, patientDto);

        return ResponseEntity.ok(updatedPatient);
    }

    /**
     * Delete a patient (soft delete).
     */
    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    @Operation(summary = "Delete patient", description = "Soft deletes a patient record")
    public ResponseEntity<Map<String, String>> deletePatient(
        @Parameter(description = "Patient ID")
        @PathVariable UUID id
    ) {
        log.info("DELETE /api/v1/patients/{}", id);

        patientService.delete(id);

        return ResponseEntity.ok(Map.of(
            "message", "Patient deleted successfully",
            "id", id.toString()
        ));
    }

    /**
     * Verify patient with HIS.
     */
    @PostMapping("/verify")
    @PreAuthorize("hasAnyRole('ADMIN', 'DOCTOR', 'NURSE', 'RECEPTIONIST')")
    @Operation(summary = "Verify patient with HIS", description = "Verifies patient data against Hospital Information System")
    public ResponseEntity<PatientVerifyResponse> verifyPatient(
        @Parameter(description = "Verification request")
        @Valid @RequestBody PatientVerifyRequest request
    ) {
        log.info("POST /api/v1/patients/verify - PESEL: {}", request.pesel());

        PatientVerifyResponse response = patientService.verifyWithHIS(
            request.pesel(),
            request.cartNumber()
        );

        HttpStatus status = response.verified() ? HttpStatus.OK : HttpStatus.NOT_FOUND;
        return ResponseEntity.status(status).body(response);
    }

    /**
     * Search patients.
     */
    @GetMapping("/search")
    @PreAuthorize("hasAnyRole('ADMIN', 'DOCTOR', 'NURSE', 'RECEPTIONIST')")
    @Operation(summary = "Search patients", description = "Searches for patients by PESEL, name, or HIS ID")
    public ResponseEntity<List<PatientDto>> searchPatients(
        @Parameter(description = "Search query")
        @RequestParam String query
    ) {
        log.info("GET /api/v1/patients/search - query: {}", query);

        List<PatientDto> patients = patientService.search(query);

        return ResponseEntity.ok(patients);
    }
}
