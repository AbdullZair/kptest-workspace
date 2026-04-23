package com.kptest.api.dto;

import com.fasterxml.jackson.annotation.JsonProperty;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotEmpty;

import java.util.List;
import java.util.UUID;

/**
 * DTO for removing patients from a project.
 */
public record RemovePatientsRequest(
    @JsonProperty("patient_ids")
    @NotEmpty(message = "At least one patient ID is required")
    List<UUID> patientIds,

    @JsonProperty("reason")
    @NotBlank(message = "Removal reason is required")
    String reason
) {
}
