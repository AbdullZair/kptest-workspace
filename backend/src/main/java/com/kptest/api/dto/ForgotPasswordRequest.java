package com.kptest.api.dto;

import com.fasterxml.jackson.annotation.JsonProperty;

/**
 * Password reset request.
 */
public record ForgotPasswordRequest(
    @JsonProperty("identifier")
    String identifier,
    
    @JsonProperty("channel")
    String channel  // "email" or "sms"
) {}
