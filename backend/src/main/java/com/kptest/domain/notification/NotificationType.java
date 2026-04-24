package com.kptest.domain.notification;

/**
 * Enumeration of notification types.
 */
public enum NotificationType {
    /**
     * Direct message notification.
     */
    MESSAGE,

    /**
     * Event-related notification (therapy session, appointment, etc.).
     */
    EVENT,

    /**
     * Material-related notification (new educational material, document, etc.).
     */
    MATERIAL,

    /**
     * Schedule change notification.
     */
    SCHEDULE_CHANGE,

    /**
     * Reminder notification.
     */
    REMINDER
}
