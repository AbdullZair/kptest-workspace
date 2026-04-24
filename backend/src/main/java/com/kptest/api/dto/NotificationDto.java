package com.kptest.api.dto;

import com.kptest.domain.notification.NotificationType;

import java.time.Instant;
import java.util.UUID;

/**
 * DTO for Notification entity.
 */
public record NotificationDto(
    UUID id,
    UUID userId,
    NotificationType type,
    String title,
    String content,
    String actionUrl,
    Boolean read,
    Boolean sentPush,
    Boolean sentEmail,
    Boolean sentSms,
    Instant scheduledFor,
    Instant sentAt,
    Instant createdAt
) {
    public static NotificationDto fromEntity(com.kptest.domain.notification.Notification notification) {
        return new NotificationDto(
            notification.getId(),
            notification.getUserId(),
            notification.getType(),
            notification.getTitle(),
            notification.getContent(),
            notification.getActionUrl(),
            notification.getRead(),
            notification.getSentPush(),
            notification.getSentEmail(),
            notification.getSentSms(),
            notification.getScheduledFor(),
            notification.getSentAt(),
            notification.getCreatedAt()
        );
    }
}
