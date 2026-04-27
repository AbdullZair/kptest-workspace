package com.kptest.api.dto;

import jakarta.validation.constraints.NotBlank;

/**
 * Request DTO for rejecting an event change request.
 */
public record RejectEventChangeRequestRequest(
    @NotBlank(message = "Rejection reason is required")
    String reason
) {
}
