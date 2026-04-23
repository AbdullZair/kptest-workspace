package com.kptest.api.dto;

import com.kptest.domain.message.ThreadType;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

import java.util.UUID;

/**
 * Request DTO for creating a message thread.
 */
public record CreateThreadRequest(
    @NotNull(message = "Project ID is required")
    UUID projectId,

    @NotBlank(message = "Title is required")
    String title,

    @NotNull(message = "Thread type is required")
    ThreadType type
) {
}
