package com.kptest.api.dto;

import jakarta.validation.constraints.NotBlank;

/**
 * Request for forcing a password reset.
 */
public record ForcePasswordResetRequest(
    @NotBlank(message = "Reason is required")
    String reason
) {
}
