package com.kptest.api.dto;

import com.fasterxml.jackson.annotation.JsonProperty;
import com.kptest.domain.schedule.EventType;

import java.time.Instant;
import java.util.UUID;

/**
 * Request DTO for updating a therapy event.
 * All fields are optional - only provided fields will be updated.
 */
public record UpdateTherapyEventRequest(
    @JsonProperty("title")
    String title,

    @JsonProperty("description")
    String description,

    @JsonProperty("type")
    EventType type,

    @JsonProperty("scheduled_at")
    Instant scheduledAt,

    @JsonProperty("ends_at")
    Instant endsAt,

    @JsonProperty("location")
    String location,

    @JsonProperty("is_cyclic")
    Boolean isCyclic,

    @JsonProperty("recurrence_rule")
    String recurrenceRule,

    @JsonProperty("reminders")
    RemindersRequest reminders
) {

    /**
     * Request DTO for reminders configuration.
     */
    public record RemindersRequest(
        @JsonProperty("reminder_24h")
        Boolean reminder24h,

        @JsonProperty("reminder_2h")
        Boolean reminder2h,

        @JsonProperty("reminder_30min")
        Boolean reminder30min
    ) {}
}
