package com.kptest.api.dto;

import jakarta.validation.constraints.NotBlank;

/**
 * Request DTO for patient data erasure (US-A-12).
 */
public record ErasureRequest(
    @NotBlank(message = "Reason is required")
    String reason,

    String confirmationToken
) {
}
