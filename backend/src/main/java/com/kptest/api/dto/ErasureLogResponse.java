package com.kptest.api.dto;

import java.time.Instant;
import java.util.UUID;

/**
 * Response DTO for erasure log.
 */
public record ErasureLogResponse(
    UUID id,
    UUID patientId,
    String reason,
    UUID erasedBy,
    Instant erasedAt
) {
}
