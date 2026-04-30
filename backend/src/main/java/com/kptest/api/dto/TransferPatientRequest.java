package com.kptest.api.dto;

import com.fasterxml.jackson.annotation.JsonProperty;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

/**
 * Request body for transferring a patient between projects.
 *
 * <p>Used by US-K-06: personnel relocates a patient from one project to another
 * while preserving the audit trail (reason / motive).</p>
 */
public record TransferPatientRequest(
    @JsonProperty("reason")
    @NotBlank(message = "Transfer reason is required")
    @Size(min = 10, message = "Transfer reason must be at least 10 characters")
    String reason
) {}
