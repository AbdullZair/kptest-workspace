package com.kptest.infrastructure.push;

import com.kptest.api.dto.PushPayload;

/**
 * Provider interface for sending push notifications.
 */
public interface PushNotificationProvider {

    /**
     * Send a push notification to a device.
     *
     * @param deviceToken The device token
     * @param payload The notification payload
     */
    void send(String deviceToken, PushPayload payload);
}
