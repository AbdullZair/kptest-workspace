package com.kptest.api.dto;

import com.kptest.domain.message.MessagePriority;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

import java.util.UUID;

/**
 * Request DTO for sending a message.
 */
public record SendMessageRequest(
    @NotBlank(message = "Content is required")
    String content,

    @NotNull(message = "Priority is required")
    MessagePriority priority,

    UUID parentMessageId,

    String internalNote
) {
}
