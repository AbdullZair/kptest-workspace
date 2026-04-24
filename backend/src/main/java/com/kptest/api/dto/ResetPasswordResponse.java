package com.kptest.api.dto;

import com.fasterxml.jackson.annotation.JsonProperty;

/**
 * Response for password reset operation.
 */
public record ResetPasswordResponse(
    @JsonProperty("user_id")
    String userId,

    String message,

    @JsonProperty("temporary_password")
    String temporaryPassword
) {
}
