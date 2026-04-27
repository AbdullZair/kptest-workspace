package com.kptest.api.controller;

import com.kptest.api.dto.*;
import com.kptest.application.service.EventChangeRequestService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

/**
 * Controller for event change requests.
 */
@Slf4j
@RestController
@RequestMapping("/api/v1/event-change-requests")
@RequiredArgsConstructor
public class EventChangeRequestController {

    private final EventChangeRequestService changeRequestService;

    /**
     * Create a new event change request.
     */
    @PostMapping
    public ResponseEntity<EventChangeRequestDto> createChangeRequest(
            @Valid @RequestBody CreateEventChangeRequestRequest request,
            @RequestParam UUID patientId
    ) {
        log.info("Creating event change request - event: {}", request.eventId());

        UUID patientId = UUID.fromString(jwt.getClaim("sub"));
        EventChangeRequestDto result = changeRequestService.createChangeRequest(request, patientId);

        return ResponseEntity.ok(result);
    }

    /**
     * Get a change request by ID.
     */
    @GetMapping("/{requestId}")
    public ResponseEntity<EventChangeRequestDto> getChangeRequest(@PathVariable UUID requestId) {
        log.debug("Getting change request: {}", requestId);

        EventChangeRequestDto result = changeRequestService.getChangeRequest(requestId);

        return ResponseEntity.ok(result);
    }

    /**
     * Get all change requests for an event.
     */
    @GetMapping("/event/{eventId}")
    public ResponseEntity<List<EventChangeRequestDto>> getChangeRequestsForEvent(
            @PathVariable UUID eventId
    ) {
        log.debug("Getting change requests for event: {}", eventId);

        List<EventChangeRequestDto> result = changeRequestService.getChangeRequestsForEvent(eventId);

        return ResponseEntity.ok(result);
    }

    /**
     * Get all change requests for the current patient.
     */
    @GetMapping("/my-requests")
    public ResponseEntity<List<EventChangeRequestDto>> getMyChangeRequests(
            @RequestParam UUID patientId
    ) {
        UUID patientId = UUID.fromString(jwt.getClaim("sub"));
        log.debug("Getting change requests for patient: {}", patientId);

        List<EventChangeRequestDto> result = changeRequestService.getChangeRequestsForPatient(patientId);

        return ResponseEntity.ok(result);
    }

    /**
     * Get pending change requests for a project (staff only).
     */
    @GetMapping("/project/{projectId}/pending")
    public ResponseEntity<List<EventChangeRequestDto>> getPendingChangeRequestsForProject(
            @PathVariable UUID projectId
    ) {
        log.debug("Getting pending change requests for project: {}", projectId);

        List<EventChangeRequestDto> result = changeRequestService.getPendingChangeRequestsForProject(projectId);

        return ResponseEntity.ok(result);
    }

    /**
     * Accept a change request (staff only).
     */
    @PostMapping("/{requestId}/accept")
    public ResponseEntity<EventChangeRequestDto> acceptChangeRequest(
            @PathVariable UUID requestId,
            @Valid @RequestBody AcceptEventChangeRequestRequest request,
            @RequestParam UUID patientId
    ) {
        log.info("Accepting change request: {}", requestId);

        UUID staffId = UUID.fromString(jwt.getClaim("sub"));
        EventChangeRequestDto result = changeRequestService.acceptChangeRequest(requestId, request, staffId);

        return ResponseEntity.ok(result);
    }

    /**
     * Reject a change request (staff only).
     */
    @PostMapping("/{requestId}/reject")
    public ResponseEntity<EventChangeRequestDto> rejectChangeRequest(
            @PathVariable UUID requestId,
            @Valid @RequestBody RejectEventChangeRequestRequest request,
            @RequestParam UUID patientId
    ) {
        log.info("Rejecting change request: {}", requestId);

        UUID staffId = UUID.fromString(jwt.getClaim("sub"));
        EventChangeRequestDto result = changeRequestService.rejectChangeRequest(requestId, request, staffId);

        return ResponseEntity.ok(result);
    }

    /**
     * Cancel a change request (by the patient).
     */
    @PostMapping("/{requestId}/cancel")
    public ResponseEntity<EventChangeRequestDto> cancelChangeRequest(
            @PathVariable UUID requestId,
            @RequestParam UUID patientId
    ) {
        log.info("Cancelling change request: {}", requestId);

        UUID patientId = UUID.fromString(jwt.getClaim("sub"));
        EventChangeRequestDto result = changeRequestService.cancelChangeRequest(requestId, patientId);

        return ResponseEntity.ok(result);
    }
}
