package com.kptest.api.dto;

import com.kptest.validation.ValidPassword;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

/**
 * Request DTO for changing password.
 */
public record ChangePasswordRequest(
    @NotBlank(message = "Current password is required")
    @Size(min = 1, message = "Current password is required")
    String currentPassword,

    @NotBlank(message = "New password is required")
    @ValidPassword
    String newPassword
) {}
