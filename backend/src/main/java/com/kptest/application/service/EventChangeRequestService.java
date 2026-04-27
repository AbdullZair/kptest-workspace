package com.kptest.application.service;

import com.kptest.api.dto.*;
import com.kptest.domain.schedule.EventChangeRequest;
import com.kptest.domain.schedule.EventChangeRequestStatus;
import com.kptest.domain.schedule.TherapyEvent;
import com.kptest.domain.schedule.repository.EventChangeRequestRepository;
import com.kptest.exception.BusinessRuleException;
import com.kptest.exception.ResourceNotFoundException;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Duration;
import java.time.Instant;
import java.util.List;
import java.util.Map;
import java.util.UUID;

/**
 * Service for handling event change requests.
 */
@Slf4j
@Service
@RequiredArgsConstructor
@Transactional
public class EventChangeRequestService {

    private final EventChangeRequestRepository changeRequestRepository;
    private final CalendarService calendarService;
    private final NotificationService notificationService;

    private static final int MAX_ATTEMPTS = 3;
    private static final Duration MIN_HOURS_BEFORE_EVENT = Duration.ofHours(24);

    /**
     * Create a new event change request.
     *
     * @param request The change request data
     * @param patientId The ID of the patient making the request
     * @return The created change request DTO
     * @throws BusinessRuleException if validation fails
     */
    public EventChangeRequestDto createChangeRequest(
            CreateEventChangeRequestRequest request,
            UUID patientId
    ) {
        log.info("Creating event change request - event: {}, patient: {}", request.eventId(), patientId);

        // Get the event
        TherapyEvent event = calendarService.findEventById(request.eventId());

        // Validate the event belongs to the patient
        if (!event.isForPatient(patientId)) {
            throw new BusinessRuleException("Cannot request change for an event that doesn't belong to you");
        }

        // Validate minimum 24 hours before event
        validateMinimumNotice(event.getScheduledAt());

        // Check attempt limit
        int attemptNumber = getAttemptCount(patientId, request.eventId()) + 1;
        if (attemptNumber > MAX_ATTEMPTS) {
            throw new BusinessRuleException(
                "Maximum number of reschedule attempts (" + MAX_ATTEMPTS + ") reached for this event"
            );
        }

        // Check for existing pending requests
        List<EventChangeRequest> pendingRequests = changeRequestRepository
            .findByEventIdAndStatus(request.eventId(), EventChangeRequestStatus.PENDING);
        if (!pendingRequests.isEmpty()) {
            throw new BusinessRuleException("There is already a pending change request for this event");
        }

        // Create the request
        EventChangeRequest changeRequest = EventChangeRequest.create(
            request.eventId(),
            patientId,
            request.proposedDate(),
            request.reason(),
            attemptNumber
        );

        EventChangeRequest savedRequest = changeRequestRepository.save(changeRequest);
        log.info("Created event change request with ID: {}", savedRequest.getId());

        return EventChangeRequestDto.fromEntity(savedRequest);
    }

    /**
     * Accept a change request.
     *
     * @param requestId The ID of the change request
     * @param request The acceptance data
     * @param staffId The ID of the staff member accepting
     * @return The updated change request DTO
     */
    public EventChangeRequestDto acceptChangeRequest(
            UUID requestId,
            AcceptEventChangeRequestRequest request,
            UUID staffId
    ) {
        log.info("Accepting event change request - id: {}, staff: {}", requestId, staffId);

        EventChangeRequest changeRequest = changeRequestRepository.findById(requestId)
            .orElseThrow(() -> new ResourceNotFoundException("Change request not found with id: " + requestId));

        if (!changeRequest.isPending()) {
            throw new BusinessRuleException("Cannot accept a request that is not pending");
        }

        changeRequest.accept(staffId, request.comment());
        EventChangeRequest savedRequest = changeRequestRepository.save(changeRequest);

        // Update the event date (this would typically trigger a notification)
        calendarService.rescheduleEvent(changeRequest.getEventId(), changeRequest.getProposedDate());

        // Send push notification to patient about accepted change
        notificationService.sendPushNotification(
            changeRequest.getPatientId(),
            new PushPayload(
                "Zmiana wydarzenia zaakceptowana",
                "Twoja prośba o zmianę terminu wydarzenia została zaakceptowana",
                Map.of("changeRequestId", savedRequest.getId().toString(), "eventId", changeRequest.getEventId().toString()),
                PushPayload.PushType.EVENT_CHANGE
            )
        );

        log.info("Accepted event change request: {}", requestId);

        return EventChangeRequestDto.fromEntity(savedRequest);
    }

    /**
     * Reject a change request.
     *
     * @param requestId The ID of the change request
     * @param request The rejection data
     * @param staffId The ID of the staff member rejecting
     * @return The updated change request DTO
     */
    public EventChangeRequestDto rejectChangeRequest(
            UUID requestId,
            RejectEventChangeRequestRequest request,
            UUID staffId
    ) {
        log.info("Rejecting event change request - id: {}, staff: {}", requestId, staffId);

        EventChangeRequest changeRequest = changeRequestRepository.findById(requestId)
            .orElseThrow(() -> new ResourceNotFoundException("Change request not found with id: " + requestId));

        if (!changeRequest.isPending()) {
            throw new BusinessRuleException("Cannot reject a request that is not pending");
        }

        changeRequest.reject(staffId, request.reason());
        EventChangeRequest savedRequest = changeRequestRepository.save(changeRequest);

        // Send push notification to patient about rejected change
        notificationService.sendPushNotification(
            changeRequest.getPatientId(),
            new PushPayload(
                "Zmiana wydarzenia odrzucona",
                "Twoja prośba o zmianę terminu wydarzenia została odrzucona",
                Map.of("changeRequestId", savedRequest.getId().toString(), "eventId", changeRequest.getEventId().toString()),
                PushPayload.PushType.EVENT_CHANGE
            )
        );

        log.info("Rejected event change request: {}", requestId);

        return EventChangeRequestDto.fromEntity(savedRequest);
    }

    /**
     * Cancel a change request (by the patient).
     *
     * @param requestId The ID of the change request
     * @param patientId The ID of the patient cancelling
     * @return The updated change request DTO
     */
    public EventChangeRequestDto cancelChangeRequest(UUID requestId, UUID patientId) {
        log.info("Cancelling event change request - id: {}, patient: {}", requestId, patientId);

        EventChangeRequest changeRequest = changeRequestRepository.findById(requestId)
            .orElseThrow(() -> new ResourceNotFoundException("Change request not found with id: " + requestId));

        if (!changeRequest.isForPatient(patientId)) {
            throw new BusinessRuleException("Cannot cancel a request that doesn't belong to you");
        }

        if (!changeRequest.isPending()) {
            throw new BusinessRuleException("Cannot cancel a request that is not pending");
        }

        changeRequest.cancel();
        EventChangeRequest savedRequest = changeRequestRepository.save(changeRequest);

        log.info("Cancelled event change request: {}", requestId);

        return EventChangeRequestDto.fromEntity(savedRequest);
    }

    /**
     * Get a change request by ID.
     *
     * @param requestId The ID of the change request
     * @return The change request DTO
     */
    @Transactional(readOnly = true)
    public EventChangeRequestDto getChangeRequest(UUID requestId) {
        log.debug("Finding change request by ID: {}", requestId);

        EventChangeRequest request = changeRequestRepository.findById(requestId)
            .orElseThrow(() -> new ResourceNotFoundException("Change request not found with id: " + requestId));

        return EventChangeRequestDto.fromEntity(request);
    }

    /**
     * Get all change requests for an event.
     *
     * @param eventId The ID of the event
     * @return List of change request DTOs
     */
    @Transactional(readOnly = true)
    public List<EventChangeRequestDto> getChangeRequestsForEvent(UUID eventId) {
        log.debug("Finding change requests for event: {}", eventId);

        List<EventChangeRequest> requests = changeRequestRepository.findByEventId(eventId);

        return requests.stream()
            .map(EventChangeRequestDto::fromEntity)
            .toList();
    }

    /**
     * Get all change requests for a patient.
     *
     * @param patientId The ID of the patient
     * @return List of change request DTOs
     */
    @Transactional(readOnly = true)
    public List<EventChangeRequestDto> getChangeRequestsForPatient(UUID patientId) {
        log.debug("Finding change requests for patient: {}", patientId);

        List<EventChangeRequest> requests = changeRequestRepository.findByPatientId(patientId);

        return requests.stream()
            .map(EventChangeRequestDto::fromEntity)
            .toList();
    }

    /**
     * Get pending change requests for a project.
     *
     * @param projectId The ID of the project
     * @return List of pending change request DTOs
     */
    @Transactional(readOnly = true)
    public List<EventChangeRequestDto> getPendingChangeRequestsForProject(UUID projectId) {
        log.debug("Finding pending change requests for project: {}", projectId);

        List<EventChangeRequest> requests = changeRequestRepository.findByProjectId(projectId);

        return requests.stream()
            .filter(r -> r.getStatus() == EventChangeRequestStatus.PENDING)
            .map(EventChangeRequestDto::fromEntity)
            .toList();
    }

    /**
     * Validate that the proposed date is at least 24 hours before the event.
     */
    private void validateMinimumNotice(Instant eventDate) {
        Instant now = Instant.now();
        Duration timeUntilEvent = Duration.between(now, eventDate);

        if (timeUntilEvent.compareTo(MIN_HOURS_BEFORE_EVENT) < 0) {
            throw new BusinessRuleException(
                "Cannot request change less than 24 hours before the event"
            );
        }
    }

    /**
     * Get the number of previous change requests for a patient and event.
     */
    private int getAttemptCount(UUID patientId, UUID eventId) {
        return (int) changeRequestRepository.findByPatientIdAndEventId(patientId, eventId).size();
    }
}
