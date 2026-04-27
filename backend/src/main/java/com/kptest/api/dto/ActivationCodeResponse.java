package com.kptest.api.dto;

import java.time.Instant;

/**
 * Response for activation code generation.
 */
public record ActivationCodeResponse(
    String patientId,
    String activationCode,
    Instant expiresAt,
    String pdfUrl,
    String message
) {
}
