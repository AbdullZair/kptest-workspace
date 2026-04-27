package com.kptest.application.service;

import com.kptest.api.dto.CreateTherapyEventRequest;
import com.kptest.api.dto.PushPayload;
import com.kptest.api.dto.TherapyEventDto;
import com.kptest.api.dto.UpdateTherapyEventRequest;
import com.kptest.domain.schedule.EventStatus;
import com.kptest.domain.schedule.EventType;
import com.kptest.domain.schedule.TherapyEvent;
import com.kptest.domain.schedule.repository.TherapyEventRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Instant;
import java.time.temporal.ChronoUnit;
import java.util.List;
import java.util.Map;
import java.util.UUID;
import java.util.stream.Collectors;

/**
 * Service for managing therapy events and calendar operations.
 */
@Slf4j
@Service
@RequiredArgsConstructor
@Transactional
public class CalendarService {

    private final TherapyEventRepository therapyEventRepository;
    private final NotificationService notificationService;

    /**
     * Get all events with optional filters.
     */
    @Transactional(readOnly = true)
    public List<TherapyEventDto> getEvents(
            UUID patientId,
            EventType type,
            EventStatus status,
            Instant startDate,
            Instant endDate
    ) {
        log.debug("Getting events with filters: patientId={}, type={}, status={}, startDate={}, endDate={}",
                patientId, type, status, startDate, endDate);

        List<TherapyEvent> events;

        if (patientId != null && startDate != null && endDate != null) {
            if (status != null && type != null) {
                events = therapyEventRepository.findByPatientIdAndStatusAndDateRange(patientId, status, startDate, endDate);
            } else if (status != null) {
                events = therapyEventRepository.findByPatientIdAndStatusAndDateRange(patientId, status, startDate, endDate);
            } else if (type != null) {
                events = therapyEventRepository.findByPatientIdAndTypeAndDateRange(patientId, type, startDate, endDate);
            } else {
                events = therapyEventRepository.findByPatientIdAndDateRange(patientId, startDate, endDate);
            }
        } else if (patientId != null) {
            events = therapyEventRepository.findByPatientIdOrderByScheduledAtAsc(patientId);
        } else if (startDate != null && endDate != null) {
            events = therapyEventRepository.findByDateRange(startDate, endDate);
        } else {
            events = therapyEventRepository.findAll();
        }

        return events.stream()
                .map(TherapyEventDto::fromTherapyEvent)
                .collect(Collectors.toList());
    }

    /**
     * Get event by ID.
     */
    @Transactional(readOnly = true)
    public TherapyEventDto getEventById(UUID id) {
        log.debug("Getting event by ID: {}", id);
        TherapyEvent event = therapyEventRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Event not found with ID: " + id));
        return TherapyEventDto.fromTherapyEvent(event);
    }

    /**
     * Create a new therapy event.
     */
    public TherapyEventDto createEvent(CreateTherapyEventRequest request) {
        log.info("Creating therapy event: title={}, type={}, scheduledAt={}",
                request.title(), request.type(), request.scheduledAt());

        TherapyEvent event = request.toTherapyEvent();
        TherapyEvent saved = therapyEventRepository.save(event);

        // Send push notification to patient
        if (saved.getPatientId() != null) {
            notificationService.sendPushNotification(
                saved.getPatientId(),
                new PushPayload(
                    "Nowe wydarzenie",
                    request.title(),
                    Map.of("eventId", saved.getId().toString(), "type", request.type().name()),
                    PushPayload.PushType.EVENT
                )
            );
        }

        log.info("Created therapy event with ID: {}", saved.getId());
        return TherapyEventDto.fromTherapyEvent(saved);
    }

    /**
     * Update an existing therapy event.
     */
    public TherapyEventDto updateEvent(UUID id, UpdateTherapyEventRequest request) {
        log.info("Updating therapy event: ID={}", id);

        TherapyEvent event = therapyEventRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Event not found with ID: " + id));

        // Update fields if provided
        if (request.title() != null) {
            event.setTitle(request.title());
        }
        if (request.description() != null) {
            event.setDescription(request.description());
        }
        if (request.type() != null) {
            event.setType(request.type());
        }
        if (request.scheduledAt() != null) {
            event.setScheduledAt(request.scheduledAt());
        }
        if (request.endsAt() != null) {
            event.setEndsAt(request.endsAt());
        }
        if (request.location() != null) {
            event.setLocation(request.location());
        }
        if (request.isCyclic() != null) {
            event.setIsCyclic(request.isCyclic());
        }
        if (request.recurrenceRule() != null) {
            event.setRecurrenceRule(request.recurrenceRule());
        }
        if (request.reminders() != null) {
            TherapyEvent.Reminders reminders = new TherapyEvent.Reminders(
                    request.reminders().reminder24h(),
                    request.reminders().reminder2h(),
                    request.reminders().reminder30min()
            );
            event.setReminders(reminders);
        }

        TherapyEvent updated = therapyEventRepository.save(event);
        log.info("Updated therapy event: ID={}", updated.getId());
        return TherapyEventDto.fromTherapyEvent(updated);
    }

    /**
     * Delete a therapy event.
     */
    public void deleteEvent(UUID id) {
        log.info("Deleting therapy event: ID={}", id);

        if (!therapyEventRepository.existsById(id)) {
            throw new IllegalArgumentException("Event not found with ID: " + id);
        }

        therapyEventRepository.deleteById(id);
        log.info("Deleted therapy event: ID={}", id);
    }

    /**
     * Mark event as completed with optional patient notes.
     */
    public TherapyEventDto completeEvent(UUID id, String patientNotes) {
        log.info("Completing therapy event: ID={}, patientNotes={}", id, patientNotes);

        TherapyEvent event = therapyEventRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Event not found with ID: " + id));

        event.complete(patientNotes);
        TherapyEvent updated = therapyEventRepository.save(event);

        log.info("Completed therapy event: ID={}", updated.getId());
        return TherapyEventDto.fromTherapyEvent(updated);
    }

    /**
     * Get upcoming events for a user (patient).
     */
    @Transactional(readOnly = true)
    public List<TherapyEventDto> getUpcomingEvents(UUID patientId) {
        log.debug("Getting upcoming events for patient: {}", patientId);

        Instant now = Instant.now();
        List<TherapyEvent> events = therapyEventRepository.findUpcomingEvents(patientId, now);

        return events.stream()
                .map(TherapyEventDto::fromTherapyEvent)
                .collect(Collectors.toList());
    }

    /**
     * Export event to iCal format.
     */
    @Transactional(readOnly = true)
    public String exportToIcs(UUID eventId) {
        log.debug("Exporting event to ICS: ID={}", eventId);

        TherapyEvent event = therapyEventRepository.findById(eventId)
                .orElseThrow(() -> new IllegalArgumentException("Event not found with ID: " + eventId));

        return buildIcsContent(event);
    }

    /**
     * Build iCal content for an event.
     */
    private String buildIcsContent(TherapyEvent event) {
        Instant now = Instant.now();
        String uid = event.getId().toString() + "@kptest-therapy";

        StringBuilder sb = new StringBuilder();
        sb.append("BEGIN:VCALENDAR\r\n");
        sb.append("VERSION:2.0\r\n");
        sb.append("PRODID:-//KPTEST Therapy//EN\r\n");
        sb.append("CALSCALE:GREGORIAN\r\n");
        sb.append("METHOD:PUBLISH\r\n");
        sb.append("BEGIN:VEVENT\r\n");
        sb.append("UID:").append(uid).append("\r\n");
        sb.append("DTSTAMP:").append(formatIcsDate(now)).append("\r\n");
        sb.append("DTSTART:").append(formatIcsDate(event.getScheduledAt())).append("\r\n");

        if (event.getEndsAt() != null) {
            sb.append("DTEND:").append(formatIcsDate(event.getEndsAt())).append("\r\n");
        }

        sb.append("SUMMARY:").append(escapeIcsText(event.getTitle())).append("\r\n");

        if (event.getDescription() != null) {
            sb.append("DESCRIPTION:").append(escapeIcsText(event.getDescription())).append("\r\n");
        }

        if (event.getLocation() != null) {
            sb.append("LOCATION:").append(escapeIcsText(event.getLocation())).append("\r\n");
        }

        sb.append("STATUS:").append(event.getStatus() == EventStatus.CANCELLED ? "CANCELLED" : "CONFIRMED").append("\r\n");
        sb.append("END:VEVENT\r\n");
        sb.append("END:VCALENDAR\r\n");

        return sb.toString();
    }

    /**
     * Format instant for iCal format.
     */
    private String formatIcsDate(Instant instant) {
        return instant.toString().replaceAll("[-:]", "").replaceAll("\\.\\d+", "") + "Z";
    }

    /**
     * Escape special characters for iCal text.
     */
    private String escapeIcsText(String text) {
        if (text == null) {
            return "";
        }
        return text
                .replace("\\", "\\\\")
                .replace(";", "\\;")
                .replace(",", "\\,")
                .replace("\n", "\\n");
    }

    /**
     * Send reminders for upcoming events.
     * Scheduled to run every hour.
     */
    @Scheduled(fixedRate = 3600000) // Every hour
    @Transactional(readOnly = true)
    public void sendReminders() {
        log.debug("Running scheduled reminder task");

        Instant now = Instant.now();

        // 24h reminders (between 25h and 23h before event)
        Instant start24h = now.minus(1, ChronoUnit.HOURS);
        Instant end24h = now.plus(25, ChronoUnit.HOURS);
        List<TherapyEvent> events24h = therapyEventRepository.findEventsNeeding24hReminders(start24h, end24h);
        log.info("Found {} events needing 24h reminders", events24h.size());

        // 2h reminders (between 3h and 1h before event)
        Instant start2h = now.minus(1, ChronoUnit.HOURS);
        Instant end2h = now.plus(3, ChronoUnit.HOURS);
        List<TherapyEvent> events2h = therapyEventRepository.findEventsNeeding2hReminders(start2h, end2h);
        log.info("Found {} events needing 2h reminders", events2h.size());

        // 30min reminders (between 1h and event time)
        Instant start30min = now;
        Instant end30min = now.plus(1, ChronoUnit.HOURS);
        List<TherapyEvent> events30min = therapyEventRepository.findEventsNeeding30minReminders(start30min, end30min);
        log.info("Found {} events needing 30min reminders", events30min.size());

        // TODO: Implement actual notification sending (push notifications, SMS, email)
        // For now, just log the reminders that would be sent

        for (TherapyEvent event : events24h) {
            log.info("Would send 24h reminder for event: {} (patient: {})", event.getId(), event.getPatientId());
        }

        for (TherapyEvent event : events2h) {
            log.info("Would send 2h reminder for event: {} (patient: {})", event.getId(), event.getPatientId());
        }

        for (TherapyEvent event : events30min) {
            log.info("Would send 30min reminder for event: {} (patient: {})", event.getId(), event.getPatientId());
        }
    }

    /**
     * Mark past scheduled events as missed.
     * Scheduled to run daily.
     */
    @Scheduled(fixedRate = 86400000) // Every 24 hours
    @Transactional
    public void markMissedEvents() {
        log.debug("Running scheduled task to mark missed events");

        Instant now = Instant.now();
        Instant yesterday = now.minus(1, ChronoUnit.DAYS);

        List<TherapyEvent> overdueEvents = therapyEventRepository.findByDateRange(Instant.MIN, now);

        int markedCount = 0;
        for (TherapyEvent event : overdueEvents) {
            if (event.getStatus() == EventStatus.SCHEDULED &&
                event.getScheduledAt().isBefore(now) &&
                event.getCompletedAt() == null) {
                event.markAsMissed();
                therapyEventRepository.save(event);
                markedCount++;
            }
        }

        log.info("Marked {} events as missed", markedCount);
    }

    /**
     * Find event by ID (for use by other services).
     * 
     * @param id The event ID
     * @return The therapy event
     * @throws IllegalArgumentException if event not found
     */
    @Transactional(readOnly = true)
    public TherapyEvent findEventById(UUID id) {
        return therapyEventRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Event not found with ID: " + id));
    }

    /**
     * Reschedule an event to a new date.
     * 
     * @param eventId The event ID
     * @param newDate The new scheduled date
     * @return The updated therapy event
     */
    public TherapyEvent rescheduleEvent(UUID eventId, Instant newDate) {
        log.info("Rescheduling event: {} to {}", eventId, newDate);

        TherapyEvent event = findEventById(eventId);
        event.setScheduledAt(newDate);
        TherapyEvent updated = therapyEventRepository.save(event);

        log.info("Rescheduled event: {} to {}", eventId, newDate);
        return updated;
    }
}
