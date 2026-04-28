package com.kptest.api.dto;

import com.fasterxml.jackson.annotation.JsonProperty;
import jakarta.validation.constraints.NotBlank;

/**
 * Refresh token request.
 */
public record RefreshTokenRequest(
    @JsonProperty("refresh_token")
    @NotBlank(message = "refresh_token is required")
    String refreshToken
) {}
