package com.kptest.api.dto;

import com.kptest.domain.message.MessagePriority;

import java.time.Instant;
import java.util.List;
import java.util.UUID;

/**
 * DTO for Message entity.
 */
public record MessageDto(
    UUID id,
    UUID threadId,
    UUID senderId,
    String content,
    MessagePriority priority,
    Instant sentAt,
    Instant readAt,
    List<UUID> readBy,
    UUID parentMessageId,
    String internalNote,
    List<MessageAttachmentDto> attachments
) {
    public static MessageDto fromEntity(com.kptest.domain.message.Message message) {
        UUID parentMessageId = message.getParentMessage() != null
            ? message.getParentMessage().getId()
            : null;

        List<MessageAttachmentDto> attachmentDtos = message.getAttachments().stream()
            .map(MessageAttachmentDto::fromEntity)
            .toList();

        return new MessageDto(
            message.getId(),
            message.getThread().getId(),
            message.getSenderId(),
            message.getContent(),
            message.getPriority(),
            message.getSentAt(),
            message.getReadAt(),
            message.getReadBy(),
            parentMessageId,
            message.getInternalNote(),
            attachmentDtos
        );
    }
}
