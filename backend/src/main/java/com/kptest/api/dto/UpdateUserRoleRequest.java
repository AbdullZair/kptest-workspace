package com.kptest.api.dto;

import com.fasterxml.jackson.annotation.JsonProperty;
import com.kptest.domain.user.AccountStatus;
import com.kptest.domain.user.UserRole;

/**
 * Request to update user role.
 */
public record UpdateUserRoleRequest(
    @JsonProperty("new_role")
    UserRole newRole
) {
}
