package com.kptest.api.dto;

import com.kptest.domain.message.MessagePriority;

import java.time.Instant;
import java.util.List;
import java.util.UUID;

/**
 * DTO for inbox message display with aggregated information.
 */
public record InboxMessageDto(
    UUID id,
    UUID threadId,
    String threadTitle,
    UUID projectId,
    String projectName,
    UUID senderId,
    String senderName,
    String content,
    MessagePriority priority,
    Instant sentAt,
    Instant readAt,
    List<UUID> readBy,
    ThreadStatus status,
    UUID assignedTo,
    String assignedToName,
    boolean isUnread
) {
    public enum ThreadStatus {
        NEW,
        IN_PROGRESS,
        RESOLVED,
        CLOSED
    }

    public static InboxMessageDto fromEntity(
        com.kptest.domain.message.Message message,
        String threadTitle,
        UUID projectId,
        String projectName,
        String senderName,
        ThreadStatus status,
        UUID assignedTo,
        String assignedToName,
        boolean isUnread
    ) {
        return new InboxMessageDto(
            message.getId(),
            message.getThread().getId(),
            threadTitle,
            projectId,
            projectName,
            message.getSenderId(),
            senderName,
            message.getContent(),
            message.getPriority(),
            message.getSentAt(),
            message.getReadAt(),
            message.getReadBy(),
            status,
            assignedTo,
            assignedToName,
            isUnread
        );
    }
}
