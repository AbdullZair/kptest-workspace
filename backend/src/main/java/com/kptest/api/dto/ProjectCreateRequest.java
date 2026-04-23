package com.kptest.api.dto;

import com.fasterxml.jackson.annotation.JsonProperty;
import com.kptest.domain.project.ProjectStatus;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

import java.time.Instant;
import java.util.List;
import java.util.UUID;

/**
 * DTO for creating a new project.
 */
public record ProjectCreateRequest(
    @JsonProperty("name")
    @NotBlank(message = "Project name is required")
    @Size(max = 200, message = "Project name must be less than 200 characters")
    String name,

    @JsonProperty("description")
    @Size(max = 5000, message = "Description must be less than 5000 characters")
    String description,

    @JsonProperty("start_date")
    @NotNull(message = "Start date is required")
    Instant startDate,

    @JsonProperty("end_date")
    Instant endDate,

    @JsonProperty("status")
    ProjectStatus status,

    @JsonProperty("compliance_threshold")
    Integer complianceThreshold,

    @JsonProperty("config")
    String config,

    @JsonProperty("team_member_ids")
    List<UUID> teamMemberIds,

    @JsonProperty("patient_ids")
    List<UUID> patientIds
) {
    public ProjectCreateRequest {
        // Default status to PLANNED if not provided
        if (status == null) {
            status = ProjectStatus.PLANNED;
        }
    }
}
