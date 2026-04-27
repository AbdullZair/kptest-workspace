package com.kptest.api.controller;

import com.kptest.api.dto.RegisterDeviceRequest;
import com.kptest.application.service.NotificationService;
import com.kptest.domain.notification.UserDeviceToken;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.Map;
import java.util.UUID;

/**
 * Notification REST Controller.
 * Handles device registration for push notifications.
 */
@Slf4j
@RestController
@RequestMapping("/api/v1/notifications")
@RequiredArgsConstructor
@Tag(name = "Notifications", description = "Push notification management endpoints")
public class NotificationController {

    private final NotificationService notificationService;

    /**
     * Register a device token for push notifications.
     */
    @PostMapping("/devices/register")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<Map<String, String>> registerDevice(
            @AuthenticationPrincipal String userIdStr,
            @Valid @RequestBody RegisterDeviceRequest request) {

        UUID userId = UUID.fromString(userIdStr);
        log.info("Register device token request for user: {}, platform: {}", userId, request.platform());

        UserDeviceToken.Platform platform = UserDeviceToken.Platform.valueOf(request.platform().name());
        notificationService.registerDeviceToken(userId, request.token(), platform);

        return ResponseEntity.ok(Map.of("message", "Device registered successfully"));
    }
}
