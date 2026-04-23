package com.kptest.api.dto;

import com.fasterxml.jackson.annotation.JsonProperty;
import com.kptest.domain.project.Project;
import com.kptest.domain.project.ProjectStatus;

import java.time.Instant;
import java.util.List;
import java.util.UUID;

/**
 * DTO for project response.
 */
public record ProjectResponse(
    @JsonProperty("id")
    UUID id,

    @JsonProperty("name")
    String name,

    @JsonProperty("description")
    String description,

    @JsonProperty("start_date")
    Instant startDate,

    @JsonProperty("end_date")
    Instant endDate,

    @JsonProperty("status")
    ProjectStatus status,

    @JsonProperty("created_by")
    UUID createdBy,

    @JsonProperty("created_by_name")
    String createdByName,

    @JsonProperty("compliance_threshold")
    Integer complianceThreshold,

    @JsonProperty("config")
    String config,

    @JsonProperty("active_patient_count")
    Long activePatientCount,

    @JsonProperty("team_member_count")
    Long teamMemberCount,

    @JsonProperty("average_compliance_score")
    Double averageComplianceScore,

    @JsonProperty("created_at")
    Instant createdAt,

    @JsonProperty("updated_at")
    Instant updatedAt
) {

    public static ProjectResponse fromProject(Project project, Long activePatientCount, Long teamMemberCount, Double averageComplianceScore) {
        String createdByName = null;
        if (project.getCreatedBy() != null) {
            createdByName = project.getCreatedBy().getFirstName() + " " + project.getCreatedBy().getLastName();
        }

        return new ProjectResponse(
            project.getId(),
            project.getName(),
            project.getDescription(),
            project.getStartDate(),
            project.getEndDate(),
            project.getStatus(),
            project.getCreatedBy() != null ? project.getCreatedBy().getId() : null,
            createdByName,
            project.getComplianceThreshold(),
            project.getConfig(),
            activePatientCount,
            teamMemberCount,
            averageComplianceScore,
            project.getCreatedAt(),
            project.getUpdatedAt()
        );
    }

    public static ProjectResponse fromProjectSimple(Project project) {
        return fromProject(project, 0L, 0L, null);
    }
}
