package com.kptest.api.dto;

import com.fasterxml.jackson.annotation.JsonProperty;

/**
 * Authentication response containing JWT tokens.
 */
public record AuthResponse(
    @JsonProperty("access_token")
    String accessToken,
    
    @JsonProperty("refresh_token")
    String refreshToken,
    
    @JsonProperty("token_type")
    String tokenType,
    
    @JsonProperty("expires_in")
    long expiresIn,
    
    boolean requires2fa,
    
    @JsonProperty("temp_token")
    String tempToken
) {
    
    public static AuthResponse tokens(String accessToken, String refreshToken, long expiresIn) {
        return new AuthResponse(accessToken, refreshToken, "Bearer", expiresIn, false, null);
    }
    
    public static AuthResponse requires2fa(String tempToken) {
        return new AuthResponse(null, null, "Bearer", 0, true, tempToken);
    }
}
