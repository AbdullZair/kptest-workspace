package com.kptest.api.controller;

import com.kptest.api.dto.NotificationDto;
import com.kptest.api.dto.NotificationPreferenceDto;
import com.kptest.api.dto.SendNotificationRequest;
import com.kptest.api.dto.UpdateNotificationPreferencesRequest;
import com.kptest.application.service.NotificationService;
import com.kptest.domain.notification.NotificationType;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;
import java.util.UUID;

/**
 * Notification REST Controller.
 * Handles all notification-related operations.
 */
@Slf4j
@RestController
@RequestMapping("/api/v1/notifications")
@RequiredArgsConstructor
@Tag(name = "Notifications", description = "Notification management endpoints")
public class NotificationController {

    private final NotificationService notificationService;

    /**
     * Get all notifications for the current user.
     */
    @GetMapping
    @PreAuthorize("hasAnyRole('ADMIN', 'DOCTOR', 'NURSE', 'RECEPTIONIST', 'USER')")
    @Operation(summary = "Get notifications", description = "Returns a list of notifications for the current user with optional filtering")
    public ResponseEntity<List<NotificationDto>> getNotifications(
        @Parameter(description = "Notification type to filter by")
        @RequestParam(required = false) NotificationType type,

        @Parameter(description = "Read status filter (true for read, false for unread)")
        @RequestParam(required = false) Boolean read,

        @Parameter(description = "Page number (0-indexed)")
        @RequestParam(defaultValue = "0") int page,

        @Parameter(description = "Page size")
        @RequestParam(defaultValue = "20") int size,

        @RequestParam String userId
    ) {
        UUID userUuid = UUID.fromString(userId);
        log.info("GET /api/v1/notifications - userId={}, type={}, read={}, page={}, size={}", userUuid, type, read, page, size);

        List<NotificationDto> notifications = notificationService.getNotifications(userUuid, type, read, page, size);

        return ResponseEntity.ok(notifications);
    }

    /**
     * Get unread notifications for the current user.
     */
    @GetMapping("/unread")
    @PreAuthorize("hasAnyRole('ADMIN', 'DOCTOR', 'NURSE', 'RECEPTIONIST', 'USER')")
    @Operation(summary = "Get unread notifications", description = "Returns unread notifications for the current user")
    public ResponseEntity<List<NotificationDto>> getUnreadNotifications(
        @RequestParam String userId
    ) {
        UUID userUuid = UUID.fromString(userId);
        log.info("GET /api/v1/notifications/unread - userId={}", userUuid);

        List<NotificationDto> notifications = notificationService.getUnreadNotifications(userUuid);

        return ResponseEntity.ok(notifications);
    }

    /**
     * Get unread notification count for the current user.
     */
    @GetMapping("/count")
    @PreAuthorize("hasAnyRole('ADMIN', 'DOCTOR', 'NURSE', 'RECEPTIONIST', 'USER')")
    @Operation(summary = "Get unread count", description = "Returns the count of unread notifications for the current user")
    public ResponseEntity<Map<String, Long>> getUnreadCount(
        @RequestParam String userId
    ) {
        UUID userUuid = UUID.fromString(userId);
        log.info("GET /api/v1/notifications/count - userId={}", userUuid);

        long count = notificationService.getUnreadCount(userUuid);

        return ResponseEntity.ok(Map.of(
            "count", count
        ));
    }

    /**
     * Mark a notification as read.
     */
    @PutMapping("/{id}/read")
    @PreAuthorize("hasAnyRole('ADMIN', 'DOCTOR', 'NURSE', 'RECEPTIONIST', 'USER')")
    @Operation(summary = "Mark notification as read", description = "Marks a notification as read by the current user")
    public ResponseEntity<NotificationDto> markAsRead(
        @Parameter(description = "Notification ID")
        @PathVariable UUID id,

        @RequestParam String userId
    ) {
        UUID userUuid = UUID.fromString(userId);
        log.info("PUT /api/v1/notifications/{}/read - userId={}", id, userUuid);

        NotificationDto notification = notificationService.markAsRead(id);

        return ResponseEntity.ok(notification);
    }

    /**
     * Mark all notifications as read for the current user.
     */
    @PutMapping("/read-all")
    @PreAuthorize("hasAnyRole('ADMIN', 'DOCTOR', 'NURSE', 'RECEPTIONIST', 'USER')")
    @Operation(summary = "Mark all notifications as read", description = "Marks all notifications as read for the current user")
    public ResponseEntity<Void> markAllAsRead(
        @RequestParam String userId
    ) {
        UUID userUuid = UUID.fromString(userId);
        log.info("PUT /api/v1/notifications/read-all - userId={}", userUuid);

        notificationService.markAllAsRead(userUuid);

        return ResponseEntity.ok().build();
    }

    /**
     * Delete a notification.
     */
    @DeleteMapping("/{id}")
    @PreAuthorize("hasAnyRole('ADMIN', 'DOCTOR', 'NURSE', 'RECEPTIONIST', 'USER')")
    @Operation(summary = "Delete notification", description = "Deletes a notification by ID")
    public ResponseEntity<Void> deleteNotification(
        @Parameter(description = "Notification ID")
        @PathVariable UUID id,

        @RequestParam String userId
    ) {
        UUID userUuid = UUID.fromString(userId);
        log.info("DELETE /api/v1/notifications/{} - userId={}", id, userUuid);

        notificationService.deleteNotification(id);

        return ResponseEntity.noContent().build();
    }

    /**
     * Get notification preferences for the current user.
     */
    @GetMapping("/preferences")
    @PreAuthorize("hasAnyRole('ADMIN', 'DOCTOR', 'NURSE', 'RECEPTIONIST', 'USER')")
    @Operation(summary = "Get notification preferences", description = "Returns notification preferences for the current user")
    public ResponseEntity<NotificationPreferenceDto> getPreferences(
        @RequestParam String userId
    ) {
        UUID userUuid = UUID.fromString(userId);
        log.info("GET /api/v1/notifications/preferences - userId={}", userUuid);

        NotificationPreferenceDto preferences = notificationService.getPreferences(userUuid);

        return ResponseEntity.ok(preferences);
    }

    /**
     * Update notification preferences for the current user.
     */
    @PutMapping("/preferences")
    @PreAuthorize("hasAnyRole('ADMIN', 'DOCTOR', 'NURSE', 'RECEPTIONIST', 'USER')")
    @Operation(summary = "Update notification preferences", description = "Updates notification preferences for the current user")
    public ResponseEntity<NotificationPreferenceDto> updatePreferences(
        @Parameter(description = "Preferences update data")
        @Valid @RequestBody UpdateNotificationPreferencesRequest request,

        @RequestParam String userId
    ) {
        UUID userUuid = UUID.fromString(userId);
        log.info("PUT /api/v1/notifications/preferences - userId={}", userUuid);

        NotificationPreferenceDto preferences = notificationService.updatePreferences(userUuid, request);

        return ResponseEntity.ok(preferences);
    }

    /**
     * Send a test notification.
     */
    @PostMapping("/test")
    @PreAuthorize("hasAnyRole('ADMIN', 'DOCTOR', 'NURSE', 'RECEPTIONIST', 'USER')")
    @Operation(summary = "Send test notification", description = "Sends a test notification to the current user")
    public ResponseEntity<NotificationDto> sendTestNotification(
        @Parameter(description = "Test notification data")
        @Valid @RequestBody(required = false) SendNotificationRequest request,

        @RequestParam String userId
    ) {
        UUID userUuid = UUID.fromString(userId);
        log.info("POST /api/v1/notifications/test - userId={}", userUuid);

        // Use default test notification if no request provided
        SendNotificationRequest testRequest = request != null ? request : new SendNotificationRequest(
            userUuid,
            NotificationType.REMINDER,
            "Test Notification",
            "This is a test notification to verify the notification system is working correctly.",
            null,
            true,
            false,
            false,
            null
        );

        // Override userId to ensure it matches the authenticated user
        SendNotificationRequest finalRequest = new SendNotificationRequest(
            userUuid,
            testRequest.type(),
            testRequest.title(),
            testRequest.content(),
            testRequest.actionUrl(),
            testRequest.sendPush(),
            testRequest.sendEmail(),
            testRequest.sendSms(),
            testRequest.scheduledFor()
        );

        NotificationDto notification = notificationService.sendNotification(finalRequest);

        return ResponseEntity
            .status(HttpStatus.CREATED)
            .body(notification);
    }
}
