package com.kptest.api.dto;

import com.fasterxml.jackson.annotation.JsonProperty;
import com.kptest.domain.schedule.EventStatus;
import com.kptest.domain.schedule.EventType;
import com.kptest.domain.schedule.TherapyEvent;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

import java.time.Instant;
import java.util.UUID;

/**
 * Request DTO for creating a therapy event.
 */
public record CreateTherapyEventRequest(
    @JsonProperty("project_id")
    @NotNull(message = "Project ID is required")
    UUID projectId,

    @JsonProperty("patient_id")
    UUID patientId,

    @JsonProperty("title")
    @NotBlank(message = "Title is required")
    String title,

    @JsonProperty("description")
    String description,

    @JsonProperty("type")
    @NotNull(message = "Event type is required")
    EventType type,

    @JsonProperty("scheduled_at")
    @NotNull(message = "Scheduled date is required")
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

    public TherapyEvent toTherapyEvent() {
        TherapyEvent.Reminders remindersObj = null;
        if (reminders != null) {
            remindersObj = new TherapyEvent.Reminders(
                reminders.reminder24h,
                reminders.reminder2h,
                reminders.reminder30min
            );
        }

        return TherapyEvent.create(
            projectId,
            patientId,
            title,
            description,
            type,
            scheduledAt,
            endsAt,
            location,
            isCyclic,
            recurrenceRule,
            remindersObj
        );
    }

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
