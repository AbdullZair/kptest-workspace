package com.kptest.api.dto;

import jakarta.validation.constraints.NotBlank;

/**
 * Request for clearing 2FA configuration.
 */
public record Clear2faRequest(
    @NotBlank(message = "Reason is required")
    String reason
) {
}
