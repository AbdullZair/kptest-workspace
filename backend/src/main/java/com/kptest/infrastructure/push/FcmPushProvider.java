package com.kptest.infrastructure.push;

import com.kptest.api.dto.PushPayload;
import lombok.extern.slf4j.Slf4j;
import org.springframework.context.annotation.Profile;
import org.springframework.stereotype.Component;

/**
 * Production implementation of push notification provider.
 * Stub for Firebase Cloud Messaging (FCM) integration.
 * 
 * TODO: Add Firebase Admin SDK dependency and implement actual FCM sending
 */
@Slf4j
@Component
@Profile("prod")
public class FcmPushProvider implements PushNotificationProvider {

    @Override
    public void send(String deviceToken, PushPayload payload) {
        log.info("[FCM] Sending push notification to device: {}", deviceToken);
        log.debug("[FCM] Payload: title={}, body={}, type={}, data={}", 
            payload.title(), payload.body(), payload.type(), payload.data());
        
        // TODO: Implement actual FCM sending when Firebase Admin SDK is added
        // Example implementation:
        // Message message = Message.builder()
        //     .setToken(deviceToken)
        //     .putData("type", payload.type().name())
        //     .putAllData(payload.data() != null ? payload.data() : Map.of())
        //     .setNotification(Notification.builder()
        //         .setTitle(payload.title())
        //         .setBody(payload.body())
        //         .build())
        //     .build();
        // 
        // try {
        //     String response = FirebaseMessaging.getInstance().send(message);
        //     log.debug("Successfully sent FCM message: {}", response);
        // } catch (FirebaseMessagingException e) {
        //     log.error("Failed to send FCM message", e);
        //     throw new PushNotificationException("Failed to send push notification", e);
        // }
    }
}
