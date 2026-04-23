package com.kptest.api.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;

/**
 * Password reset verification request.
 */
public record ResetPasswordRequest(
    @NotBlank(message = "Reset token is required")
    String token,
    
    @NotBlank(message = "New password is required")
    @Size(min = 10, message = "Password must be at least 10 characters")
    @Pattern(
        regexp = "^(?=.*[a-z])(?=.*[A-Z])(?=.*\\d)(?=.*[@$!%*?&])[A-Za-z\\d@$!%*?&]+$",
        message = "Password must contain uppercase, lowercase, digit, and special character"
    )
    String newPassword
) {}
