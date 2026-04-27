package com.kptest.api.dto;

import com.fasterxml.jackson.annotation.JsonProperty;

/**
 * Response for clear 2FA operation.
 */
public record Clear2faResponse(
    @JsonProperty("success")
    boolean success,
    
    @JsonProperty("message")
    String message
) {}
