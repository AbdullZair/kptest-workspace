package com.kptest.api.dto;

import jakarta.validation.constraints.NotBlank;

/**
 * Request DTO for accepting an event change request.
 */
public record AcceptEventChangeRequestRequest(
    @NotBlank(message = "Comment is required")
    String comment
) {
}
