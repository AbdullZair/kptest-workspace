package com.kptest.api.dto;

import com.kptest.domain.schedule.EventChangeRequest;
import com.kptest.domain.schedule.EventChangeRequestStatus;

import java.time.Instant;
import java.util.UUID;

/**
 * DTO for EventChangeRequest entity.
 */
public record EventChangeRequestDto(
    UUID id,
    UUID eventId,
    UUID patientId,
    Instant proposedDate,
    String reason,
    EventChangeRequestStatus status,
    UUID reviewedBy,
    Instant reviewedAt,
    String rejectionReason,
    String acceptanceComment,
    Integer attemptNumber,
    Instant createdAt,
    Instant updatedAt
) {
    /**
     * Create DTO from entity.
     */
    public static EventChangeRequestDto fromEntity(EventChangeRequest request) {
        return new EventChangeRequestDto(
            request.getId(),
            request.getEventId(),
            request.getPatientId(),
            request.getProposedDate(),
            request.getReason(),
            request.getStatus(),
            request.getReviewedBy(),
            request.getReviewedAt(),
            request.getRejectionReason(),
            request.getAcceptanceComment(),
            request.getAttemptNumber(),
            request.getCreatedAt(),
            request.getUpdatedAt()
        );
    }
}
