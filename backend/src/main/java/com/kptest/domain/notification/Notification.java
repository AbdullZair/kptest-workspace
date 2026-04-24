package com.kptest.domain.notification;

import jakarta.persistence.*;
import lombok.*;
import org.springframework.data.annotation.CreatedDate;
import org.springframework.data.jpa.domain.support.AuditingEntityListener;

import java.time.Instant;
import java.util.UUID;

/**
 * Notification entity for storing user notifications.
 */
@Entity
@Table(name = "notifications", indexes = {
    @Index(name = "idx_notifications_user_id", columnList = "user_id"),
    @Index(name = "idx_notifications_user_read", columnList = "user_id, read"),
    @Index(name = "idx_notifications_scheduled_for", columnList = "scheduled_for"),
    @Index(name = "idx_notifications_created_at", columnList = "created_at")
})
@EntityListeners(AuditingEntityListener.class)
@Getter
@Setter
@NoArgsConstructor(access = AccessLevel.PROTECTED)
@EqualsAndHashCode(of = "id")
public class Notification {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @Column(name = "user_id", nullable = false)
    private UUID userId;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private NotificationType type;

    @Column(nullable = false, length = 255)
    private String title;

    @Column(nullable = false, columnDefinition = "TEXT")
    private String content;

    @Column(name = "action_url", length = 500)
    private String actionUrl;

    @Column(nullable = false)
    private Boolean read;

    @Column(name = "sent_push", nullable = false)
    private Boolean sentPush;

    @Column(name = "sent_email", nullable = false)
    private Boolean sentEmail;

    @Column(name = "sent_sms", nullable = false)
    private Boolean sentSms;

    @Column(name = "scheduled_for")
    private Instant scheduledFor;

    @Column(name = "sent_at")
    private Instant sentAt;

    @CreatedDate
    @Column(name = "created_at", nullable = false, updatable = false)
    private Instant createdAt;

    /**
     * Factory method for creating a new notification.
     */
    public static Notification create(
        UUID userId,
        NotificationType type,
        String title,
        String content,
        String actionUrl
    ) {
        Notification notification = new Notification();
        notification.userId = userId;
        notification.type = type;
        notification.title = title;
        notification.content = content;
        notification.actionUrl = actionUrl;
        notification.read = false;
        notification.sentPush = false;
        notification.sentEmail = false;
        notification.sentSms = false;
        return notification;
    }

    /**
     * Mark notification as read.
     */
    public void markAsRead() {
        this.read = true;
    }

    /**
     * Mark notification as sent via push.
     */
    public void markPushSent() {
        this.sentPush = true;
    }

    /**
     * Mark notification as sent via email.
     */
    public void markEmailSent() {
        this.sentEmail = true;
    }

    /**
     * Mark notification as sent via SMS.
     */
    public void markSmsSent() {
        this.sentSms = true;
    }

    /**
     * Mark notification as sent.
     */
    public void markSent() {
        this.sentAt = Instant.now();
    }

    /**
     * Check if notification should be sent based on scheduled time.
     */
    public boolean isDueForSending() {
        if (scheduledFor == null) {
            return true;
        }
        return Instant.now().isAfter(scheduledFor) || Instant.now().equals(scheduledFor);
    }
}
