package com.kptest.api.dto;

import com.fasterxml.jackson.annotation.JsonProperty;
import com.kptest.domain.user.AccountStatus;
import com.kptest.domain.user.User;
import com.kptest.domain.user.UserRole;

import java.time.Instant;

/**
 * User summary response for admin panel.
 */
public record UserAdminDto(
    @JsonProperty("user_id")
    String userId,

    String email,

    String phone,

    String role,

    String status,

    @JsonProperty("created_at")
    Instant createdAt,

    @JsonProperty("updated_at")
    Instant updatedAt,

    @JsonProperty("last_login_at")
    Instant lastLoginAt,

    @JsonProperty("two_factor_enabled")
    boolean twoFactorEnabled,

    @JsonProperty("failed_login_attempts")
    int failedLoginAttempts
) {

    public static UserAdminDto fromUser(User user) {
        return new UserAdminDto(
            user.getId().toString(),
            user.getEmail(),
            user.getPhone(),
            user.getRole().name(),
            user.getStatus().name(),
            user.getCreatedAt(),
            user.getUpdatedAt(),
            user.getLastLoginAt(),
            user.isTwoFactorEnabled(),
            user.getFailedLoginAttempts()
        );
    }
}
