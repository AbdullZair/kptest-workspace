package com.kptest.domain.notification;

import jakarta.persistence.*;
import lombok.*;
import org.springframework.data.annotation.CreatedDate;
import org.springframework.data.annotation.LastModifiedDate;
import org.springframework.data.jpa.domain.support.AuditingEntityListener;

import java.time.Instant;
import java.util.UUID;

/**
 * Notification preference entity for storing user notification settings.
 */
@Entity
@Table(name = "notification_preferences", indexes = {
    @Index(name = "idx_notification_preferences_user_id", columnList = "user_id")
})
@EntityListeners(AuditingEntityListener.class)
@Getter
@Setter
@NoArgsConstructor(access = AccessLevel.PROTECTED)
@EqualsAndHashCode(of = "id")
public class NotificationPreference {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @Column(name = "user_id", nullable = false, unique = true)
    private UUID userId;

    @Column(name = "message_notifications", nullable = false)
    private Boolean messageNotifications;

    @Column(name = "event_notifications", nullable = false)
    private Boolean eventNotifications;

    @Column(name = "material_notifications", nullable = false)
    private Boolean materialNotifications;

    @Column(name = "reminder_notifications", nullable = false)
    private Boolean reminderNotifications;

    @Column(name = "email_enabled", nullable = false)
    private Boolean emailEnabled;

    @Column(name = "sms_enabled", nullable = false)
    private Boolean smsEnabled;

    @Column(name = "push_enabled", nullable = false)
    private Boolean pushEnabled;

    @Column(name = "quiet_hours_start", length = 5)
    private String quietHoursStart;

    @Column(name = "quiet_hours_end", length = 5)
    private String quietHoursEnd;

    @CreatedDate
    @Column(name = "created_at", nullable = false, updatable = false)
    private Instant createdAt;

    @LastModifiedDate
    @Column(name = "updated_at", nullable = false)
    private Instant updatedAt;

    /**
     * Factory method for creating default notification preferences.
     */
    public static NotificationPreference createDefault(UUID userId) {
        NotificationPreference preference = new NotificationPreference();
        preference.userId = userId;
        preference.messageNotifications = true;
        preference.eventNotifications = true;
        preference.materialNotifications = true;
        preference.reminderNotifications = true;
        preference.emailEnabled = false;
        preference.smsEnabled = false;
        preference.pushEnabled = true;
        preference.quietHoursStart = "22:00";
        preference.quietHoursEnd = "07:00";
        return preference;
    }

    /**
     * Check if notifications are enabled for a given type.
     */
    public boolean isEnabledForType(NotificationType type) {
        return switch (type) {
            case MESSAGE -> messageNotifications;
            case EVENT, SCHEDULE_CHANGE -> eventNotifications;
            case MATERIAL -> materialNotifications;
            case REMINDER -> reminderNotifications;
        };
    }

    /**
     * Check if current time is within quiet hours.
     */
    public boolean isQuietHours() {
        if (quietHoursStart == null || quietHoursEnd == null) {
            return false;
        }

        String[] startParts = quietHoursStart.split(":");
        String[] endParts = quietHoursEnd.split(":");

        int startHour = Integer.parseInt(startParts[0]);
        int startMinute = Integer.parseInt(startParts[1]);
        int endHour = Integer.parseInt(endParts[0]);
        int endMinute = Integer.parseInt(endParts[1]);

        java.time.LocalTime now = java.time.LocalTime.now();
        java.time.LocalTime startTime = java.time.LocalTime.of(startHour, startMinute);
        java.time.LocalTime endTime = java.time.LocalTime.of(endHour, endMinute);

        if (startTime.isBefore(endTime)) {
            // Quiet hours within same day (e.g., 09:00 - 17:00)
            return !now.isBefore(startTime) && !now.isAfter(endTime);
        } else {
            // Quiet hours跨越 midnight (e.g., 22:00 - 07:00)
            return now.isAfter(startTime) || now.isBefore(endTime);
        }
    }
}
