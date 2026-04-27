package com.kptest.api.dto;

import jakarta.validation.constraints.Future;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

import java.time.Instant;
import java.util.UUID;

/**
 * Request DTO for creating an event change request.
 */
public record CreateEventChangeRequestRequest(
    @NotNull(message = "Event ID is required")
    UUID eventId,

    @NotNull(message = "Proposed date is required")
    @Future(message = "Proposed date must be in the future")
    Instant proposedDate,

    @NotBlank(message = "Reason is required")
    String reason
) {
}
