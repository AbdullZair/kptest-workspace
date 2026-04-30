package com.kptest.api.controller;

import com.kptest.api.dto.CreateDataProcessingActivityRequest;
import com.kptest.api.dto.DataProcessingActivityDto;
import com.kptest.api.dto.UpdateDataProcessingActivityRequest;
import com.kptest.domain.audit.DataProcessingActivity;
import com.kptest.domain.audit.repository.DataProcessingActivityRepository;
import com.kptest.exception.ResourceNotFoundException;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.servlet.support.ServletUriComponentsBuilder;

import java.net.URI;
import java.util.List;
import java.util.UUID;

/**
 * Data Processing Activity REST Controller (RODO Article 30).
 * Handles CRUD operations for data processing activities registry.
 */
@Slf4j
@RestController
@RequestMapping("/api/v1/admin/data-processing-activities")
@RequiredArgsConstructor
@Tag(name = "Data Processing Activities", description = "RODO Article 30: Registry of data processing activities")
public class DataProcessingController {

    private final DataProcessingActivityRepository dataProcessingActivityRepository;

    /**
     * Get all data processing activities.
     */
    @GetMapping
    @PreAuthorize("hasRole('ADMIN')")
    @Operation(summary = "Get all data processing activities", description = "Returns a paginated list of all data processing activities (RODO Art. 30)")
    public ResponseEntity<Page<DataProcessingActivityDto>> getAllActivities(
        @Parameter(description = "Page number")
        @RequestParam(defaultValue = "0") int page,

        @Parameter(description = "Page size")
        @RequestParam(defaultValue = "20") int size,

        @Parameter(description = "Sort by field")
        @RequestParam(defaultValue = "createdAt") String sortBy,

        @Parameter(description = "Sort direction")
        @RequestParam(defaultValue = "desc") String sortDir
    ) {
        log.info("GET /api/v1/admin/data-processing-activities - page: {}, size: {}, sortBy: {}", page, size, sortBy);

        Sort sort = sortDir.equalsIgnoreCase("asc") ? Sort.by(sortBy).ascending() : Sort.by(sortBy).descending();
        Pageable pageable = PageRequest.of(page, size, sort);

        Page<DataProcessingActivity> activities = dataProcessingActivityRepository.findAll(pageable);

        return ResponseEntity.ok(activities.map(DataProcessingActivityDto::fromEntity));
    }

    /**
     * Get data processing activity by ID.
     */
    @GetMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    @Operation(summary = "Get data processing activity by ID", description = "Returns detailed information about a specific data processing activity")
    public ResponseEntity<DataProcessingActivityDto> getActivityById(
        @Parameter(description = "Activity ID")
        @PathVariable UUID id
    ) {
        log.info("GET /api/v1/admin/data-processing-activities/{}", id);

        DataProcessingActivity activity = dataProcessingActivityRepository.findById(id)
            .orElseThrow(() -> new ResourceNotFoundException("DataProcessingActivity not found with id: " + id));

        return ResponseEntity.ok(DataProcessingActivityDto.fromEntity(activity));
    }

    /**
     * Create a new data processing activity.
     */
    @PostMapping
    @PreAuthorize("hasRole('ADMIN')")
    @Operation(summary = "Create data processing activity", description = "Creates a new data processing activity record (RODO Art. 30)")
    public ResponseEntity<DataProcessingActivityDto> createActivity(
        @Parameter(description = "Activity details")
        @Valid @RequestBody CreateDataProcessingActivityRequest request
    ) {
        log.info("POST /api/v1/admin/data-processing-activities - name: {}", request.name());

        UUID currentUserId = getCurrentUserId();

        DataProcessingActivity activity = DataProcessingActivity.create(
            request.name(),
            request.purpose(),
            request.legalBasis(),
            currentUserId
        );

        if (request.categories() != null) {
            activity.withCategories(request.categories());
        }
        if (request.recipients() != null) {
            activity.withRecipients(request.recipients());
        }
        if (request.retentionPeriod() != null) {
            activity.withRetentionPeriod(request.retentionPeriod());
        }
        if (request.securityMeasures() != null) {
            activity.withSecurityMeasures(request.securityMeasures());
        }
        if (request.dataController() != null) {
            activity.withDataController(request.dataController());
        }
        if (request.dataProcessor() != null) {
            activity.withDataProcessor(request.dataProcessor());
        }

        DataProcessingActivity saved = dataProcessingActivityRepository.save(activity);

        URI location = ServletUriComponentsBuilder.fromCurrentRequest()
            .path("/{id}")
            .buildAndExpand(saved.getId())
            .toUri();

        return ResponseEntity.created(location).body(DataProcessingActivityDto.fromEntity(saved));
    }

    /**
     * Update a data processing activity.
     */
    @PutMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    @Operation(summary = "Update data processing activity", description = "Updates an existing data processing activity record")
    public ResponseEntity<DataProcessingActivityDto> updateActivity(
        @Parameter(description = "Activity ID")
        @PathVariable UUID id,

        @Parameter(description = "Updated activity details")
        @Valid @RequestBody UpdateDataProcessingActivityRequest request
    ) {
        log.info("PUT /api/v1/admin/data-processing-activities/{}", id);

        DataProcessingActivity activity = dataProcessingActivityRepository.findById(id)
            .orElseThrow(() -> new ResourceNotFoundException("DataProcessingActivity not found with id: " + id));

        if (request.name() != null) {
            activity.setName(request.name());
        }
        if (request.purpose() != null) {
            activity.setPurpose(request.purpose());
        }
        if (request.legalBasis() != null) {
            activity.setLegalBasis(request.legalBasis());
        }
        if (request.categories() != null) {
            activity.setCategories(request.categories());
        }
        if (request.recipients() != null) {
            activity.setRecipients(request.recipients());
        }
        if (request.retentionPeriod() != null) {
            activity.setRetentionPeriod(request.retentionPeriod());
        }
        if (request.securityMeasures() != null) {
            activity.setSecurityMeasures(request.securityMeasures());
        }
        if (request.dataController() != null) {
            activity.setDataController(request.dataController());
        }
        if (request.dataProcessor() != null) {
            activity.setDataProcessor(request.dataProcessor());
        }

        DataProcessingActivity updated = dataProcessingActivityRepository.save(activity);

        return ResponseEntity.ok(DataProcessingActivityDto.fromEntity(updated));
    }

    /**
     * Delete a data processing activity.
     */
    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    @Operation(summary = "Delete data processing activity", description = "Deletes a data processing activity record")
    public ResponseEntity<Void> deleteActivity(
        @Parameter(description = "Activity ID")
        @PathVariable UUID id
    ) {
        log.info("DELETE /api/v1/admin/data-processing-activities/{}", id);

        if (!dataProcessingActivityRepository.existsById(id)) {
            throw new ResourceNotFoundException("DataProcessingActivity not found with id: " + id);
        }

        dataProcessingActivityRepository.deleteById(id);

        return ResponseEntity.noContent().build();
    }

    /**
     * Get current user ID from security context.
     * Endpoints in this controller are @PreAuthorize-protected (ADMIN role) so missing
     * authentication or a non-UUID principal name is a misconfiguration — fail fast
     * rather than silently attributing RODO Art. 30 records to "null".
     */
    private UUID getCurrentUserId() {
        var authentication = SecurityContextHolder.getContext().getAuthentication();
        if (authentication == null || !authentication.isAuthenticated()) {
            throw new IllegalStateException("No authenticated user in security context");
        }
        String userId = authentication.getName();
        try {
            return UUID.fromString(userId);
        } catch (IllegalArgumentException e) {
            log.warn("Failed to parse user ID from security context: {}", userId);
            throw new IllegalStateException(
                "Authenticated principal is not a valid user UUID: " + userId, e);
        }
    }
}
