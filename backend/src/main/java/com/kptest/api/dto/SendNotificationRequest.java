package com.kptest.api.dto;

import com.kptest.domain.notification.NotificationType;

import java.time.Instant;
import java.util.UUID;

/**
 * DTO for creating/sending a notification.
 */
public record SendNotificationRequest(
    UUID userId,
    NotificationType type,
    String title,
    String content,
    String actionUrl,
    Boolean sendPush,
    Boolean sendEmail,
    Boolean sendSms,
    Instant scheduledFor
) {
}
