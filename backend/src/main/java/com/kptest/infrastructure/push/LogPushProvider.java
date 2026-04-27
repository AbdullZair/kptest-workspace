package com.kptest.infrastructure.push;

import com.kptest.api.dto.PushPayload;
import lombok.extern.slf4j.Slf4j;
import org.springframework.context.annotation.Profile;
import org.springframework.stereotype.Component;

/**
 * Development implementation of push notification provider.
 * Logs notifications instead of sending them.
 */
@Slf4j
@Component
@Profile("dev")
public class LogPushProvider implements PushNotificationProvider {

    @Override
    public void send(String deviceToken, PushPayload payload) {
        log.info("[DEV] Push notification would be sent to device: {}", deviceToken);
        log.debug("[DEV] Payload: title={}, body={}, type={}, data={}", 
            payload.title(), payload.body(), payload.type(), payload.data());
    }
}
