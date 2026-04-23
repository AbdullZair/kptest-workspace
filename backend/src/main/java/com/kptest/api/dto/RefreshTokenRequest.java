package com.kptest.api.dto;

import com.fasterxml.jackson.annotation.JsonProperty;

/**
 * Refresh token request.
 */
public record RefreshTokenRequest(
    @JsonProperty("refresh_token")
    String refreshToken
) {}
