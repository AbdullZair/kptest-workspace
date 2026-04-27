package com.kptest.api.dto;

import java.util.Map;

/**
 * Payload for push notifications.
 */
public record PushPayload(
    String title,
    String body,
    Map<String, String> data,
    PushType type
) {

    public enum PushType {
        MESSAGE,
        EVENT,
        MATERIAL,
        EVENT_CHANGE
    }
}
