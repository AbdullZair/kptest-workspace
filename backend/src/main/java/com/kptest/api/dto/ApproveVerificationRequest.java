package com.kptest.api.dto;

import com.fasterxml.jackson.annotation.JsonProperty;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Pattern;

/**
 * Request body for the staff-driven patient verification approval endpoint
 * (US-NH-01, {@code POST /api/v1/admin/patients/{id}/approve}).
 *
 * <p>Two methods are accepted:
 * <ul>
 *     <li>{@code HIS} - the staff member triggers a HIS lookup using
 *         {@code hisCartNumber}. Approval succeeds only when HIS returns
 *         {@code MATCHED}.</li>
 *     <li>{@code MANUAL} - the staff member overrides HIS and approves
 *         manually. A free-text {@code reason} of at least 10 characters
 *         is required and persisted in the audit log.</li>
 * </ul></p>
 */
public record ApproveVerificationRequest(
    @JsonProperty("method")
    @NotNull(message = "Verification method is required")
    @Pattern(regexp = "^(HIS|MANUAL)$", message = "Method must be HIS or MANUAL")
    String method,

    @JsonProperty("reason")
    String reason,

    @JsonProperty("his_cart_number")
    String hisCartNumber
) {
}
