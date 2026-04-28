package com.kptest.domain.schedule;

import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.Type;
import org.springframework.data.annotation.CreatedDate;
import org.springframework.data.annotation.LastModifiedDate;
import org.springframework.data.jpa.domain.support.AuditingEntityListener;

import java.time.Instant;
import java.util.ArrayList;
import java.util.Arrays;
import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

/**
 * Therapy event entity representing scheduled activities for patients.
 */
@Entity
@Table(name = "therapy_events")
@EntityListeners(AuditingEntityListener.class)
@Getter
@Setter
@NoArgsConstructor(access = AccessLevel.PROTECTED)
@EqualsAndHashCode(of = "id")
public class TherapyEvent {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @Column(name = "project_id", nullable = false)
    private UUID projectId;

    @Column(name = "patient_id")
    private UUID patientId;

    @Column(nullable = false, length = 200)
    private String title;

    @Column(columnDefinition = "TEXT")
    private String description;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private EventType type;

    @Column(name = "scheduled_at", nullable = false)
    private Instant scheduledAt;

    @Column(name = "ends_at")
    private Instant endsAt;

    @Column(length = 255)
    private String location;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private EventStatus status;

    @Column(name = "is_cyclic", nullable = false)
    private Boolean isCyclic;

    @Column(name = "recurrence_rule", length = 500)
    private String recurrenceRule;

    @Column(name = "completed_at")
    private Instant completedAt;

    @Column(name = "patient_notes", columnDefinition = "TEXT")
    private String patientNotes;

    @Column(name = "reminders", columnDefinition = "text")
    private String remindersJson;
    
    @Transient
    private Reminders reminders;

    @CreatedDate
    @Column(name = "created_at", nullable = false, updatable = false)
    private Instant createdAt;

    @LastModifiedDate
    @Column(name = "updated_at", nullable = false)
    private Instant updatedAt;

    /**
     * Reminders configuration for therapy events.
     */
    @Embeddable
    @Getter
    @Setter
    @NoArgsConstructor(access = AccessLevel.PROTECTED)
    @EqualsAndHashCode
    public static class Reminders {
        @Column(name = "reminder_24h")
        private Boolean reminder24h;

        @Column(name = "reminder_2h")
        private Boolean reminder2h;

        @Column(name = "reminder_30min")
        private Boolean reminder30min;

        public Reminders(Boolean reminder24h, Boolean reminder2h, Boolean reminder30min) {
            this.reminder24h = reminder24h != null ? reminder24h : false;
            this.reminder2h = reminder2h != null ? reminder2h : false;
            this.reminder30min = reminder30min != null ? reminder30min : false;
        }

        public static Reminders defaults() {
            return new Reminders(true, false, false);
        }
    }

    /**
     * Factory method for creating a therapy event.
     */
    public static TherapyEvent create(
            UUID projectId,
            UUID patientId,
            String title,
            String description,
            EventType type,
            Instant scheduledAt,
            Instant endsAt,
            String location,
            Boolean isCyclic,
            String recurrenceRule,
            Reminders reminders
    ) {
        TherapyEvent event = new TherapyEvent();
        event.projectId = projectId;
        event.patientId = patientId;
        event.title = title;
        event.description = description;
        event.type = type;
        event.scheduledAt = scheduledAt;
        event.endsAt = endsAt;
        event.location = location;
        event.status = EventStatus.SCHEDULED;
        event.isCyclic = isCyclic != null ? isCyclic : false;
        event.recurrenceRule = recurrenceRule;
        event.setReminders(reminders != null ? reminders : Reminders.defaults());
        return event;
    }

    /**
     * Get the reminders configuration. Reads from the persisted CSV column
     * ({@code reminders}); the listed flag names are active.
     */
    public Reminders getReminders() {
        if (this.remindersJson == null || this.remindersJson.isEmpty()) {
            return new Reminders(false, false, false);
        }
        List<String> flags = Arrays.asList(this.remindersJson.split(","));
        return new Reminders(
            flags.contains("reminder24h"),
            flags.contains("reminder2h"),
            flags.contains("reminder30min")
        );
    }

    /**
     * Replace reminders config and persist as a CSV of active flag names.
     */
    public void setReminders(Reminders reminders) {
        this.reminders = reminders;
        if (reminders == null) {
            this.remindersJson = "";
            return;
        }
        List<String> flags = new ArrayList<>();
        if (Boolean.TRUE.equals(reminders.getReminder24h())) flags.add("reminder24h");
        if (Boolean.TRUE.equals(reminders.getReminder2h())) flags.add("reminder2h");
        if (Boolean.TRUE.equals(reminders.getReminder30min())) flags.add("reminder30min");
        this.remindersJson = flags.stream().collect(Collectors.joining(","));
    }

    /**
     * Mark event as completed with optional patient notes.
     */
    public void complete(String patientNotes) {
        this.status = EventStatus.COMPLETED;
        this.completedAt = Instant.now();
        this.patientNotes = patientNotes;
    }

    /**
     * Mark event as missed.
     */
    public void markAsMissed() {
        this.status = EventStatus.MISSED;
    }

    /**
     * Cancel the event.
     */
    public void cancel() {
        this.status = EventStatus.CANCELLED;
    }

    /**
     * Check if event is for a specific patient.
     */
    public boolean isForPatient(UUID patientId) {
        return this.patientId != null && this.patientId.equals(patientId);
    }

    /**
     * Check if event is a group event (no specific patient).
     */
    public boolean isGroupEvent() {
        return this.patientId == null;
    }
}
