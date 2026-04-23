package com.kptest.api.dto;

import com.fasterxml.jackson.annotation.JsonProperty;

/**
 * 2FA enable request.
 */
public record Enable2faRequest(
    @JsonProperty("totp_code")
    String totpCode
) {}
