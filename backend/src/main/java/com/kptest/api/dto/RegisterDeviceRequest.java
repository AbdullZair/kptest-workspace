package com.kptest.api.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

/**
 * Request DTO for registering a device token for push notifications.
 */
public record RegisterDeviceRequest(
    @NotBlank(message = "Device token is required")
    String token,

    @NotNull(message = "Platform is required")
    Platform platform
) {

    public enum Platform {
        IOS,
        ANDROID
    }
}
