package com.kptest.api.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

import java.util.UUID;

/**
 * Request for delegating a message thread to a team member.
 */
public record DelegateMessageRequest(
    @NotNull(message = "Assignee ID is required")
    UUID assigneeId,

    @NotBlank(message = "Status is required")
    String status,

    String comment
) {
}
