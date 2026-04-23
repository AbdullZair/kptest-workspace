package com.kptest.api.dto;

import com.fasterxml.jackson.annotation.JsonProperty;
import com.kptest.domain.project.Project;
import com.kptest.domain.project.ProjectStatus;

import java.time.Instant;
import java.util.List;
import java.util.UUID;

/**
 * DTO for updating a project.
 */
public record ProjectUpdateRequest(
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

    @JsonProperty("compliance_threshold")
    Integer complianceThreshold,

    @JsonProperty("config")
    String config
) {
    public ProjectUpdateRequest {
        // All fields are optional for partial updates
    }
}
