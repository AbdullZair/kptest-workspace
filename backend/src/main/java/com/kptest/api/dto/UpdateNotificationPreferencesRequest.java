package com.kptest.api.dto;

/**
 * DTO for updating notification preferences.
 */
public record UpdateNotificationPreferencesRequest(
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
}
