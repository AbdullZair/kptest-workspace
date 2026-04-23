package com.kptest.api.dto;

import com.kptest.domain.message.MessagePriority;
import com.kptest.domain.message.ThreadType;

import java.time.Instant;
import java.util.List;
import java.util.UUID;

/**
 * DTO for MessageThread entity.
 */
public record MessageThreadDto(
    UUID id,
    UUID projectId,
    String title,
    ThreadType type,
    UUID createdBy,
    Instant createdAt,
    Instant lastMessageAt,
    Integer messageCount,
    Integer unreadCount
) {
    public static MessageThreadDto fromEntity(
        com.kptest.domain.message.MessageThread thread,
        Integer messageCount,
        Integer unreadCount
    ) {
        return new MessageThreadDto(
            thread.getId(),
            thread.getProjectId(),
            thread.getTitle(),
            thread.getType(),
            thread.getCreatedBy(),
            thread.getCreatedAt(),
            thread.getLastMessageAt(),
            messageCount,
            unreadCount
        );
    }

    public static MessageThreadDto fromEntity(com.kptest.domain.message.MessageThread thread) {
        return new MessageThreadDto(
            thread.getId(),
            thread.getProjectId(),
            thread.getTitle(),
            thread.getType(),
            thread.getCreatedBy(),
            thread.getCreatedAt(),
            thread.getLastMessageAt(),
            null,
            null
        );
    }
}
