package com.kptest.api.controller;

import com.kptest.api.dto.NotificationPreferenceDto;
import com.kptest.api.dto.UpdateNotificationPreferencesRequest;
import com.kptest.application.service.NotificationService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.UUID;

/**
 * Notification preferences REST controller (US-K-26).
 * Exposes the current user's preferences under /api/v1/me/notification-preferences.
 */
@Slf4j
@RestController
@RequestMapping("/api/v1/me/notification-preferences")
@RequiredArgsConstructor
@Tag(name = "Notification Preferences", description = "User notification preferences (US-K-26)")
public class NotificationPreferencesController {

    private final NotificationService notificationService;

    /**
     * Get current user's notification preferences.
     * Lazily creates default preferences on first access.
     */
    @GetMapping
    @PreAuthorize("isAuthenticated()")
    @Operation(
        summary = "Get my notification preferences",
        description = "US-K-26: Returns the current user's notification preferences (creates defaults on first access)."
    )
    public ResponseEntity<NotificationPreferenceDto> getMyPreferences() {
        UUID userId = currentUserId();
        log.info("GET /api/v1/me/notification-preferences - user: {}", userId);
        return ResponseEntity.ok(notificationService.getPreferences(userId));
    }

    /**
     * Update current user's notification preferences.
     */
    @PutMapping
    @PreAuthorize("isAuthenticated()")
    @Operation(
        summary = "Update my notification preferences",
        description = "US-K-26: Upserts the current user's notification channel toggles and quiet hours."
    )
    public ResponseEntity<NotificationPreferenceDto> updateMyPreferences(
        @Valid @RequestBody UpdateNotificationPreferencesRequest request
    ) {
        UUID userId = currentUserId();
        log.info("PUT /api/v1/me/notification-preferences - user: {}", userId);
        return ResponseEntity.ok(notificationService.updatePreferences(userId, request));
    }

    /**
     * Resolve current authenticated user as UUID. Throws if not parseable.
     */
    private UUID currentUserId() {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        if (auth == null || !auth.isAuthenticated()) {
            throw new IllegalStateException("No authenticated user");
        }
        String name = auth.getName();
        return UUID.fromString(name);
    }
}
