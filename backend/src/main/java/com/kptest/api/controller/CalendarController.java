package com.kptest.api.controller;

import com.kptest.api.dto.CompleteEventRequest;
import com.kptest.api.dto.CreateTherapyEventRequest;
import com.kptest.api.dto.TherapyEventDto;
import com.kptest.api.dto.UpdateTherapyEventRequest;
import com.kptest.application.service.CalendarService;
import com.kptest.domain.patient.Patient;
import com.kptest.domain.patient.PatientRepository;
import com.kptest.domain.schedule.EventStatus;
import com.kptest.domain.schedule.EventType;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

import java.time.Instant;
import java.util.List;
import java.util.UUID;

/**
 * REST Controller for calendar and therapy event management.
 */
@Slf4j
@RestController
@RequestMapping("/api/v1/calendar")
@RequiredArgsConstructor
@Tag(name = "Calendar", description = "Therapy event calendar management")
public class CalendarController {

    private final CalendarService calendarService;
    private final PatientRepository patientRepository;

    /**
     * Get all events with optional filters.
     */
    @GetMapping("/events")
    @PreAuthorize("hasAnyRole('PATIENT', 'COORDINATOR', 'DOCTOR', 'THERAPIST', 'ADMIN')")
    @Operation(summary = "Get all events", description = "Returns a list of therapy events with optional filters")
    public ResponseEntity<List<TherapyEventDto>> getEvents(
            @Parameter(description = "Filter by patient ID")
            @RequestParam(required = false) UUID patientId,

            @Parameter(description = "Filter by project ID")
            @RequestParam(required = false) UUID projectId,

            @Parameter(description = "Filter by event type")
            @RequestParam(required = false) EventType type,

            @Parameter(description = "Filter by event status")
            @RequestParam(required = false) EventStatus status,

            @Parameter(description = "Filter by start date (ISO-8601)")
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) Instant startDate,

            @Parameter(description = "Filter by end date (ISO-8601)")
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) Instant endDate
    ) {
        log.debug("GET /api/v1/calendar/events - patientId={}, projectId={}, type={}, status={}",
                patientId, projectId, type, status);

        List<TherapyEventDto> events = calendarService.getEvents(
                patientId, projectId, type, status, startDate, endDate
        );

        return ResponseEntity.ok(events);
    }

    /**
     * Get event by ID.
     */
    @GetMapping("/events/{id}")
    @PreAuthorize("hasAnyRole('PATIENT', 'COORDINATOR', 'DOCTOR', 'THERAPIST', 'ADMIN')")
    @Operation(summary = "Get event by ID", description = "Returns details of a specific therapy event")
    public ResponseEntity<TherapyEventDto> getEventById(
            @Parameter(description = "Event ID", required = true)
            @PathVariable UUID id
    ) {
        log.debug("GET /api/v1/calendar/events/{}", id);

        TherapyEventDto event = calendarService.getEventById(id);

        return ResponseEntity.ok(event);
    }

    /**
     * Create a new therapy event.
     */
    @PostMapping("/events")
    @PreAuthorize("hasAnyRole('COORDINATOR', 'DOCTOR', 'THERAPIST', 'ADMIN')")
    @Operation(summary = "Create event", description = "Creates a new therapy event")
    public ResponseEntity<TherapyEventDto> createEvent(
            @Parameter(description = "Event data", required = true)
            @Valid @RequestBody CreateTherapyEventRequest request
    ) {
        log.info("POST /api/v1/calendar/events - title={}", request.title());

        TherapyEventDto event = calendarService.createEvent(request);

        return ResponseEntity.status(HttpStatus.CREATED).body(event);
    }

    /**
     * Update an existing therapy event.
     */
    @PutMapping("/events/{id}")
    @PreAuthorize("hasAnyRole('COORDINATOR', 'DOCTOR', 'THERAPIST', 'ADMIN')")
    @Operation(summary = "Update event", description = "Updates an existing therapy event")
    public ResponseEntity<TherapyEventDto> updateEvent(
            @Parameter(description = "Event ID", required = true)
            @PathVariable UUID id,

            @Parameter(description = "Updated event data", required = true)
            @Valid @RequestBody UpdateTherapyEventRequest request
    ) {
        log.info("PUT /api/v1/calendar/events/{}", id);

        TherapyEventDto event = calendarService.updateEvent(id, request);

        return ResponseEntity.ok(event);
    }

    /**
     * Delete a therapy event.
     */
    @DeleteMapping("/events/{id}")
    @PreAuthorize("hasAnyRole('COORDINATOR', 'DOCTOR', 'THERAPIST', 'ADMIN')")
    @Operation(summary = "Delete event", description = "Deletes a therapy event")
    public ResponseEntity<Void> deleteEvent(
            @Parameter(description = "Event ID", required = true)
            @PathVariable UUID id
    ) {
        log.info("DELETE /api/v1/calendar/events/{}", id);

        calendarService.deleteEvent(id);

        return ResponseEntity.noContent().build();
    }

    /**
     * Mark event as completed.
     */
    @PostMapping("/events/{id}/complete")
    @PreAuthorize("hasAnyRole('PATIENT', 'COORDINATOR', 'DOCTOR', 'THERAPIST', 'ADMIN')")
    @Operation(summary = "Complete event", description = "Marks a therapy event as completed")
    public ResponseEntity<TherapyEventDto> completeEvent(
            @Parameter(description = "Event ID", required = true)
            @PathVariable UUID id,

            @Parameter(description = "Completion data with optional patient notes")
            @RequestBody(required = false) CompleteEventRequest request
    ) {
        log.info("POST /api/v1/calendar/events/{}/complete", id);

        String patientNotes = request != null ? request.patientNotes() : null;
        TherapyEventDto event = calendarService.completeEvent(id, patientNotes);

        return ResponseEntity.ok(event);
    }

    /**
     * Get upcoming events for the current user.
     */
    @GetMapping("/upcoming")
    @PreAuthorize("hasAnyRole('PATIENT', 'COORDINATOR', 'DOCTOR', 'THERAPIST', 'ADMIN')")
    @Operation(summary = "Get upcoming events", description = "Returns upcoming therapy events for the current user")
    public ResponseEntity<List<TherapyEventDto>> getUpcomingEvents(
            @Parameter(description = "Patient ID (required for staff roles)")
            @RequestParam(required = false) UUID patientId
    ) {
        log.debug("GET /api/v1/calendar/upcoming - patientId={}", patientId);

        UUID effectivePatientId = patientId;
        if (effectivePatientId == null) {
            // Resolve patient ID from authenticated user (PATIENT role accessing own events)
            UUID currentUserId = getCurrentUserId();
            if (currentUserId == null) {
                log.warn("GET /api/v1/calendar/upcoming - no patientId provided and no authenticated user");
                return ResponseEntity.ok(List.of());
            }
            effectivePatientId = patientRepository.findByUserId(currentUserId)
                    .map(Patient::getId)
                    .orElse(null);
            if (effectivePatientId == null) {
                log.debug("GET /api/v1/calendar/upcoming - authenticated user {} is not a patient", currentUserId);
                return ResponseEntity.ok(List.of());
            }
        }

        List<TherapyEventDto> events = calendarService.getUpcomingEvents(effectivePatientId);

        return ResponseEntity.ok(events);
    }

    /**
     * Resolve current user UUID from the security context.
     * Returns null if there is no authentication or principal cannot be parsed as UUID.
     */
    private UUID getCurrentUserId() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        if (authentication == null || !authentication.isAuthenticated()) {
            return null;
        }
        String name = authentication.getName();
        try {
            return UUID.fromString(name);
        } catch (IllegalArgumentException e) {
            log.warn("Failed to parse user ID from security context: {}", name);
            return null;
        }
    }

    /**
     * Export event to iCal format.
     */
    @PostMapping("/events/{id}/ics")
    @PreAuthorize("hasAnyRole('PATIENT', 'COORDINATOR', 'DOCTOR', 'THERAPIST', 'ADMIN')")
    @Operation(summary = "Export event to iCal", description = "Exports a therapy event to iCal format")
    public ResponseEntity<String> exportToIcs(
            @Parameter(description = "Event ID", required = true)
            @PathVariable UUID id
    ) {
        log.debug("POST /api/v1/calendar/events/{}/ics", id);

        String icsContent = calendarService.exportToIcs(id);

        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.parseMediaType("text/calendar"));
        headers.setContentDispositionFormData("attachment", "event-" + id + ".ics");

        return ResponseEntity.ok()
                .headers(headers)
                .body(icsContent);
    }
}
