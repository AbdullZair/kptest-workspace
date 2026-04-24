package com.kptest.api.dto;

import com.fasterxml.jackson.annotation.JsonProperty;
import com.kptest.domain.user.AccountStatus;

/**
 * Request to update user status.
 */
public record UpdateUserStatusRequest(
    @JsonProperty("new_status")
    AccountStatus newStatus
) {
}
