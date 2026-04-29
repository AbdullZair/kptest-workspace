package com.kptest.api.controller;

import com.kptest.api.dto.*;
import com.kptest.application.service.ProjectService;
import com.kptest.domain.project.PatientProject;
import com.kptest.domain.project.ProjectTeam;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.net.URI;
import java.util.List;
import java.util.Map;
import java.util.UUID;

/**
 * Project REST Controller.
 * Handles all project-related CRUD operations and management.
 */
@Slf4j
@RestController
@RequestMapping("/api/v1/projects")
@RequiredArgsConstructor
@Tag(name = "Projects", description = "Therapeutic project management endpoints")
public class ProjectController {

    private final ProjectService projectService;

    /**
     * Get all projects with optional filtering.
     */
    @GetMapping
    @PreAuthorize("hasAnyRole('ADMIN', 'DOCTOR', 'NURSE', 'THERAPIST')")
    @Operation(summary = "Get all projects", description = "Returns a list of projects with optional filtering by status or name")
    public ResponseEntity<List<ProjectResponse>> getProjects(
        @Parameter(description = "Filter by project status")
        @RequestParam(required = false) ProjectStatusFilter status,

        @Parameter(description = "Filter by project name (partial match)")
        @RequestParam(required = false) String name
    ) {
        log.info("GET /api/v1/projects - status={}, name={}", status, name);

        ProjectService.ProjectFilters filters = new ProjectService.ProjectFilters(
            status != null ? status.toProjectStatus() : null,
            name
        );

        List<ProjectResponse> projects = projectService.findAll(filters);

        return ResponseEntity.ok(projects);
    }

    /**
     * Get project by ID.
     */
    @GetMapping("/{id}")
    @PreAuthorize("hasAnyRole('ADMIN', 'DOCTOR', 'NURSE', 'THERAPIST')")
    @Operation(summary = "Get project by ID", description = "Returns detailed information about a specific project")
    public ResponseEntity<ProjectResponse> getProjectById(
        @Parameter(description = "Project ID")
        @PathVariable UUID id
    ) {
        log.info("GET /api/v1/projects/{}", id);

        ProjectResponse project = projectService.findById(id);

        return ResponseEntity.ok(project);
    }

    /**
     * Create a new project.
     */
    @PostMapping
    @PreAuthorize("hasAnyRole('ADMIN', 'DOCTOR')")
    @Operation(summary = "Create project", description = "Creates a new therapeutic project")
    public ResponseEntity<ProjectResponse> createProject(
        @Parameter(description = "Project data")
        @Valid @RequestBody ProjectCreateRequest request,
        @AuthenticationPrincipal String userIdStr
    ) {
        log.info("POST /api/v1/projects - name: {}", request.name());

        UUID staffId = userIdStr != null ? UUID.fromString(userIdStr) : null;

        ProjectResponse createdProject = projectService.create(request, staffId);

        return ResponseEntity
            .created(URI.create("/api/v1/projects/" + createdProject.id()))
            .body(createdProject);
    }

    /**
     * Update an existing project.
     */
    @PutMapping("/{id}")
    @PreAuthorize("hasAnyRole('ADMIN', 'DOCTOR')")
    @Operation(summary = "Update project", description = "Updates an existing project")
    public ResponseEntity<ProjectResponse> updateProject(
        @Parameter(description = "Project ID")
        @PathVariable UUID id,

        @Parameter(description = "Updated project data")
        @Valid @RequestBody ProjectUpdateRequest request
    ) {
        log.info("PUT /api/v1/projects/{}", id);

        ProjectResponse updatedProject = projectService.update(id, request);

        return ResponseEntity.ok(updatedProject);
    }

    /**
     * Delete a project.
     */
    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    @Operation(summary = "Delete project", description = "Deletes a project and removes all associations")
    public ResponseEntity<Map<String, String>> deleteProject(
        @Parameter(description = "Project ID")
        @PathVariable UUID id
    ) {
        log.info("DELETE /api/v1/projects/{}", id);

        projectService.delete(id);

        return ResponseEntity.ok(Map.of(
            "message", "Project deleted successfully",
            "id", id.toString()
        ));
    }

    /**
     * Assign patients to a project.
     */
    @PostMapping("/{id}/patients")
    @PreAuthorize("hasAnyRole('ADMIN', 'DOCTOR', 'NURSE')")
    @Operation(summary = "Assign patients to project", description = "Assigns one or more patients to a project")
    public ResponseEntity<Map<String, Object>> assignPatients(
        @Parameter(description = "Project ID")
        @PathVariable UUID id,

        @Parameter(description = "Patient IDs to assign")
        @Valid @RequestBody AssignPatientsRequest request
    ) {
        log.info("POST /api/v1/projects/{}/patients - count: {}", id, request.patientIds().size());

        List<UUID> assignedIds = projectService.assignPatients(id, request.patientIds());

        return ResponseEntity.ok(Map.of(
            "message", "Patients assigned successfully",
            "assigned_count", assignedIds.size(),
            "patient_ids", assignedIds
        ));
    }

    /**
     * Remove patients from a project.
     */
    @DeleteMapping("/{id}/patients")
    @PreAuthorize("hasAnyRole('ADMIN', 'DOCTOR', 'NURSE')")
    @Operation(summary = "Remove patients from project", description = "Removes one or more patients from a project")
    public ResponseEntity<Map<String, Object>> removePatients(
        @Parameter(description = "Project ID")
        @PathVariable UUID id,

        @Parameter(description = "Patient IDs and removal reason")
        @Valid @RequestBody RemovePatientsRequest request
    ) {
        log.info("DELETE /api/v1/projects/{}/patients - count: {}", id, request.patientIds().size());

        List<UUID> removedIds = projectService.removePatients(id, request.patientIds(), request.reason());

        return ResponseEntity.ok(Map.of(
            "message", "Patients removed successfully",
            "removed_count", removedIds.size(),
            "patient_ids", removedIds
        ));
    }

    /**
     * Get project statistics.
     */
    @GetMapping("/{id}/statistics")
    @PreAuthorize("hasAnyRole('ADMIN', 'DOCTOR', 'NURSE', 'THERAPIST')")
    @Operation(summary = "Get project statistics", description = "Returns statistics for a specific project")
    public ResponseEntity<ProjectStatisticsResponse> getProjectStatistics(
        @Parameter(description = "Project ID")
        @PathVariable UUID id
    ) {
        log.info("GET /api/v1/projects/{}/statistics", id);

        ProjectStatisticsResponse statistics = projectService.getStatistics(id);

        return ResponseEntity.ok(statistics);
    }

    /**
     * Get patients in a project.
     */
    @GetMapping("/{id}/patients")
    @PreAuthorize("hasAnyRole('ADMIN', 'DOCTOR', 'NURSE', 'THERAPIST')")
    @Operation(summary = "Get project patients", description = "Returns patients enrolled in a project")
    public ResponseEntity<List<PatientProject>> getProjectPatients(
        @Parameter(description = "Project ID")
        @PathVariable UUID id,

        @Parameter(description = "Only return active enrollments")
        @RequestParam(defaultValue = "true") boolean activeOnly
    ) {
        log.info("GET /api/v1/projects/{}/patients - activeOnly={}", id, activeOnly);

        List<PatientProject> patients = projectService.getProjectPatients(id, activeOnly);

        return ResponseEntity.ok(patients);
    }

    /**
     * Get project team members.
     */
    @GetMapping("/{id}/team")
    @PreAuthorize("hasAnyRole('ADMIN', 'DOCTOR', 'NURSE', 'THERAPIST')")
    @Operation(summary = "Get project team", description = "Returns team members assigned to a project")
    public ResponseEntity<List<ProjectTeam>> getProjectTeam(
        @Parameter(description = "Project ID")
        @PathVariable UUID id
    ) {
        log.info("GET /api/v1/projects/{}/team", id);

        List<ProjectTeam> team = projectService.getProjectTeam(id);

        return ResponseEntity.ok(team);
    }

    /**
     * Get active projects for current user.
     */
    @GetMapping("/my/active")
    @PreAuthorize("hasAnyRole('ADMIN', 'DOCTOR', 'NURSE', 'THERAPIST')")
    @Operation(summary = "Get my active projects", description = "Returns active projects where current user is a team member")
    public ResponseEntity<List<ProjectResponse>> getMyActiveProjects() {
        log.info("GET /api/v1/projects/my/active");

        // TODO: Get user ID from security context
        UUID userId = getCurrentUserId();

        List<ProjectResponse> projects = projectService.findActiveByUserId(userId);

        return ResponseEntity.ok(projects);
    }

    /**
     * Get current staff ID from security context.
     * TODO: Implement proper security context extraction
     */
    private UUID getCurrentStaffId() {
        // Placeholder - should extract from authentication token
        // This would typically use SecurityContextHolder or a custom annotation
        return null; // Will need to be handled by service with optional null check
    }

    /**
     * Get current user ID from security context.
     * TODO: Implement proper security context extraction
     */
    private UUID getCurrentUserId() {
        // Placeholder - should extract from authentication token
        return UUID.randomUUID(); // Temporary placeholder
    }

    /**
     * Project status filter enum for query params.
     */
    public enum ProjectStatusFilter {
        PLANNED,
        ACTIVE,
        COMPLETED,
        ARCHIVED,
        CANCELLED;

        public com.kptest.domain.project.ProjectStatus toProjectStatus() {
            return com.kptest.domain.project.ProjectStatus.valueOf(this.name());
        }
    }
}
