package com.kptest.api.dto;

import com.kptest.domain.message.ThreadType;

import java.time.Instant;
import java.util.List;
import java.util.UUID;

/**
 * DTO for inbox thread display with delegation information.
 */
public record InboxThreadDto(
    UUID id,
    UUID projectId,
    String projectName,
    String title,
    ThreadType type,
    Instant createdAt,
    Instant lastMessageAt,
    Integer messageCount,
    Integer unreadCount,
    InboxMessageDto.ThreadStatus status,
    UUID assignedTo,
    String assignedToName,
    UUID createdBy,
    String createdByNames,
    List<String> participants
) {
    public static InboxThreadDto fromEntity(
        com.kptest.domain.message.MessageThread thread,
        String projectName,
        Integer messageCount,
        Integer unreadCount,
        InboxMessageDto.ThreadStatus status,
        UUID assignedTo,
        String assignedToName,
        String createdByNames,
        List<String> participants
    ) {
        return new InboxThreadDto(
            thread.getId(),
            thread.getProjectId(),
            projectName,
            thread.getTitle(),
            thread.getType(),
            thread.getCreatedAt(),
            thread.getLastMessageAt(),
            messageCount,
            unreadCount,
            status,
            assignedTo,
            assignedToName,
            thread.getCreatedBy(),
            createdByNames,
            participants
        );
    }
}
