package com.kptest.service;

import com.kptest.api.dto.*;
import com.kptest.application.service.CalendarService;
import com.kptest.application.service.EventChangeRequestService;
import com.kptest.domain.schedule.*;
import com.kptest.domain.schedule.repository.EventChangeRequestRepository;
import com.kptest.exception.BusinessRuleException;
import com.kptest.exception.ResourceNotFoundException;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Nested;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.ArgumentCaptor;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.time.Duration;
import java.time.Instant;
import java.util.*;

import static org.assertj.core.api.Assertions.*;
import static org.mockito.ArgumentMatchers.*;
import static org.mockito.BDDMockito.*;

/**
 * Unit tests for EventChangeRequestService.
 */
@ExtendWith(MockitoExtension.class)
@DisplayName("EventChangeRequestService Unit Tests")
class EventChangeRequestServiceTest {

    @Mock
    private EventChangeRequestRepository changeRequestRepository;

    @Mock
    private CalendarService calendarService;

    private EventChangeRequestService changeRequestService;

    private TherapyEvent testEvent;
    private EventChangeRequest testChangeRequest;

    private static final UUID TEST_EVENT_ID = UUID.randomUUID();
    private static final UUID TEST_PATIENT_ID = UUID.randomUUID();
    private static final UUID TEST_STAFF_ID = UUID.randomUUID();
    private static final UUID TEST_REQUEST_ID = UUID.randomUUID();

    @BeforeEach
    void setUp() {
        changeRequestService = new EventChangeRequestService(changeRequestRepository, calendarService);
        testEvent = createTestEvent();
        testChangeRequest = createTestChangeRequest();
    }

    private TherapyEvent createTestEvent() {
        TherapyEvent event = new TherapyEvent();
        event.setId(TEST_EVENT_ID);
        event.setPatientId(TEST_PATIENT_ID);
        event.setTitle("Test Event");
        event.setType(EventType.THERAPY_SESSION);
        event.setStatus(EventStatus.SCHEDULED);
        event.setScheduledAt(Instant.now().plus(Duration.ofDays(2)));
        event.setIsCyclic(false);
        event.setReminders(TherapyEvent.Reminders.defaults());
        return event;
    }

    private EventChangeRequest createTestChangeRequest() {
        EventChangeRequest request = EventChangeRequest.create(
            TEST_EVENT_ID,
            TEST_PATIENT_ID,
            Instant.now().plus(Duration.ofDays(3)),
            "Need to reschedule",
            1
        );
        request.setId(TEST_REQUEST_ID);
        request.setCreatedAt(Instant.now());
        request.setUpdatedAt(Instant.now());
        return request;
    }

    @Nested
    @DisplayName("Create Change Request Tests")
    class CreateChangeRequestTests {

        @Test
        @DisplayName("shouldCreateChangeRequest_WithValidData")
        void shouldCreateChangeRequest_WithValidData() {
            // Given
            CreateEventChangeRequestRequest request = new CreateEventChangeRequestRequest(
                TEST_EVENT_ID,
                Instant.now().plus(Duration.ofDays(3)),
                "Need to reschedule"
            );
            given(calendarService.findEventById(TEST_EVENT_ID)).willReturn(testEvent);
            given(changeRequestRepository.findByEventIdAndStatus(eq(TEST_EVENT_ID), eq(EventChangeRequestStatus.PENDING)))
                .willReturn(Collections.emptyList());
            given(changeRequestRepository.findByPatientIdAndEventId(TEST_PATIENT_ID, TEST_EVENT_ID))
                .willReturn(Collections.emptyList());
            given(changeRequestRepository.save(any(EventChangeRequest.class))).willReturn(testChangeRequest);

            // When
            EventChangeRequestDto result = changeRequestService.createChangeRequest(request, TEST_PATIENT_ID);

            // Then
            assertThat(result).isNotNull();
            assertThat(result.eventId()).isEqualTo(TEST_EVENT_ID);
            assertThat(result.patientId()).isEqualTo(TEST_PATIENT_ID);
            assertThat(result.status()).isEqualTo(EventChangeRequestStatus.PENDING);
            then(changeRequestRepository).should().save(any(EventChangeRequest.class));
        }

        @Test
        @DisplayName("shouldThrowBusinessRuleException_WhenEventDoesNotBelongToPatient")
        void shouldThrowBusinessRuleException_WhenEventDoesNotBelongToPatient() {
            // Given
            TherapyEvent otherPatientEvent = createTestEvent();
            otherPatientEvent.setPatientId(UUID.randomUUID());
            CreateEventChangeRequestRequest request = new CreateEventChangeRequestRequest(
                TEST_EVENT_ID,
                Instant.now().plus(Duration.ofDays(3)),
                "Need to reschedule"
            );
            given(calendarService.findEventById(TEST_EVENT_ID)).willReturn(otherPatientEvent);

            // When & Then
            assertThatThrownBy(() -> changeRequestService.createChangeRequest(request, TEST_PATIENT_ID))
                .isInstanceOf(BusinessRuleException.class)
                .hasMessageContaining("doesn't belong to you");
        }

        @Test
        @DisplayName("shouldThrowBusinessRuleException_WhenLessThan24HoursNotice")
        void shouldThrowBusinessRuleException_WhenLessThan24HoursNotice() {
            // Given
            TherapyEvent soonEvent = createTestEvent();
            soonEvent.setScheduledAt(Instant.now().plus(Duration.ofHours(12)));
            CreateEventChangeRequestRequest request = new CreateEventChangeRequestRequest(
                TEST_EVENT_ID,
                Instant.now().plus(Duration.ofHours(13)),
                "Need to reschedule"
            );
            given(calendarService.findEventById(TEST_EVENT_ID)).willReturn(soonEvent);

            // When & Then
            assertThatThrownBy(() -> changeRequestService.createChangeRequest(request, TEST_PATIENT_ID))
                .isInstanceOf(BusinessRuleException.class)
                .hasMessageContaining("less than 24 hours");
        }

        @Test
        @DisplayName("shouldThrowBusinessRuleException_WhenMaxAttemptsReached")
        void shouldThrowBusinessRuleException_WhenMaxAttemptsReached() {
            // Given
            CreateEventChangeRequestRequest request = new CreateEventChangeRequestRequest(
                TEST_EVENT_ID,
                Instant.now().plus(Duration.ofDays(3)),
                "Need to reschedule"
            );
            given(calendarService.findEventById(TEST_EVENT_ID)).willReturn(testEvent);
            
            // Simulate 3 previous attempts
            List<EventChangeRequest> previousRequests = new ArrayList<>();
            for (int i = 0; i < 3; i++) {
                EventChangeRequest prev = createTestChangeRequest();
                prev.setId(UUID.randomUUID());
                previousRequests.add(prev);
            }
            given(changeRequestRepository.findByPatientIdAndEventId(TEST_PATIENT_ID, TEST_EVENT_ID))
                .willReturn(previousRequests);

            // When & Then
            assertThatThrownBy(() -> changeRequestService.createChangeRequest(request, TEST_PATIENT_ID))
                .isInstanceOf(BusinessRuleException.class)
                .hasMessageContaining("Maximum number of reschedule attempts");
        }

        @Test
        @DisplayName("shouldThrowBusinessRuleException_WhenPendingRequestExists")
        void shouldThrowBusinessRuleException_WhenPendingRequestExists() {
            // Given
            CreateEventChangeRequestRequest request = new CreateEventChangeRequestRequest(
                TEST_EVENT_ID,
                Instant.now().plus(Duration.ofDays(3)),
                "Need to reschedule"
            );
            EventChangeRequest pendingRequest = createTestChangeRequest();
            given(calendarService.findEventById(TEST_EVENT_ID)).willReturn(testEvent);
            given(changeRequestRepository.findByEventIdAndStatus(TEST_EVENT_ID, EventChangeRequestStatus.PENDING))
                .willReturn(Collections.singletonList(pendingRequest));

            // When & Then
            assertThatThrownBy(() -> changeRequestService.createChangeRequest(request, TEST_PATIENT_ID))
                .isInstanceOf(BusinessRuleException.class)
                .hasMessageContaining("already a pending change request");
        }
    }

    @Nested
    @DisplayName("Accept Change Request Tests")
    class AcceptChangeRequestTests {

        @Test
        @DisplayName("shouldAcceptChangeRequest_WhenPending")
        void shouldAcceptChangeRequest_WhenPending() {
            // Given
            AcceptEventChangeRequestRequest request = new AcceptEventChangeRequestRequest("Approved");
            given(changeRequestRepository.findById(TEST_REQUEST_ID)).willReturn(Optional.of(testChangeRequest));
            given(changeRequestRepository.save(any(EventChangeRequest.class))).willReturn(testChangeRequest);
            given(calendarService.rescheduleEvent(TEST_EVENT_ID, testChangeRequest.getProposedDate()))
                .willReturn(testEvent);

            // When
            EventChangeRequestDto result = changeRequestService.acceptChangeRequest(TEST_REQUEST_ID, request, TEST_STAFF_ID);

            // Then
            assertThat(result).isNotNull();
            assertThat(result.status()).isEqualTo(EventChangeRequestStatus.ACCEPTED);
            assertThat(result.reviewedBy()).isEqualTo(TEST_STAFF_ID);
            then(changeRequestRepository).should().save(testChangeRequest);
            then(calendarService).should().rescheduleEvent(TEST_EVENT_ID, testChangeRequest.getProposedDate());
        }

        @Test
        @DisplayName("shouldThrowBusinessRuleException_WhenNotPending")
        void shouldThrowBusinessRuleException_WhenNotPending() {
            // Given
            EventChangeRequest acceptedRequest = createTestChangeRequest();
            acceptedRequest.accept(TEST_STAFF_ID, "Already accepted");
            AcceptEventChangeRequestRequest request = new AcceptEventChangeRequestRequest("Approved");
            given(changeRequestRepository.findById(TEST_REQUEST_ID)).willReturn(Optional.of(acceptedRequest));

            // When & Then
            assertThatThrownBy(() -> changeRequestService.acceptChangeRequest(TEST_REQUEST_ID, request, TEST_STAFF_ID))
                .isInstanceOf(BusinessRuleException.class)
                .hasMessageContaining("not pending");
        }

        @Test
        @DisplayName("shouldThrowResourceNotFoundException_WhenRequestNotFound")
        void shouldThrowResourceNotFoundException_WhenRequestNotFound() {
            // Given
            AcceptEventChangeRequestRequest request = new AcceptEventChangeRequestRequest("Approved");
            given(changeRequestRepository.findById(TEST_REQUEST_ID)).willReturn(Optional.empty());

            // When & Then
            assertThatThrownBy(() -> changeRequestService.acceptChangeRequest(TEST_REQUEST_ID, request, TEST_STAFF_ID))
                .isInstanceOf(ResourceNotFoundException.class)
                .hasMessageContaining("Change request not found");
        }
    }

    @Nested
    @DisplayName("Reject Change Request Tests")
    class RejectChangeRequestTests {

        @Test
        @DisplayName("shouldRejectChangeRequest_WhenPending")
        void shouldRejectChangeRequest_WhenPending() {
            // Given
            RejectEventChangeRequestRequest request = new RejectEventChangeRequestRequest("Cannot accommodate");
            given(changeRequestRepository.findById(TEST_REQUEST_ID)).willReturn(Optional.of(testChangeRequest));
            given(changeRequestRepository.save(any(EventChangeRequest.class))).willReturn(testChangeRequest);

            // When
            EventChangeRequestDto result = changeRequestService.rejectChangeRequest(TEST_REQUEST_ID, request, TEST_STAFF_ID);

            // Then
            assertThat(result).isNotNull();
            assertThat(result.status()).isEqualTo(EventChangeRequestStatus.REJECTED);
            assertThat(result.reviewedBy()).isEqualTo(TEST_STAFF_ID);
            assertThat(result.rejectionReason()).isEqualTo("Cannot accommodate");
        }

        @Test
        @DisplayName("shouldThrowBusinessRuleException_WhenNotPending")
        void shouldThrowBusinessRuleException_WhenNotPending() {
            // Given
            EventChangeRequest rejectedRequest = createTestChangeRequest();
            rejectedRequest.reject(TEST_STAFF_ID, "Already rejected");
            RejectEventChangeRequestRequest request = new RejectEventChangeRequestRequest("Cannot accommodate");
            given(changeRequestRepository.findById(TEST_REQUEST_ID)).willReturn(Optional.of(rejectedRequest));

            // When & Then
            assertThatThrownBy(() -> changeRequestService.rejectChangeRequest(TEST_REQUEST_ID, request, TEST_STAFF_ID))
                .isInstanceOf(BusinessRuleException.class)
                .hasMessageContaining("not pending");
        }
    }

    @Nested
    @DisplayName("Cancel Change Request Tests")
    class CancelChangeRequestTests {

        @Test
        @DisplayName("shouldCancelChangeRequest_WhenOwnRequest")
        void shouldCancelChangeRequest_WhenOwnRequest() {
            // Given
            given(changeRequestRepository.findById(TEST_REQUEST_ID)).willReturn(Optional.of(testChangeRequest));
            given(changeRequestRepository.save(any(EventChangeRequest.class))).willReturn(testChangeRequest);

            // When
            EventChangeRequestDto result = changeRequestService.cancelChangeRequest(TEST_REQUEST_ID, TEST_PATIENT_ID);

            // Then
            assertThat(result).isNotNull();
            assertThat(result.status()).isEqualTo(EventChangeRequestStatus.CANCELLED);
        }

        @Test
        @DisplayName("shouldThrowBusinessRuleException_WhenNotOwnRequest")
        void shouldThrowBusinessRuleException_WhenNotOwnRequest() {
            // Given
            UUID otherPatientId = UUID.randomUUID();
            given(changeRequestRepository.findById(TEST_REQUEST_ID)).willReturn(Optional.of(testChangeRequest));

            // When & Then
            assertThatThrownBy(() -> changeRequestService.cancelChangeRequest(TEST_REQUEST_ID, otherPatientId))
                .isInstanceOf(BusinessRuleException.class)
                .hasMessageContaining("doesn't belong to you");
        }

        @Test
        @DisplayName("shouldThrowBusinessRuleException_WhenNotPending")
        void shouldThrowBusinessRuleException_WhenNotPending() {
            // Given
            EventChangeRequest acceptedRequest = createTestChangeRequest();
            acceptedRequest.accept(TEST_STAFF_ID, "Accepted");
            given(changeRequestRepository.findById(TEST_REQUEST_ID)).willReturn(Optional.of(acceptedRequest));

            // When & Then
            assertThatThrownBy(() -> changeRequestService.cancelChangeRequest(TEST_REQUEST_ID, TEST_PATIENT_ID))
                .isInstanceOf(BusinessRuleException.class)
                .hasMessageContaining("not pending");
        }
    }

    @Nested
    @DisplayName("Get Change Request Tests")
    class GetChangeRequestTests {

        @Test
        @DisplayName("shouldGetChangeRequest_WhenExists")
        void shouldGetChangeRequest_WhenExists() {
            // Given
            given(changeRequestRepository.findById(TEST_REQUEST_ID)).willReturn(Optional.of(testChangeRequest));

            // When
            EventChangeRequestDto result = changeRequestService.getChangeRequest(TEST_REQUEST_ID);

            // Then
            assertThat(result).isNotNull();
            assertThat(result.id()).isEqualTo(TEST_REQUEST_ID);
        }

        @Test
        @DisplayName("shouldThrowResourceNotFoundException_WhenNotExists")
        void shouldThrowResourceNotFoundException_WhenNotExists() {
            // Given
            given(changeRequestRepository.findById(TEST_REQUEST_ID)).willReturn(Optional.empty());

            // When & Then
            assertThatThrownBy(() -> changeRequestService.getChangeRequest(TEST_REQUEST_ID))
                .isInstanceOf(ResourceNotFoundException.class)
                .hasMessageContaining("Change request not found");
        }
    }

    @Nested
    @DisplayName("Get Change Requests For Event Tests")
    class GetChangeRequestsForEventTests {

        @Test
        @DisplayName("shouldGetChangeRequestsForEvent")
        void shouldGetChangeRequestsForEvent() {
            // Given
            given(changeRequestRepository.findByEventId(TEST_EVENT_ID))
                .willReturn(Collections.singletonList(testChangeRequest));

            // When
            List<EventChangeRequestDto> result = changeRequestService.getChangeRequestsForEvent(TEST_EVENT_ID);

            // Then
            assertThat(result).hasSize(1);
            assertThat(result.get(0).eventId()).isEqualTo(TEST_EVENT_ID);
        }

        @Test
        @DisplayName("shouldReturnEmptyList_WhenNoRequests")
        void shouldReturnEmptyList_WhenNoRequests() {
            // Given
            given(changeRequestRepository.findByEventId(TEST_EVENT_ID))
                .willReturn(Collections.emptyList());

            // When
            List<EventChangeRequestDto> result = changeRequestService.getChangeRequestsForEvent(TEST_EVENT_ID);

            // Then
            assertThat(result).isEmpty();
        }
    }

    @Nested
    @DisplayName("EventChangeRequest Entity Tests")
    class EventChangeRequestEntityTests {

        @Test
        @DisplayName("shouldCreateChangeRequest_WithFactoryMethod")
        void shouldCreateChangeRequest_WithFactoryMethod() {
            // When
            EventChangeRequest request = EventChangeRequest.create(
                TEST_EVENT_ID,
                TEST_PATIENT_ID,
                Instant.now().plus(Duration.ofDays(3)),
                "Test reason",
                1
            );

            // Then
            assertThat(request.getEventId()).isEqualTo(TEST_EVENT_ID);
            assertThat(request.getPatientId()).isEqualTo(TEST_PATIENT_ID);
            assertThat(request.getStatus()).isEqualTo(EventChangeRequestStatus.PENDING);
            assertThat(request.getAttemptNumber()).isEqualTo(1);
        }

        @Test
        @DisplayName("shouldAccept_WhenPending")
        void shouldAccept_WhenPending() {
            // Given
            EventChangeRequest request = createTestChangeRequest();

            // When
            request.accept(TEST_STAFF_ID, "Approved");

            // Then
            assertThat(request.getStatus()).isEqualTo(EventChangeRequestStatus.ACCEPTED);
            assertThat(request.getReviewedBy()).isEqualTo(TEST_STAFF_ID);
            assertThat(request.getReviewedAt()).isNotNull();
            assertThat(request.getAcceptanceComment()).isEqualTo("Approved");
        }

        @Test
        @DisplayName("shouldReject_WhenPending")
        void shouldReject_WhenPending() {
            // Given
            EventChangeRequest request = createTestChangeRequest();

            // When
            request.reject(TEST_STAFF_ID, "Cannot accommodate");

            // Then
            assertThat(request.getStatus()).isEqualTo(EventChangeRequestStatus.REJECTED);
            assertThat(request.getReviewedBy()).isEqualTo(TEST_STAFF_ID);
            assertThat(request.getRejectionReason()).isEqualTo("Cannot accommodate");
        }

        @Test
        @DisplayName("shouldCancel_WhenPending")
        void shouldCancel_WhenPending() {
            // Given
            EventChangeRequest request = createTestChangeRequest();

            // When
            request.cancel();

            // Then
            assertThat(request.getStatus()).isEqualTo(EventChangeRequestStatus.CANCELLED);
        }

        @Test
        @DisplayName("shouldThrowIllegalStateException_WhenAcceptingNonPending")
        void shouldThrowIllegalStateException_WhenAcceptingNonPending() {
            // Given
            EventChangeRequest request = createTestChangeRequest();
            request.accept(TEST_STAFF_ID, "Already accepted");

            // When & Then
            assertThatThrownBy(() -> request.accept(TEST_STAFF_ID, "Again"))
                .isInstanceOf(IllegalStateException.class)
                .hasMessageContaining("not pending");
        }

        @Test
        @DisplayName("shouldIsPending_ReturnTrueForPending")
        void shouldIsPending_ReturnTrueForPending() {
            // Given
            EventChangeRequest request = createTestChangeRequest();

            // When & Then
            assertThat(request.isPending()).isTrue();
        }

        @Test
        @DisplayName("shouldIsPending_ReturnFalseForAccepted")
        void shouldIsPending_ReturnFalseForAccepted() {
            // Given
            EventChangeRequest request = createTestChangeRequest();
            request.accept(TEST_STAFF_ID, "Approved");

            // When & Then
            assertThat(request.isPending()).isFalse();
        }

        @Test
        @DisplayName("shouldIsResolved_ReturnTrueForAccepted")
        void shouldIsResolved_ReturnTrueForAccepted() {
            // Given
            EventChangeRequest request = createTestChangeRequest();
            request.accept(TEST_STAFF_ID, "Approved");

            // When & Then
            assertThat(request.isResolved()).isTrue();
        }

        @Test
        @DisplayName("shouldIsResolved_ReturnTrueForRejected")
        void shouldIsResolved_ReturnTrueForRejected() {
            // Given
            EventChangeRequest request = createTestChangeRequest();
            request.reject(TEST_STAFF_ID, "Denied");

            // When & Then
            assertThat(request.isResolved()).isTrue();
        }

        @Test
        @DisplayName("shouldIsForPatient_ReturnTrue")
        void shouldIsForPatient_ReturnTrue() {
            // Given
            EventChangeRequest request = createTestChangeRequest();

            // When & Then
            assertThat(request.isForPatient(TEST_PATIENT_ID)).isTrue();
        }

        @Test
        @DisplayName("shouldIsForPatient_ReturnFalse")
        void shouldIsForPatient_ReturnFalse() {
            // Given
            EventChangeRequest request = createTestChangeRequest();

            // When & Then
            assertThat(request.isForPatient(UUID.randomUUID())).isFalse();
        }

        @Test
        @DisplayName("shouldIsWithinAttemptLimit_WhenUnderLimit")
        void shouldIsWithinAttemptLimit_WhenUnderLimit() {
            // Given
            EventChangeRequest request = EventChangeRequest.create(
                TEST_EVENT_ID, TEST_PATIENT_ID, Instant.now().plus(Duration.ofDays(1)), "Reason", 2
            );

            // When & Then
            assertThat(request.isWithinAttemptLimit()).isTrue();
        }

        @Test
        @DisplayName("shouldIsWithinAttemptLimit_WhenAtLimit")
        void shouldIsWithinAttemptLimit_WhenAtLimit() {
            // Given
            EventChangeRequest request = EventChangeRequest.create(
                TEST_EVENT_ID, TEST_PATIENT_ID, Instant.now().plus(Duration.ofDays(1)), "Reason", 3
            );

            // When & Then
            assertThat(request.isWithinAttemptLimit()).isTrue();
        }

        @Test
        @DisplayName("shouldIsWithinAttemptLimit_WhenOverLimit")
        void shouldIsWithinAttemptLimit_WhenOverLimit() {
            // Given
            EventChangeRequest request = EventChangeRequest.create(
                TEST_EVENT_ID, TEST_PATIENT_ID, Instant.now().plus(Duration.ofDays(1)), "Reason", 4
            );

            // When & Then
            assertThat(request.isWithinAttemptLimit()).isFalse();
        }
    }

    @Nested
    @DisplayName("EventChangeRequestStatus Enum Tests")
    class EventChangeRequestStatusEnumTests {

        @Test
        @DisplayName("shouldHaveAllStatusValues")
        void shouldHaveAllStatusValues() {
            // When & Then
            assertThat(EventChangeRequestStatus.values())
                .containsExactlyInAnyOrder(
                    EventChangeRequestStatus.PENDING,
                    EventChangeRequestStatus.ACCEPTED,
                    EventChangeRequestStatus.REJECTED,
                    EventChangeRequestStatus.CANCELLED
                );
        }

        @Test
        @DisplayName("shouldValueOf_WithValidValues")
        void shouldValueOf_WithValidValues() {
            // When & Then
            assertThat(EventChangeRequestStatus.valueOf("PENDING")).isEqualTo(EventChangeRequestStatus.PENDING);
            assertThat(EventChangeRequestStatus.valueOf("ACCEPTED")).isEqualTo(EventChangeRequestStatus.ACCEPTED);
            assertThat(EventChangeRequestStatus.valueOf("REJECTED")).isEqualTo(EventChangeRequestStatus.REJECTED);
            assertThat(EventChangeRequestStatus.valueOf("CANCELLED")).isEqualTo(EventChangeRequestStatus.CANCELLED);
        }
    }
}
