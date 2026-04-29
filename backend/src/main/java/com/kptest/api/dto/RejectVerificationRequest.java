package com.kptest.api.dto;

import com.fasterxml.jackson.annotation.JsonProperty;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

/**
 * Request body for the staff-driven verification rejection endpoint
 * (US-NH-01, {@code POST /api/v1/admin/patients/{id}/reject}).
 *
 * <p>A reason of at least 10 characters is mandatory and persisted in
 * the audit log. Rejections are irreversible.</p>
 */
public record RejectVerificationRequest(
    @JsonProperty("reason")
    @NotBlank(message = "Reason is required")
    @Size(min = 10, max = 1000, message = "Reason must be at least 10 characters")
    String reason
) {
}
