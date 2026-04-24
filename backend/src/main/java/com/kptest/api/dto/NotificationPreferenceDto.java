package com.kptest.api.dto;

import java.util.UUID;

/**
 * DTO for NotificationPreference entity.
 */
public record NotificationPreferenceDto(
    UUID id,
    UUID userId,
    Boolean messageNotifications,
    Boolean eventNotifications,
    Boolean materialNotifications,
    Boolean reminderNotifications,
    Boolean emailEnabled,
    Boolean smsEnabled,
    Boolean pushEnabled,
    String quietHoursStart,
    String quietHoursEnd
) {
    public static NotificationPreferenceDto fromEntity(com.kptest.domain.notification.NotificationPreference preference) {
        return new NotificationPreferenceDto(
            preference.getId(),
            preference.getUserId(),
            preference.getMessageNotifications(),
            preference.getEventNotifications(),
            preference.getMaterialNotifications(),
            preference.getReminderNotifications(),
            preference.getEmailEnabled(),
            preference.getSmsEnabled(),
            preference.getPushEnabled(),
            preference.getQuietHoursStart(),
            preference.getQuietHoursEnd()
        );
    }
}
