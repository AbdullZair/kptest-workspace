package com.kptest.api.dto;

import com.fasterxml.jackson.annotation.JsonProperty;

/**
 * 2FA enable response with QR code data.
 */
public record Enable2faResponse(
    boolean enabled,
    
    @JsonProperty("qr_code_url")
    String qrCodeUrl,
    
    @JsonProperty("secret_key")
    String secretKey,
    
    @JsonProperty("backup_codes")
    String[] backupCodes
) {
    
    public static Enable2faResponse notEnabled() {
        return new Enable2faResponse(false, null, null, null);
    }
}
