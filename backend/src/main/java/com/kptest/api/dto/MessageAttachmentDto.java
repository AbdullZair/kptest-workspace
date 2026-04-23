package com.kptest.api.dto;

import java.time.Instant;
import java.util.UUID;

/**
 * DTO for MessageAttachment entity.
 */
public record MessageAttachmentDto(
    UUID id,
    UUID messageId,
    String fileName,
    String fileType,
    Long fileSize,
    String storagePath,
    Instant uploadedAt
) {
    public static MessageAttachmentDto fromEntity(com.kptest.domain.message.MessageAttachment attachment) {
        UUID messageId = attachment.getMessage() != null
            ? attachment.getMessage().getId()
            : null;

        return new MessageAttachmentDto(
            attachment.getId(),
            messageId,
            attachment.getFileName(),
            attachment.getFileType(),
            attachment.getFileSize(),
            attachment.getStoragePath(),
            attachment.getUploadedAt()
        );
    }
}
