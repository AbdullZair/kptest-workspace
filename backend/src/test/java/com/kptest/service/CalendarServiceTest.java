package com.kptest.service;

import com.kptest.api.dto.*;
import com.kptest.application.service.CalendarService;
import com.kptest.domain.schedule.EventStatus;
import com.kptest.domain.schedule.EventType;
import com.kptest.domain.schedule.TherapyEvent;
import com.kptest.domain.schedule.repository.TherapyEventRepository;
import com.kptest.exception.ResourceNotFoundException;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Nested;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.ArgumentCaptor;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.time.Instant;
import java.time.LocalDate;
import java.time.ZoneOffset;
import java.util.*;

import static org.assertj.core.api.Assertions.*;
import static org.mockito.ArgumentMatchers.*;
import static org.mockito.BDDMockito.*;

/**
 * Unit tests for CalendarService.
 */
@ExtendWith(MockitoExtension.class)
@DisplayName("CalendarService Unit Tests")
class CalendarServiceTest {

    @Mock
    private TherapyEventRepository therapyEventRepository;

    private CalendarService calendarService;

    private TherapyEvent testEvent;
    private static final UUID TEST_EVENT_ID = UUID.randomUUID();
    private static final UUID TEST_PATIENT_ID = UUID.randomUUID();

    @BeforeEach
    void setUp() {
        calendarService = new CalendarService(therapyEventRepository);
        testEvent = createTestEvent();
    }

    private TherapyEvent createTestEvent() {
        TherapyEvent event = TherapyEvent.create(
            UUID.randomUUID(),
            TEST_PATIENT_ID,
            "Test Event",
            "Test Description",
            EventType.VISIT,
            Instant.now().plusSeconds(86400),
            Instant.now().plusSeconds(90000),
            "Test Location",
            false,
            null,
            new TherapyEvent.Reminders(true, true, false)
        );
        event.setId(TEST_EVENT_ID);
        return event;
    }

    @Nested
    @DisplayName("Get Events Tests")
    class GetEventsTests {

        @Test
        @DisplayName("shouldGetEvents_WithNoFilters")
        void shouldGetEvents_WithNoFilters() {
            // Given
            given(therapyEventRepository.findAll()).willReturn(List.of(testEvent));

            // When
            List<TherapyEventDto> result = calendarService.getEvents(null, null, null, null, null);

            // Then
            assertThat(result).hasSize(1);
            assertThat(result.get(0).title()).isEqualTo("Test Event");
        }

        @Test
        @DisplayName("shouldGetEvents_WithPatientIdOnly")
        void shouldGetEvents_WithPatientIdOnly() {
            // Given
            given(therapyEventRepository.findByPatientIdOrderByScheduledAtAsc(TEST_PATIENT_ID))
                .willReturn(List.of(testEvent));

            // When
            List<TherapyEventDto> result = calendarService.getEvents(TEST_PATIENT_ID, null, null, null, null);

            // Then
            assertThat(result).hasSize(1);
            then(therapyEventRepository).should().findByPatientIdOrderByScheduledAtAsc(TEST_PATIENT_ID);
        }

        @Test
        @DisplayName("shouldGetEvents_WithDateRangeOnly")
        void shouldGetEvents_WithDateRangeOnly() {
            // Given
            Instant start = Instant.now();
            Instant end = Instant.now().plusSeconds(86400);
            given(therapyEventRepository.findByDateRange(start, end)).willReturn(List.of(testEvent));

            // When
            List<TherapyEventDto> result = calendarService.getEvents(null, null, null, start, end);

            // Then
            assertThat(result).hasSize(1);
            then(therapyEventRepository).should().findByDateRange(start, end);
        }

        @Test
        @DisplayName("shouldGetEvents_WithPatientIdAndDateRange")
        void shouldGetEvents_WithPatientIdAndDateRange() {
            // Given
            Instant start = Instant.now();
            Instant end = Instant.now().plusSeconds(86400);
            given(therapyEventRepository.findByPatientIdAndDateRange(TEST_PATIENT_ID, start, end))
                .willReturn(List.of(testEvent));

            // When
            List<TherapyEventDto> result = calendarService.getEvents(TEST_PATIENT_ID, null, null, start, end);

            // Then
            assertThat(result).hasSize(1);
        }

        @Test
        @DisplayName("shouldGetEvents_WithPatientIdAndTypeAndDateRange")
        void shouldGetEvents_WithPatientIdAndTypeAndDateRange() {
            // Given
            Instant start = Instant.now();
            Instant end = Instant.now().plusSeconds(86400);
            given(therapyEventRepository.findByPatientIdAndTypeAndDateRange(TEST_PATIENT_ID, EventType.VISIT, start, end))
                .willReturn(List.of(testEvent));

            // When
            List<TherapyEventDto> result = calendarService.getEvents(TEST_PATIENT_ID, EventType.VISIT, null, start, end);

            // Then
            assertThat(result).hasSize(1);
        }

        @Test
        @DisplayName("shouldGetEvents_WithPatientIdAndStatusAndDateRange")
        void shouldGetEvents_WithPatientIdAndStatusAndDateRange() {
            // Given
            Instant start = Instant.now();
            Instant end = Instant.now().plusSeconds(86400);
            given(therapyEventRepository.findByPatientIdAndStatusAndDateRange(TEST_PATIENT_ID, EventStatus.SCHEDULED, start, end))
                .willReturn(List.of(testEvent));

            // When
            List<TherapyEventDto> result = calendarService.getEvents(TEST_PATIENT_ID, null, EventStatus.SCHEDULED, start, end);

            // Then
            assertThat(result).hasSize(1);
        }

        @Test
        @DisplayName("shouldReturnEmptyList_WhenNoEventsFound")
        void shouldReturnEmptyList_WhenNoEventsFound() {
            // Given
            given(therapyEventRepository.findAll()).willReturn(Collections.emptyList());

            // When
            List<TherapyEventDto> result = calendarService.getEvents(null, null, null, null, null);

            // Then
            assertThat(result).isEmpty();
        }
    }

    @Nested
    @DisplayName("Get Event By ID Tests")
    class GetEventByIdTests {

        @Test
        @DisplayName("shouldGetEventById_WhenEventExists")
        void shouldGetEventById_WhenEventExists() {
            // Given
            given(therapyEventRepository.findById(TEST_EVENT_ID)).willReturn(Optional.of(testEvent));

            // When
            TherapyEventDto result = calendarService.getEventById(TEST_EVENT_ID);

            // Then
            assertThat(result).isNotNull();
            assertThat(result.id()).isEqualTo(TEST_EVENT_ID);
        }

        @Test
        @DisplayName("shouldThrowIllegalArgumentException_WhenEventNotFound")
        void shouldThrowIllegalArgumentException_WhenEventNotFound() {
            // Given
            given(therapyEventRepository.findById(TEST_EVENT_ID)).willReturn(Optional.empty());

            // When & Then
            assertThatThrownBy(() -> calendarService.getEventById(TEST_EVENT_ID))
                .isInstanceOf(IllegalArgumentException.class)
                .hasMessageContaining("Event not found");
        }
    }

    @Nested
    @DisplayName("Create Event Tests")
    class CreateEventTests {

        @Test
        @DisplayName("shouldCreateEvent_WithValidRequest")
        void shouldCreateEvent_WithValidRequest() {
            // Given
            CreateTherapyEventRequest request = createEventRequest();
            given(therapyEventRepository.save(any(TherapyEvent.class))).willReturn(testEvent);

            // When
            TherapyEventDto result = calendarService.createEvent(request);

            // Then
            assertThat(result).isNotNull();
            then(therapyEventRepository).should().save(any(TherapyEvent.class));
        }

        @Test
        @DisplayName("shouldCreateEvent_WithReminders")
        void shouldCreateEvent_WithReminders() {
            // Given
            CreateTherapyEventRequest request = new CreateTherapyEventRequest(
                UUID.randomUUID(),
                TEST_PATIENT_ID,
                "Event with reminders",
                "Description",
                EventType.VISIT,
                Instant.now().plusSeconds(86400),
                Instant.now().plusSeconds(90000),
                "Location",
                false,
                null,
                new CreateTherapyEventRequest.RemindersRequest(true, true, true)
            );
            given(therapyEventRepository.save(any(TherapyEvent.class))).willReturn(testEvent);

            // When
            TherapyEventDto result = calendarService.createEvent(request);

            // Then
            assertThat(result).isNotNull();
        }

        @Test
        @DisplayName("shouldCreateEvent_WithRecurrenceRule")
        void shouldCreateEvent_WithRecurrenceRule() {
            // Given
            CreateTherapyEventRequest request = new CreateTherapyEventRequest(
                UUID.randomUUID(),
                TEST_PATIENT_ID,
                "Recurring Event",
                "Description",
                EventType.VISIT,
                Instant.now().plusSeconds(86400),
                Instant.now().plusSeconds(90000),
                "Location",
                true,
                "FREQ=WEEKLY;BYDAY=MO",
                null
            );
            given(therapyEventRepository.save(any(TherapyEvent.class))).willReturn(testEvent);

            // When
            TherapyEventDto result = calendarService.createEvent(request);

            // Then
            assertThat(result).isNotNull();
        }
    }

    @Nested
    @DisplayName("Update Event Tests")
    class UpdateEventTests {

        @Test
        @DisplayName("shouldUpdateEvent_WithTitle")
        void shouldUpdateEvent_WithTitle() {
            // Given
            UpdateTherapyEventRequest request = new UpdateTherapyEventRequest(
                "Updated Title", null, null, null, null, null, null, null, null
            );
            given(therapyEventRepository.findById(TEST_EVENT_ID)).willReturn(Optional.of(testEvent));
            given(therapyEventRepository.save(any(TherapyEvent.class))).willReturn(testEvent);

            // When
            TherapyEventDto result = calendarService.updateEvent(TEST_EVENT_ID, request);

            // Then
            assertThat(testEvent.getTitle()).isEqualTo("Updated Title");
        }

        @Test
        @DisplayName("shouldUpdateEvent_WithDescription")
        void shouldUpdateEvent_WithDescription() {
            // Given
            UpdateTherapyEventRequest request = new UpdateTherapyEventRequest(
                null, "Updated Description", null, null, null, null, null, null, null
            );
            given(therapyEventRepository.findById(TEST_EVENT_ID)).willReturn(Optional.of(testEvent));
            given(therapyEventRepository.save(any(TherapyEvent.class))).willReturn(testEvent);

            // When
            TherapyEventDto result = calendarService.updateEvent(TEST_EVENT_ID, request);

            // Then
            assertThat(testEvent.getDescription()).isEqualTo("Updated Description");
        }

        @Test
        @DisplayName("shouldUpdateEvent_WithType")
        void shouldUpdateEvent_WithType() {
            // Given
            UpdateTherapyEventRequest request = new UpdateTherapyEventRequest(
                null, null, EventType.SESSION, null, null, null, null, null, null
            );
            given(therapyEventRepository.findById(TEST_EVENT_ID)).willReturn(Optional.of(testEvent));
            given(therapyEventRepository.save(any(TherapyEvent.class))).willReturn(testEvent);

            // When
            TherapyEventDto result = calendarService.updateEvent(TEST_EVENT_ID, request);

            // Then
            assertThat(testEvent.getType()).isEqualTo(EventType.SESSION);
        }

        @Test
        @DisplayName("shouldUpdateEvent_WithScheduledAt")
        void shouldUpdateEvent_WithScheduledAt() {
            // Given
            Instant newTime = Instant.now().plusSeconds(172800);
            UpdateTherapyEventRequest request = new UpdateTherapyEventRequest(
                null, null, null, newTime, null, null, null, null, null
            );
            given(therapyEventRepository.findById(TEST_EVENT_ID)).willReturn(Optional.of(testEvent));
            given(therapyEventRepository.save(any(TherapyEvent.class))).willReturn(testEvent);

            // When
            TherapyEventDto result = calendarService.updateEvent(TEST_EVENT_ID, request);

            // Then
            assertThat(testEvent.getScheduledAt()).isEqualTo(newTime);
        }

        @Test
        @DisplayName("shouldUpdateEvent_WithEndsAt")
        void shouldUpdateEvent_WithEndsAt() {
            // Given
            Instant newEndsAt = Instant.now().plusSeconds(176400);
            UpdateTherapyEventRequest request = new UpdateTherapyEventRequest(
                null, null, null, null, newEndsAt, null, null, null, null
            );
            given(therapyEventRepository.findById(TEST_EVENT_ID)).willReturn(Optional.of(testEvent));
            given(therapyEventRepository.save(any(TherapyEvent.class))).willReturn(testEvent);

            // When
            TherapyEventDto result = calendarService.updateEvent(TEST_EVENT_ID, request);

            // Then
            assertThat(testEvent.getEndsAt()).isEqualTo(newEndsAt);
        }

        @Test
        @DisplayName("shouldUpdateEvent_WithLocation")
        void shouldUpdateEvent_WithLocation() {
            // Given
            UpdateTherapyEventRequest request = new UpdateTherapyEventRequest(
                null, null, null, null, null, "New Location", null, null, null
            );
            given(therapyEventRepository.findById(TEST_EVENT_ID)).willReturn(Optional.of(testEvent));
            given(therapyEventRepository.save(any(TherapyEvent.class))).willReturn(testEvent);

            // When
            TherapyEventDto result = calendarService.updateEvent(TEST_EVENT_ID, request);

            // Then
            assertThat(testEvent.getLocation()).isEqualTo("New Location");
        }

        @Test
        @DisplayName("shouldUpdateEvent_WithIsCyclic")
        void shouldUpdateEvent_WithIsCyclic() {
            // Given
            UpdateTherapyEventRequest request = new UpdateTherapyEventRequest(
                null, null, null, null, null, null, true, null, null
            );
            given(therapyEventRepository.findById(TEST_EVENT_ID)).willReturn(Optional.of(testEvent));
            given(therapyEventRepository.save(any(TherapyEvent.class))).willReturn(testEvent);

            // When
            TherapyEventDto result = calendarService.updateEvent(TEST_EVENT_ID, request);

            // Then
            assertThat(testEvent.getIsCyclic()).isTrue();
        }

        @Test
        @DisplayName("shouldUpdateEvent_WithRecurrenceRule")
        void shouldUpdateEvent_WithRecurrenceRule() {
            // Given
            UpdateTherapyEventRequest request = new UpdateTherapyEventRequest(
                null, null, null, null, null, null, null, "FREQ=DAILY", null
            );
            given(therapyEventRepository.findById(TEST_EVENT_ID)).willReturn(Optional.of(testEvent));
            given(therapyEventRepository.save(any(TherapyEvent.class))).willReturn(testEvent);

            // When
            TherapyEventDto result = calendarService.updateEvent(TEST_EVENT_ID, request);

            // Then
            assertThat(testEvent.getRecurrenceRule()).isEqualTo("FREQ=DAILY");
        }

        @Test
        @DisplayName("shouldUpdateEvent_WithReminders")
        void shouldUpdateEvent_WithReminders() {
            // Given
            UpdateTherapyEventRequest.RemindersRequest reminders = new UpdateTherapyEventRequest.RemindersRequest(
                false, true, true
            );
            UpdateTherapyEventRequest request = new UpdateTherapyEventRequest(
                null, null, null, null, null, null, null, null, reminders
            );
            given(therapyEventRepository.findById(TEST_EVENT_ID)).willReturn(Optional.of(testEvent));
            given(therapyEventRepository.save(any(TherapyEvent.class))).willReturn(testEvent);

            // When
            TherapyEventDto result = calendarService.updateEvent(TEST_EVENT_ID, request);

            // Then
            assertThat(testEvent.getReminders().getReminder24h()).isFalse();
            assertThat(testEvent.getReminders().getReminder2h()).isTrue();
        }

        @Test
        @DisplayName("shouldThrowIllegalArgumentException_WhenEventNotFound")
        void shouldThrowIllegalArgumentException_WhenEventNotFoundForUpdate() {
            // Given
            UpdateTherapyEventRequest request = createUpdateRequest();
            given(therapyEventRepository.findById(TEST_EVENT_ID)).willReturn(Optional.empty());

            // When & Then
            assertThatThrownBy(() -> calendarService.updateEvent(TEST_EVENT_ID, request))
                .isInstanceOf(IllegalArgumentException.class)
                .hasMessageContaining("Event not found");
        }
    }

    @Nested
    @DisplayName("Delete Event Tests")
    class DeleteEventTests {

        @Test
        @DisplayName("shouldDeleteEvent_WhenEventExists")
        void shouldDeleteEvent_WhenEventExists() {
            // Given
            given(therapyEventRepository.existsById(TEST_EVENT_ID)).willReturn(true);
            willDoNothing().given(therapyEventRepository).deleteById(TEST_EVENT_ID);

            // When
            calendarService.deleteEvent(TEST_EVENT_ID);

            // Then
            then(therapyEventRepository).should().deleteById(TEST_EVENT_ID);
        }

        @Test
        @DisplayName("shouldThrowIllegalArgumentException_WhenEventNotFound")
        void shouldThrowIllegalArgumentException_WhenEventNotFoundForDelete() {
            // Given
            given(therapyEventRepository.existsById(TEST_EVENT_ID)).willReturn(false);

            // When & Then
            assertThatThrownBy(() -> calendarService.deleteEvent(TEST_EVENT_ID))
                .isInstanceOf(IllegalArgumentException.class)
                .hasMessageContaining("Event not found");
        }
    }

    @Nested
    @DisplayName("Complete Event Tests")
    class CompleteEventTests {

        @Test
        @DisplayName("shouldCompleteEvent_WithPatientNotes")
        void shouldCompleteEvent_WithPatientNotes() {
            // Given
            String patientNotes = "Session completed successfully";
            given(therapyEventRepository.findById(TEST_EVENT_ID)).willReturn(Optional.of(testEvent));
            given(therapyEventRepository.save(any(TherapyEvent.class))).willReturn(testEvent);

            // When
            TherapyEventDto result = calendarService.completeEvent(TEST_EVENT_ID, patientNotes);

            // Then
            assertThat(result).isNotNull();
            assertThat(testEvent.getStatus()).isEqualTo(EventStatus.COMPLETED);
            assertThat(testEvent.getPatientNotes()).isEqualTo(patientNotes);
        }

        @Test
        @DisplayName("shouldCompleteEvent_WithoutPatientNotes")
        void shouldCompleteEvent_WithoutPatientNotes() {
            // Given
            given(therapyEventRepository.findById(TEST_EVENT_ID)).willReturn(Optional.of(testEvent));
            given(therapyEventRepository.save(any(TherapyEvent.class))).willReturn(testEvent);

            // When
            TherapyEventDto result = calendarService.completeEvent(TEST_EVENT_ID, null);

            // Then
            assertThat(result).isNotNull();
            assertThat(testEvent.getStatus()).isEqualTo(EventStatus.COMPLETED);
        }

        @Test
        @DisplayName("shouldThrowIllegalArgumentException_WhenEventNotFound")
        void shouldThrowIllegalArgumentException_WhenEventNotFoundForComplete() {
            // Given
            given(therapyEventRepository.findById(TEST_EVENT_ID)).willReturn(Optional.empty());

            // When & Then
            assertThatThrownBy(() -> calendarService.completeEvent(TEST_EVENT_ID, "Notes"))
                .isInstanceOf(IllegalArgumentException.class)
                .hasMessageContaining("Event not found");
        }
    }

    @Nested
    @DisplayName("Get Upcoming Events Tests")
    class GetUpcomingEventsTests {

        @Test
        @DisplayName("shouldGetUpcomingEvents_WhenEventsExist")
        void shouldGetUpcomingEvents_WhenEventsExist() {
            // Given
            TherapyEvent upcomingEvent = TherapyEvent.create(
                UUID.randomUUID(),
                TEST_PATIENT_ID,
                "Upcoming Event",
                "Description",
                EventType.VISIT,
                Instant.now().plusSeconds(3600),
                null,
                null,
                false,
                null,
                null
            );
            given(therapyEventRepository.findUpcomingEvents(eq(TEST_PATIENT_ID), any(Instant.class)))
                .willReturn(List.of(upcomingEvent));

            // When
            List<TherapyEventDto> result = calendarService.getUpcomingEvents(TEST_PATIENT_ID);

            // Then
            assertThat(result).hasSize(1);
        }

        @Test
        @DisplayName("shouldReturnEmptyList_WhenNoUpcomingEvents")
        void shouldReturnEmptyList_WhenNoUpcomingEvents() {
            // Given
            given(therapyEventRepository.findUpcomingEvents(eq(TEST_PATIENT_ID), any(Instant.class)))
                .willReturn(Collections.emptyList());

            // When
            List<TherapyEventDto> result = calendarService.getUpcomingEvents(TEST_PATIENT_ID);

            // Then
            assertThat(result).isEmpty();
        }
    }

    @Nested
    @DisplayName("Export To ICS Tests")
    class ExportToIcsTests {

        @Test
        @DisplayName("shouldExportToIcs_WithValidEvent")
        void shouldExportToIcs_WithValidEvent() {
            // Given
            given(therapyEventRepository.findById(TEST_EVENT_ID)).willReturn(Optional.of(testEvent));

            // When
            String ics = calendarService.exportToIcs(TEST_EVENT_ID);

            // Then
            assertThat(ics).isNotNull();
            assertThat(ics).contains("BEGIN:VCALENDAR");
            assertThat(ics).contains("END:VCALENDAR");
            assertThat(ics).contains("BEGIN:VEVENT");
            assertThat(ics).contains("END:VEVENT");
            assertThat(ics).contains("SUMMARY:Test Event");
        }

        @Test
        @DisplayName("shouldExportToIcs_WithEventDescription")
        void shouldExportToIcs_WithEventDescription() {
            // Given
            testEvent.setDescription("Test Description");
            given(therapyEventRepository.findById(TEST_EVENT_ID)).willReturn(Optional.of(testEvent));

            // When
            String ics = calendarService.exportToIcs(TEST_EVENT_ID);

            // Then
            assertThat(ics).contains("DESCRIPTION:Test Description");
        }

        @Test
        @DisplayName("shouldExportToIcs_WithEventLocation")
        void shouldExportToIcs_WithEventLocation() {
            // Given
            testEvent.setLocation("Test Location");
            given(therapyEventRepository.findById(TEST_EVENT_ID)).willReturn(Optional.of(testEvent));

            // When
            String ics = calendarService.exportToIcs(TEST_EVENT_ID);

            // Then
            assertThat(ics).contains("LOCATION:Test Location");
        }

        @Test
        @DisplayName("shouldExportToIcs_WithCancelledStatus")
        void shouldExportToIcs_WithCancelledStatus() {
            // Given
            testEvent.setStatus(EventStatus.CANCELLED);
            given(therapyEventRepository.findById(TEST_EVENT_ID)).willReturn(Optional.of(testEvent));

            // When
            String ics = calendarService.exportToIcs(TEST_EVENT_ID);

            // Then
            assertThat(ics).contains("STATUS:CANCELLED");
        }

        @Test
        @DisplayName("shouldThrowIllegalArgumentException_WhenEventNotFound")
        void shouldThrowIllegalArgumentException_WhenEventNotFoundForExport() {
            // Given
            given(therapyEventRepository.findById(TEST_EVENT_ID)).willReturn(Optional.empty());

            // When & Then
            assertThatThrownBy(() -> calendarService.exportToIcs(TEST_EVENT_ID))
                .isInstanceOf(IllegalArgumentException.class)
                .hasMessageContaining("Event not found");
        }
    }

    @Nested
    @DisplayName("Send Reminders Tests")
    class SendRemindersTests {

        @Test
        @DisplayName("shouldSendReminders_WhenEventsExist")
        void shouldSendReminders_WhenEventsExist() {
            // Given
            given(therapyEventRepository.findEventsNeeding24hReminders(any(), any())).willReturn(List.of(testEvent));
            given(therapyEventRepository.findEventsNeeding2hReminders(any(), any())).willReturn(Collections.emptyList());
            given(therapyEventRepository.findEventsNeeding30minReminders(any(), any())).willReturn(Collections.emptyList());

            // When
            calendarService.sendReminders();

            // Then
            then(therapyEventRepository).should().findEventsNeeding24hReminders(any(), any());
        }

        @Test
        @DisplayName("shouldSendReminders_WhenNoEventsExist")
        void shouldSendReminders_WhenNoEventsExist() {
            // Given
            given(therapyEventRepository.findEventsNeeding24hReminders(any(), any())).willReturn(Collections.emptyList());
            given(therapyEventRepository.findEventsNeeding2hReminders(any(), any())).willReturn(Collections.emptyList());
            given(therapyEventRepository.findEventsNeeding30minReminders(any(), any())).willReturn(Collections.emptyList());

            // When
            calendarService.sendReminders();

            // Then
            // No exception thrown
        }
    }

    @Nested
    @DisplayName("Mark Missed Events Tests")
    class MarkMissedEventsTests {

        @Test
        @DisplayName("shouldMarkMissedEvents_WhenOverdueEventsExist")
        void shouldMarkMissedEvents_WhenOverdueEventsExist() {
            // Given
            TherapyEvent overdueEvent = createTestEvent();
            overdueEvent.setScheduledAt(Instant.now().minusSeconds(86400));
            given(therapyEventRepository.findByDateRange(any(), any())).willReturn(List.of(overdueEvent));
            given(therapyEventRepository.save(any(TherapyEvent.class))).willReturn(overdueEvent);

            // When
            calendarService.markMissedEvents();

            // Then
            assertThat(overdueEvent.getStatus()).isEqualTo(EventStatus.MISSED);
        }

        @Test
        @DisplayName("shouldNotMarkMissedEvents_WhenNoOverdueEvents")
        void shouldNotMarkMissedEvents_WhenNoOverdueEvents() {
            // Given
            given(therapyEventRepository.findByDateRange(any(), any())).willReturn(Collections.emptyList());

            // When
            calendarService.markMissedEvents();

            // Then
            then(therapyEventRepository).should(never()).save(any());
        }
    }

    @Nested
    @DisplayName("TherapyEvent Entity Tests")
    class TherapyEventEntityTests {

        @Test
        @DisplayName("shouldComplete_WithPatientNotes")
        void shouldComplete_WithPatientNotes() {
            // Given
            TherapyEvent event = createTestEvent();
            String notes = "Test notes";

            // When
            event.complete(notes);

            // Then
            assertThat(event.getStatus()).isEqualTo(EventStatus.COMPLETED);
            assertThat(event.getPatientNotes()).isEqualTo(notes);
            assertThat(event.getCompletedAt()).isNotNull();
        }

        @Test
        @DisplayName("shouldMarkAsMissed")
        void shouldMarkAsMissed() {
            // Given
            TherapyEvent event = createTestEvent();

            // When
            event.markAsMissed();

            // Then
            assertThat(event.getStatus()).isEqualTo(EventStatus.MISSED);
        }

        @Test
        @DisplayName("shouldCancel")
        void shouldCancel() {
            // Given
            TherapyEvent event = createTestEvent();

            // When
            event.cancel();

            // Then
            assertThat(event.getStatus()).isEqualTo(EventStatus.CANCELLED);
        }

        @Test
        @DisplayName("shouldUpdateDetails")
        void shouldUpdateDetails() {
            // Given
            TherapyEvent event = createTestEvent();

            // When
            event.setTitle("New Title");
            event.setDescription("New Description");
            event.setLocation("New Location");

            // Then
            assertThat(event.getTitle()).isEqualTo("New Title");
            assertThat(event.getDescription()).isEqualTo("New Description");
            assertThat(event.getLocation()).isEqualTo("New Location");
        }

        @Test
        @DisplayName("shouldUpdateReminders")
        void shouldUpdateReminders() {
            // Given
            TherapyEvent event = createTestEvent();
            TherapyEvent.Reminders newReminders = new TherapyEvent.Reminders(false, false, true);

            // When
            event.setReminders(newReminders);

            // Then
            assertThat(event.getReminders().getReminder24h()).isFalse();
            assertThat(event.getReminders().getReminder2h()).isFalse();
            assertThat(event.getReminders().getReminder30min()).isTrue();
        }
    }

    private CreateTherapyEventRequest createEventRequest() {
        return new CreateTherapyEventRequest(
            UUID.randomUUID(),
            TEST_PATIENT_ID,
            "Test Event",
            "Test Description",
            EventType.VISIT,
            Instant.now().plusSeconds(86400),
            Instant.now().plusSeconds(90000),
            "Test Location",
            false,
            null,
            new CreateTherapyEventRequest.RemindersRequest(true, true, false)
        );
    }

    private UpdateTherapyEventRequest createUpdateRequest() {
        return new UpdateTherapyEventRequest(
            "Updated Title",
            "Updated Description",
            EventType.VISIT,
            Instant.now().plusSeconds(86400),
            Instant.now().plusSeconds(90000),
            "Updated Location",
            true,
            "FREQ=WEEKLY",
            new UpdateTherapyEventRequest.RemindersRequest(true, true, false)
        );
    }
}
