package com.kptest.api.dto;

import com.fasterxml.jackson.annotation.JsonProperty;
import jakarta.validation.constraints.NotEmpty;

import java.util.List;
import java.util.UUID;

/**
 * DTO for assigning patients to a project.
 */
public record AssignPatientsRequest(
    @JsonProperty("patient_ids")
    @NotEmpty(message = "At least one patient ID is required")
    List<UUID> patientIds
) {
}
