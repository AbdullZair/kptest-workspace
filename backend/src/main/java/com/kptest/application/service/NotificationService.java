package com.kptest.application.service;

import com.kptest.api.dto.NotificationDto;
import com.kptest.api.dto.NotificationPreferenceDto;
import com.kptest.api.dto.PushPayload;
import com.kptest.api.dto.SendNotificationRequest;
import com.kptest.api.dto.UpdateNotificationPreferencesRequest;
import com.kptest.domain.notification.Notification;
import com.kptest.domain.notification.NotificationPreference;
import com.kptest.domain.notification.NotificationType;
import com.kptest.domain.notification.UserDeviceToken;
import com.kptest.domain.notification.repository.NotificationPreferenceRepository;
import com.kptest.domain.notification.repository.NotificationRepository;
import com.kptest.domain.notification.repository.UserDeviceTokenRepository;
import com.kptest.domain.user.User;
import com.kptest.domain.user.UserRepository;
import com.kptest.exception.ResourceNotFoundException;
import com.kptest.infrastructure.push.PushNotificationProvider;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Instant;
import java.time.temporal.ChronoUnit;
import java.util.List;
import java.util.Map;
import java.util.UUID;

/**
 * Notification service handling all notification-related operations.
 */
@Slf4j
@Service
@RequiredArgsConstructor
@Transactional
public class NotificationService {

    private final NotificationRepository notificationRepository;
    private final NotificationPreferenceRepository preferenceRepository;
    private final UserRepository userRepository;
    private final UserDeviceTokenRepository deviceTokenRepository;
    private final PushNotificationProvider pushNotificationProvider;

    /**
     * Get notifications for a user with optional filtering.
     *
     * @param userId User ID
     * @param type Notification type filter (nullable)
     * @param read Read status filter (nullable)
     * @param page Page number
     * @param size Page size
     * @return List of notifications
     */
    @Transactional(readOnly = true)
    public List<NotificationDto> getNotifications(
        UUID userId,
        NotificationType type,
        Boolean read,
        int page,
        int size
    ) {
        log.debug("Finding notifications for user: {}, type: {}, read: {}, page: {}, size: {}", userId, type, read, page, size);

        Pageable pageable = PageRequest.of(page, size, Sort.by(Sort.Direction.DESC, "createdAt"));
        List<Notification> notifications;

        if (type != null && read != null) {
            if (read) {
                notifications = notificationRepository.findByUserIdAndType(userId, type, pageable);
            } else {
                notifications = notificationRepository.findUnreadByUserIdAndType(userId, type, pageable);
            }
        } else if (type != null) {
            notifications = notificationRepository.findByUserIdAndType(userId, type, pageable);
        } else if (Boolean.FALSE.equals(read)) {
            notifications = notificationRepository.findUnreadByUserId(userId, pageable);
        } else {
            notifications = notificationRepository.findByUserId(userId, pageable);
        }

        return notifications.stream()
            .map(NotificationDto::fromEntity)
            .toList();
    }

    /**
     * Get unread notifications for a user.
     *
     * @param userId User ID
     * @return List of unread notifications
     */
    @Transactional(readOnly = true)
    public List<NotificationDto> getUnreadNotifications(UUID userId) {
        log.debug("Finding unread notifications for user: {}", userId);

        Pageable pageable = PageRequest.of(0, 50, Sort.by(Sort.Direction.DESC, "createdAt"));
        List<Notification> notifications = notificationRepository.findUnreadByUserId(userId, pageable);

        return notifications.stream()
            .map(NotificationDto::fromEntity)
            .toList();
    }

    /**
     * Get unread notification count for a user.
     *
     * @param userId User ID
     * @return Unread notification count
     */
    @Transactional(readOnly = true)
    public long getUnreadCount(UUID userId) {
        log.debug("Counting unread notifications for user: {}", userId);
        return notificationRepository.countUnreadByUserId(userId);
    }

    /**
     * Mark a notification as read.
     *
     * @param notificationId Notification ID
     * @return Updated notification DTO
     * @throws ResourceNotFoundException if notification not found
     */
    public NotificationDto markAsRead(UUID notificationId) {
        log.info("Marking notification as read - id: {}", notificationId);

        Notification notification = notificationRepository.findById(notificationId)
            .orElseThrow(() -> new ResourceNotFoundException("Notification not found with id: " + notificationId));

        notification.markAsRead();
        Notification savedNotification = notificationRepository.save(notification);

        log.info("Marked notification as read: {}", notificationId);

        return NotificationDto.fromEntity(savedNotification);
    }

    /**
     * Mark all notifications as read for a user.
     *
     * @param userId User ID
     */
    public void markAllAsRead(UUID userId) {
        log.info("Marking all notifications as read for user: {}", userId);
        notificationRepository.markAllAsRead(userId);
        log.info("Marked all notifications as read for user: {}", userId);
    }

    /**
     * Delete a notification.
     *
     * @param notificationId Notification ID
     * @throws ResourceNotFoundException if notification not found
     */
    public void deleteNotification(UUID notificationId) {
        log.info("Deleting notification - id: {}", notificationId);

        if (!notificationRepository.existsById(notificationId)) {
            throw new ResourceNotFoundException("Notification not found with id: " + notificationId);
        }

        notificationRepository.deleteById(notificationId);
        log.info("Deleted notification: {}", notificationId);
    }

    /**
     * Get notification preferences for a user.
     *
     * @param userId User ID
     * @return Notification preferences DTO
     */
    @Transactional(readOnly = true)
    public NotificationPreferenceDto getPreferences(UUID userId) {
        log.debug("Finding notification preferences for user: {}", userId);

        NotificationPreference preference = preferenceRepository.findByUserId(userId)
            .orElseGet(() -> {
                log.info("Creating default notification preferences for user: {}", userId);
                NotificationPreference defaultPreference = NotificationPreference.createDefault(userId);
                return preferenceRepository.save(defaultPreference);
            });

        return NotificationPreferenceDto.fromEntity(preference);
    }

    /**
     * Update notification preferences for a user.
     *
     * @param userId User ID
     * @param request Update preferences request
     * @return Updated preferences DTO
     */
    public NotificationPreferenceDto updatePreferences(UUID userId, UpdateNotificationPreferencesRequest request) {
        log.info("Updating notification preferences for user: {}", userId);

        NotificationPreference preference = preferenceRepository.findByUserId(userId)
            .orElseGet(() -> {
                log.info("Creating default notification preferences for user: {}", userId);
                return NotificationPreference.createDefault(userId);
            });

        // Update fields if provided
        if (request.messageNotifications() != null) {
            preference.setMessageNotifications(request.messageNotifications());
        }
        if (request.eventNotifications() != null) {
            preference.setEventNotifications(request.eventNotifications());
        }
        if (request.materialNotifications() != null) {
            preference.setMaterialNotifications(request.materialNotifications());
        }
        if (request.reminderNotifications() != null) {
            preference.setReminderNotifications(request.reminderNotifications());
        }
        if (request.emailEnabled() != null) {
            preference.setEmailEnabled(request.emailEnabled());
        }
        if (request.smsEnabled() != null) {
            preference.setSmsEnabled(request.smsEnabled());
        }
        if (request.pushEnabled() != null) {
            preference.setPushEnabled(request.pushEnabled());
        }
        if (request.quietHoursStart() != null) {
            preference.setQuietHoursStart(request.quietHoursStart());
        }
        if (request.quietHoursEnd() != null) {
            preference.setQuietHoursEnd(request.quietHoursEnd());
        }

        NotificationPreference savedPreference = preferenceRepository.save(preference);
        log.info("Updated notification preferences for user: {}", userId);

        return NotificationPreferenceDto.fromEntity(savedPreference);
    }

    /**
     * Send a notification to a user.
     *
     * @param request Send notification request
     * @return Sent notification DTO
     */
    public NotificationDto sendNotification(SendNotificationRequest request) {
        log.info("Sending notification to user: {}, type: {}, title: {}", request.userId(), request.type(), request.title());

        // Check if user exists
        User user = userRepository.findById(request.userId())
            .orElseThrow(() -> new ResourceNotFoundException("User not found with id: " + request.userId()));

        // Get user preferences
        NotificationPreference preference = preferenceRepository.findByUserId(request.userId())
            .orElseGet(() -> {
                NotificationPreference defaultPreference = NotificationPreference.createDefault(request.userId());
                return preferenceRepository.save(defaultPreference);
            });

        // Check if notifications are enabled for this type
        if (!preference.isEnabledForType(request.type())) {
            log.info("Notifications disabled for type: {} for user: {}", request.type(), request.userId());
            throw new IllegalStateException("Notifications disabled for type: " + request.type());
        }

        // Create notification
        Notification notification = Notification.create(
            request.userId(),
            request.type(),
            request.title(),
            request.content(),
            request.actionUrl()
        );

        // Set scheduled time if provided
        if (request.scheduledFor() != null) {
            notification.setScheduledFor(request.scheduledFor());
        } else {
            // Send immediately
            notification.markSent();

            // Send via enabled channels
            if (Boolean.TRUE.equals(request.sendPush()) && Boolean.TRUE.equals(preference.getPushEnabled())) {
                sendPushNotification(request.userId(), request.title(), request.content());
                notification.markPushSent();
            }

            if (Boolean.TRUE.equals(request.sendEmail()) && Boolean.TRUE.equals(preference.getEmailEnabled())) {
                sendEmailNotification(request.userId(), request.title(), request.content());
                notification.markEmailSent();
            }

            if (Boolean.TRUE.equals(request.sendSms()) && Boolean.TRUE.equals(preference.getSmsEnabled())) {
                sendSmsNotification(request.userId(), request.content());
                notification.markSmsSent();
            }
        }

        Notification savedNotification = notificationRepository.save(notification);
        log.info("Sent notification with ID: {}", savedNotification.getId());

        return NotificationDto.fromEntity(savedNotification);
    }

    /**
     * Send a push notification to a user.
     *
     * @param userId User ID
     * @param title Notification title
     * @param body Notification body
     */
    public void sendPushNotification(UUID userId, String title, String body) {
        sendPushNotification(userId, new PushPayload(title, body, Map.of(), PushPayload.PushType.MESSAGE));
    }

    /**
     * Send a push notification to a user with full payload.
     *
     * @param userId User ID
     * @param payload The notification payload
     */
    public void sendPushNotification(UUID userId, PushPayload payload) {
        log.info("Sending push notification to user: {}, title: {}", userId, payload.title());

        List<UserDeviceToken> deviceTokens = deviceTokenRepository.findByUserId(userId);
        
        if (deviceTokens.isEmpty()) {
            log.debug("No device tokens found for user: {}", userId);
            return;
        }

        for (UserDeviceToken deviceToken : deviceTokens) {
            try {
                pushNotificationProvider.send(deviceToken.getToken(), payload);
                deviceToken.markAsUsed();
            } catch (Exception e) {
                log.error("Failed to send push notification to device: {}", deviceToken.getId(), e);
            }
        }
    }

    /**
     * Register a device token for a user.
     *
     * @param userId User ID
     * @param token Device token
     * @param platform Device platform
     * @return The created device token
     */
    public UserDeviceToken registerDeviceToken(UUID userId, String token, UserDeviceToken.Platform platform) {
        log.info("Registering device token for user: {}, platform: {}", userId, platform);

        // Check if token already exists for this user
        return deviceTokenRepository.findByUserIdAndToken(userId, token)
            .map(existing -> {
                existing.markAsUsed();
                return deviceTokenRepository.save(existing);
            })
            .orElseGet(() -> {
                UserDeviceToken deviceToken = UserDeviceToken.create(userId, token, platform);
                return deviceTokenRepository.save(deviceToken);
            });
    }

    /**
     * Send an email notification to a user.
     *
     * @param userId User ID
     * @param subject Email subject
     * @param body Email body
     */
    public void sendEmailNotification(UUID userId, String subject, String body) {
        log.info("Sending email notification to user: {}, subject: {}", userId, subject);

        User user = userRepository.findById(userId)
            .orElseThrow(() -> new ResourceNotFoundException("User not found with id: " + userId));

        if (user.getEmail() == null || user.getEmail().isBlank()) {
            log.warn("Cannot send email to user: {} - email not set", userId);
            return;
        }

        // TODO: Implement actual email sending via SMTP/SendGrid
        // For now, just log the notification
        log.debug("Email notification queued: to={}, subject={}, body={}", user.getEmail(), subject, body);
    }

    /**
     * Send an SMS notification to a user.
     *
     * @param userId User ID
     * @param message SMS message
     */
    public void sendSmsNotification(UUID userId, String message) {
        log.info("Sending SMS notification to user: {}", userId);

        User user = userRepository.findById(userId)
            .orElseThrow(() -> new ResourceNotFoundException("User not found with id: " + userId));

        if (user.getPhone() == null || user.getPhone().isBlank()) {
            log.warn("Cannot send SMS to user: {} - phone not set", userId);
            return;
        }

        // TODO: Implement actual SMS sending via Twilio/other provider
        // For now, just log the notification
        log.debug("SMS notification queued: to={}, message={}", user.getPhone(), message);
    }

    /**
     * Send scheduled notifications.
     * Scheduled to run every minute.
     */
    @Scheduled(fixedRate = 60000) // 1 minute
    @Transactional
    public void sendScheduledNotifications() {
        log.debug("Checking for scheduled notifications to send");

        Instant now = Instant.now();
        Pageable pageable = PageRequest.of(0, 100, Sort.by(Sort.Direction.ASC, "scheduledFor"));
        List<Notification> notifications = notificationRepository.findScheduledForSending(now, pageable);

        for (Notification notification : notifications) {
            try {
                if (notification.isDueForSending() && notification.getSentAt() == null) {
                    log.info("Sending scheduled notification: {}", notification.getId());

                    // Get user preferences
                    NotificationPreference preference = preferenceRepository.findByUserId(notification.getUserId())
                        .orElseGet(() -> {
                            NotificationPreference defaultPreference = NotificationPreference.createDefault(notification.getUserId());
                            return preferenceRepository.save(defaultPreference);
                        });

                    // Send via enabled channels
                    if (Boolean.TRUE.equals(preference.getPushEnabled())) {
                        sendPushNotification(notification.getUserId(), notification.getTitle(), notification.getContent());
                        notification.markPushSent();
                    }

                    if (Boolean.TRUE.equals(preference.getEmailEnabled())) {
                        sendEmailNotification(notification.getUserId(), notification.getTitle(), notification.getContent());
                        notification.markEmailSent();
                    }

                    if (Boolean.TRUE.equals(preference.getSmsEnabled())) {
                        sendSmsNotification(notification.getUserId(), notification.getContent());
                        notification.markSmsSent();
                    }

                    notification.markSent();
                    notificationRepository.save(notification);

                    log.info("Sent scheduled notification: {}", notification.getId());
                }
            } catch (Exception e) {
                log.error("Error sending scheduled notification: {}", notification.getId(), e);
            }
        }
    }

    /**
     * Clean up old notifications (older than 30 days).
     * Scheduled to run daily at midnight.
     */
    @Scheduled(cron = "0 0 0 * * *") // Daily at midnight
    @Transactional
    public void cleanupOldNotifications() {
        log.info("Cleaning up old notifications (older than 30 days)");

        Instant thirtyDaysAgo = Instant.now().minus(30, ChronoUnit.DAYS);
        notificationRepository.deleteNotificationsOlderThan(thirtyDaysAgo);

        log.info("Cleanup completed for notifications older than: {}", thirtyDaysAgo);
    }

    /**
     * Send event reminder notifications.
     * Scheduled to run every 15 minutes.
     */
    @Scheduled(fixedRate = 900000) // 15 minutes
    @Transactional
    public void sendEventReminders() {
        log.debug("Checking for event reminders to send");
        // TODO: Implement event reminder logic
        // This would query upcoming events and send reminders at 24h, 2h, 30min before
    }

    /**
     * Mark missed events.
     * Scheduled to run every hour.
     */
    @Scheduled(fixedRate = 3600000) // 1 hour
    @Transactional
    public void markMissedEvents() {
        log.debug("Checking for missed events to mark");
        // TODO: Implement missed event marking logic
        // This would query past events that weren't attended and mark them as missed
    }
}
