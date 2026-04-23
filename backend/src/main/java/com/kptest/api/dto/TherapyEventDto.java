package com.kptest.api.dto;

import com.fasterxml.jackson.annotation.JsonProperty;
import com.kptest.domain.schedule.EventStatus;
import com.kptest.domain.schedule.EventType;
import com.kptest.domain.schedule.TherapyEvent;

import java.time.Instant;
import java.util.UUID;

/**
 * DTO for therapy event response.
 */
public record TherapyEventDto(
    @JsonProperty("id")
    UUID id,

    @JsonProperty("project_id")
    UUID projectId,

    @JsonProperty("patient_id")
    UUID patientId,

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

    @JsonProperty("status")
    EventStatus status,

    @JsonProperty("is_cyclic")
    Boolean isCyclic,

    @JsonProperty("recurrence_rule")
    String recurrenceRule,

    @JsonProperty("completed_at")
    Instant completedAt,

    @JsonProperty("patient_notes")
    String patientNotes,

    @JsonProperty("reminders")
    RemindersDto reminders,

    @JsonProperty("created_at")
    Instant createdAt,

    @JsonProperty("updated_at")
    Instant updatedAt
) {

    public static TherapyEventDto fromTherapyEvent(TherapyEvent event) {
        return new TherapyEventDto(
            event.getId(),
            event.getProjectId(),
            event.getPatientId(),
            event.getTitle(),
            event.getDescription(),
            event.getType(),
            event.getScheduledAt(),
            event.getEndsAt(),
            event.getLocation(),
            event.getStatus(),
            event.getIsCyclic(),
            event.getRecurrenceRule(),
            event.getCompletedAt(),
            event.getPatientNotes(),
            event.getReminders() != null ? RemindersDto.fromReminders(event.getReminders()) : null,
            event.getCreatedAt(),
            event.getUpdatedAt()
        );
    }

    /**
     * DTO for reminders configuration.
     */
    public record RemindersDto(
        @JsonProperty("reminder_24h")
        Boolean reminder24h,

        @JsonProperty("reminder_2h")
        Boolean reminder2h,

        @JsonProperty("reminder_30min")
        Boolean reminder30min
    ) {
        public static RemindersDto fromReminders(TherapyEvent.Reminders reminders) {
            return new RemindersDto(
                reminders.getReminder24h(),
                reminders.getReminder2h(),
                reminders.getReminder30min()
            );
        }
    }
}
