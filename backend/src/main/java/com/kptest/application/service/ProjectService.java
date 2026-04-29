package com.kptest.application.service;

import com.kptest.api.dto.*;
import com.kptest.domain.patient.Patient;
import com.kptest.domain.patient.PatientRepository;
import com.kptest.domain.project.*;
import com.kptest.domain.staff.Staff;
import com.kptest.domain.staff.StaffRepository;
import com.kptest.domain.user.User;
import com.kptest.domain.user.UserRepository;
import com.kptest.exception.ResourceNotFoundException;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.Instant;
import java.util.*;
import java.util.stream.Collectors;

/**
 * Project service handling all project-related operations.
 */
@Slf4j
@Service
@RequiredArgsConstructor
@Transactional
public class ProjectService {

    private final ProjectRepository projectRepository;
    private final PatientProjectRepository patientProjectRepository;
    private final ProjectTeamRepository projectTeamRepository;
    private final StaffRepository staffRepository;
    private final PatientRepository patientRepository;
    private final UserRepository userRepository;

    /**
     * Find all projects with optional filtering.
     *
     * @param filters Search filters (status, name)
     * @return List of project responses
     */
    @Transactional(readOnly = true)
    public List<ProjectResponse> findAll(ProjectFilters filters) {
        log.debug("Finding projects with filters: {}", filters);

        List<Project> projects;

        if (filters != null && filters.status() != null) {
            projects = projectRepository.findByStatus(filters.status());
        } else if (filters != null && filters.name() != null && !filters.name().isBlank()) {
            projects = projectRepository.findByNameContaining(filters.name());
        } else {
            projects = projectRepository.findAll();
        }

        return projects.stream()
            .map(this::toProjectResponseWithStats)
            .toList();
    }

    /**
     * Find project by ID.
     *
     * @param id Project ID
     * @return Project response
     * @throws ResourceNotFoundException if project not found
     */
    @Transactional(readOnly = true)
    public ProjectResponse findById(UUID id) {
        log.debug("Finding project by ID: {}", id);

        Project project = projectRepository.findById(id)
            .orElseThrow(() -> new ResourceNotFoundException("Project not found with id: " + id));

        return toProjectResponseWithStats(project);
    }

    /**
     * Create a new project.
     *
     * @param request Project creation request
     * @param staffId Staff ID creating the project
     * @return Created project response
     */
    public ProjectResponse create(ProjectCreateRequest request, UUID staffId) {
        log.info("Creating project: {}", request.name());

        // ProjectController passes the authenticated user's id, not the
        // staff row pk. Look up by user_id (Staff.user_id is unique).
        Staff staff = staffRepository.findByUserId(staffId)
            .or(() -> staffRepository.findById(staffId))
            .orElseThrow(() -> new ResourceNotFoundException("Staff not found for user id: " + staffId));

        // Create project
        Project project = Project.create(
            request.name(),
            request.description(),
            request.startDate(),
            staff
        );

        // Set optional fields
        if (request.endDate() != null) {
            project.setEndDate(request.endDate());
        }
        if (request.status() != null) {
            project.setStatus(request.status());
        }
        if (request.complianceThreshold() != null) {
            project.setComplianceThreshold(request.complianceThreshold());
        }
        if (request.config() != null) {
            project.setConfig(request.config());
        }

        Project savedProject = projectRepository.save(project);
        log.info("Created project with ID: {}", savedProject.getId());

        // Assign team members if provided
        if (request.teamMemberIds() != null && !request.teamMemberIds().isEmpty()) {
            assignTeamMembers(savedProject, request.teamMemberIds());
        }

        // Assign patients if provided
        if (request.patientIds() != null && !request.patientIds().isEmpty()) {
            assignPatientsInternal(savedProject, request.patientIds());
        }

        return toProjectResponseWithStats(savedProject);
    }

    /**
     * Update an existing project.
     *
     * @param id Project ID
     * @param request Update request
     * @return Updated project response
     * @throws ResourceNotFoundException if project not found
     */
    public ProjectResponse update(UUID id, ProjectUpdateRequest request) {
        log.info("Updating project with ID: {}", id);

        Project project = projectRepository.findById(id)
            .orElseThrow(() -> new ResourceNotFoundException("Project not found with id: " + id));

        // Update fields if provided
        if (request.name() != null) {
            project.setName(request.name());
        }
        if (request.description() != null) {
            project.setDescription(request.description());
        }
        if (request.startDate() != null) {
            project.setStartDate(request.startDate());
        }
        if (request.endDate() != null) {
            project.setEndDate(request.endDate());
        }
        if (request.status() != null) {
            project.setStatus(request.status());

            // Handle status transitions
            if (request.status() == ProjectStatus.ACTIVE) {
                project.activate();
            } else if (request.status() == ProjectStatus.COMPLETED) {
                project.complete();
            } else if (request.status() == ProjectStatus.ARCHIVED) {
                project.archive();
            }
        }
        if (request.complianceThreshold() != null) {
            project.setComplianceThreshold(request.complianceThreshold());
        }
        if (request.config() != null) {
            project.setConfig(request.config());
        }

        Project updatedProject = projectRepository.save(project);
        log.info("Updated project with ID: {}", updatedProject.getId());

        return toProjectResponseWithStats(updatedProject);
    }

    /**
     * Delete a project.
     *
     * @param id Project ID
     * @throws ResourceNotFoundException if project not found
     */
    public void delete(UUID id) {
        log.info("Deleting project with ID: {}", id);

        Project project = projectRepository.findById(id)
            .orElseThrow(() -> new ResourceNotFoundException("Project not found with id: " + id));

        // First remove all team associations
        projectTeamRepository.deleteByProjectId(id);

        // Remove all patient enrollments (soft delete by setting leftAt)
        List<PatientProject> patientProjects = patientProjectRepository.findActiveByProjectId(id);
        for (PatientProject pp : patientProjects) {
            pp.remove(null, "Project deleted");
        }

        // Delete the project
        projectRepository.delete(project);

        log.info("Deleted project with ID: {}", id);
    }

    /**
     * Assign patients to a project.
     *
     * @param projectId Project ID
     * @param patientIds List of patient IDs to assign
     * @return List of assigned patient IDs
     * @throws ResourceNotFoundException if project not found
     */
    public List<UUID> assignPatients(UUID projectId, List<UUID> patientIds) {
        log.info("Assigning {} patients to project: {}", patientIds.size(), projectId);

        Project project = projectRepository.findById(projectId)
            .orElseThrow(() -> new ResourceNotFoundException("Project not found with id: " + projectId));

        List<UUID> assignedIds = new ArrayList<>();

        for (UUID patientId : patientIds) {
            Patient patient = patientRepository.findById(patientId)
                .orElseThrow(() -> new ResourceNotFoundException("Patient not found with id: " + patientId));

            // Check if already enrolled
            if (patientProjectRepository.existsActiveEnrollment(patientId, projectId)) {
                log.warn("Patient {} is already enrolled in project {}", patientId, projectId);
                continue;
            }

            PatientProject patientProject = PatientProject.enroll(patient, project);
            patientProjectRepository.save(patientProject);
            assignedIds.add(patientId);

            log.info("Enrolled patient {} in project {}", patientId, projectId);
        }

        return assignedIds;
    }

    /**
     * Remove patients from a project.
     *
     * @param projectId Project ID
     * @param patientIds List of patient IDs to remove
     * @param reason Removal reason
     * @return List of removed patient IDs
     * @throws ResourceNotFoundException if project not found
     */
    public List<UUID> removePatients(UUID projectId, List<UUID> patientIds, String reason) {
        log.info("Removing {} patients from project: {}", patientIds.size(), projectId);

        Project project = projectRepository.findById(projectId)
            .orElseThrow(() -> new ResourceNotFoundException("Project not found with id: " + projectId));

        // Get staff member for removal tracking (optional - can be null)
        Staff remover = null; // Could be obtained from security context

        List<UUID> removedIds = new ArrayList<>();

        for (UUID patientId : patientIds) {
            Optional<PatientProject> enrollment = patientProjectRepository.findActiveEnrollment(patientId, projectId);

            if (enrollment.isPresent()) {
                PatientProject pp = enrollment.get();
                pp.remove(remover, reason);
                patientProjectRepository.save(pp);
                removedIds.add(patientId);

                log.info("Removed patient {} from project {}: {}", patientId, projectId, reason);
            } else {
                log.warn("Patient {} is not enrolled in project {}", patientId, projectId);
            }
        }

        return removedIds;
    }

    /**
     * Get project statistics.
     *
     * @param projectId Project ID
     * @return Project statistics
     * @throws ResourceNotFoundException if project not found
     */
    @Transactional(readOnly = true)
    public ProjectStatisticsResponse getStatistics(UUID projectId) {
        log.debug("Getting statistics for project: {}", projectId);

        Project project = projectRepository.findById(projectId)
            .orElseThrow(() -> new ResourceNotFoundException("Project not found with id: " + projectId));

        // Get all patient projects for this project
        List<PatientProject> allPatientProjects = patientProjectRepository.findByPatientId(projectId);
        List<PatientProject> activePatientProjects = patientProjectRepository.findActiveByProjectId(projectId);

        // Calculate patient counts by stage
        Map<TherapyStage, Long> stageDistribution = activePatientProjects.stream()
            .collect(Collectors.groupingBy(
                PatientProject::getCurrentStage,
                Collectors.counting()
            ));

        // Calculate compliance distribution
        Map<String, Long> complianceDistribution = calculateComplianceDistribution(activePatientProjects);

        // Get average compliance score
        Double avgCompliance = patientProjectRepository.averageComplianceScoreByProjectId(projectId)
            .orElse(null);

        // Get team member count
        long teamMemberCount = projectTeamRepository.countByProjectId(projectId);

        // Calculate patient counts
        long totalPatients = allPatientProjects.size();
        long activePatients = activePatientProjects.size();
        long completedPatients = stageDistribution.getOrDefault(TherapyStage.COMPLETED, 0L);
        long removedPatients = allPatientProjects.stream()
            .filter(pp -> pp.getLeftAt() != null)
            .count();

        return ProjectStatisticsResponse.builder()
            .projectId(projectId)
            .projectName(project.getName())
            .status(project.getStatus())
            .totalPatients(totalPatients)
            .activePatients(activePatients)
            .completedPatients(completedPatients)
            .removedPatients(removedPatients)
            .teamMembers(teamMemberCount)
            .averageComplianceScore(avgCompliance)
            .complianceDistribution(complianceDistribution)
            .stageDistribution(stageDistribution)
            .recentActivity(Collections.emptyList()) // Could be populated from audit log
            .build();
    }

    /**
     * Get active projects for a user.
     *
     * @param userId User ID
     * @return List of active projects
     */
    @Transactional(readOnly = true)
    public List<ProjectResponse> findActiveByUserId(UUID userId) {
        log.debug("Finding active projects for user: {}", userId);

        List<ProjectTeam> teamMemberships = projectTeamRepository.findActiveProjectsByUserId(userId);

        return teamMemberships.stream()
            .map(pt -> toProjectResponseWithStats(pt.getProject()))
            .toList();
    }

    /**
     * Get patients assigned to a project.
     *
     * @param projectId Project ID
     * @param activeOnly Whether to return only active enrollments
     * @return List of patient projects
     */
    @Transactional(readOnly = true)
    public List<PatientProject> getProjectPatients(UUID projectId, boolean activeOnly) {
        log.debug("Getting patients for project: {} (activeOnly={})", projectId, activeOnly);

        if (activeOnly) {
            return patientProjectRepository.findActiveByProjectId(projectId);
        }
        return patientProjectRepository.findByPatientId(projectId);
    }

    /**
     * Get team members for a project.
     *
     * @param projectId Project ID
     * @return List of project team members
     */
    @Transactional(readOnly = true)
    public List<ProjectTeam> getProjectTeam(UUID projectId) {
        log.debug("Getting team members for project: {}", projectId);
        return projectTeamRepository.findByProjectId(projectId);
    }

    /**
     * Assign team members to a project.
     */
    private void assignTeamMembers(Project project, List<UUID> userIds) {
        for (UUID userId : userIds) {
            // Check if already a member
            if (projectTeamRepository.existsByProjectIdAndUserId(project.getId(), userId)) {
                log.warn("User {} is already in project team {}", userId, project.getId());
                continue;
            }

            User user = userRepository.getReferenceById(userId);

            ProjectTeam team = ProjectTeam.assign(project, user, ProjectRole.THERAPIST);
            projectTeamRepository.save(team);

            log.info("Added user {} to project team {}", userId, project.getId());
        }
    }

    /**
     * Internal patient assignment (used during project creation).
     */
    private void assignPatientsInternal(Project project, List<UUID> patientIds) {
        for (UUID patientId : patientIds) {
            Optional<Patient> patientOpt = patientRepository.findById(patientId);
            if (patientOpt.isPresent()) {
                Patient patient = patientOpt.get();
                PatientProject patientProject = PatientProject.enroll(patient, project);
                patientProjectRepository.save(patientProject);
                log.info("Enrolled patient {} in project {}", patientId, project.getId());
            }
        }
    }

    /**
     * Convert project to response with statistics.
     */
    private ProjectResponse toProjectResponseWithStats(Project project) {
        long activePatientCount = patientProjectRepository.countActivePatientsByProjectId(project.getId());
        long teamMemberCount = projectTeamRepository.countByProjectId(project.getId());
        Double avgCompliance = patientProjectRepository.averageComplianceScoreByProjectId(project.getId())
            .orElse(null);

        return ProjectResponse.fromProject(project, activePatientCount, teamMemberCount, avgCompliance);
    }

    /**
     * Calculate compliance distribution.
     */
    private Map<String, Long> calculateComplianceDistribution(List<PatientProject> patientProjects) {
        return patientProjects.stream()
            .filter(pp -> pp.getComplianceScore() != null)
            .collect(Collectors.groupingBy(
                pp -> {
                    double score = pp.getComplianceScore().doubleValue();
                    if (score >= 80) return "HIGH (80-100%)";
                    if (score >= 50) return "MEDIUM (50-79%)";
                    return "LOW (0-49%)";
                },
                Collectors.counting()
            ));
    }

    /**
     * Project filters record.
     */
    public record ProjectFilters(
        ProjectStatus status,
        String name
    ) {}
}
