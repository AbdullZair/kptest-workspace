package com.kptest.api.dto;

import jakarta.validation.constraints.NotBlank;

/**
 * Login request.
 */
public record LoginRequest(
    @NotBlank(message = "Identifier (email or phone) is required")
    String identifier,
    
    @NotBlank(message = "Password is required")
    String password,
    
    String totpCode
) {}
