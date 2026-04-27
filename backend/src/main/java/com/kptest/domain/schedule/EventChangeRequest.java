package com.kptest.domain.schedule;

import jakarta.persistence.*;
import lombok.*;
import org.springframework.data.annotation.CreatedDate;
import org.springframework.data.annotation.LastModifiedDate;
import org.springframework.data.jpa.domain.support.AuditingEntityListener;

import java.time.Instant;
import java.util.UUID;

/**
 * Event change request entity representing a patient's request to reschedule an event.
 */
@Entity
@Table(name = "event_change_requests")
@EntityListeners(AuditingEntityListener.class)
@Getter
@Setter
@NoArgsConstructor(access = AccessLevel.PROTECTED)
@EqualsAndHashCode(of = "id")
public class EventChangeRequest {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @Column(name = "event_id", nullable = false)
    private UUID eventId;

    @Column(name = "patient_id", nullable = false)
    private UUID patientId;

    @Column(name = "proposed_date", nullable = false)
    private Instant proposedDate;

    @Column(name = "reason", columnDefinition = "TEXT")
    private String reason;

    @Column(name = "status", nullable = false)
    @Enumerated(EnumType.STRING)
    private EventChangeRequestStatus status;

    @Column(name = "reviewed_by")
    private UUID reviewedBy;

    @Column(name = "reviewed_at")
    private Instant reviewedAt;

    @Column(name = "rejection_reason", columnDefinition = "TEXT")
    private String rejectionReason;

    @Column(name = "acceptance_comment", columnDefinition = "TEXT")
    private String acceptanceComment;

    @Column(name = "attempt_number", nullable = false)
    private Integer attemptNumber;

    @CreatedDate
    @Column(name = "created_at", nullable = false, updatable = false)
    private Instant createdAt;

    @LastModifiedDate
    @Column(name = "updated_at", nullable = false)
    private Instant updatedAt;

    /**
     * Factory method for creating an event change request.
     * 
     * @param eventId The ID of the event to reschedule
     * @param patientId The ID of the patient requesting the change
     * @param proposedDate The proposed new date for the event
     * @param reason The reason for the change request
     * @param attemptNumber The attempt number (max 3)
     * @return A new EventChangeRequest instance
     */
    public static EventChangeRequest create(
            UUID eventId,
            UUID patientId,
            Instant proposedDate,
            String reason,
            Integer attemptNumber
    ) {
        EventChangeRequest request = new EventChangeRequest();
        request.eventId = eventId;
        request.patientId = patientId;
        request.proposedDate = proposedDate;
        request.reason = reason;
        request.status = EventChangeRequestStatus.PENDING;
        request.attemptNumber = attemptNumber != null ? attemptNumber : 1;
        return request;
    }

    /**
     * Accept the change request.
     * 
     * @param reviewedBy The ID of the staff member reviewing
     * @param comment Optional comment for the acceptance
     */
    public void accept(UUID reviewedBy, String comment) {
        if (this.status != EventChangeRequestStatus.PENDING) {
            throw new IllegalStateException("Cannot accept a request that is not pending");
        }
        this.status = EventChangeRequestStatus.ACCEPTED;
        this.reviewedBy = reviewedBy;
        this.reviewedAt = Instant.now();
        this.acceptanceComment = comment;
    }

    /**
     * Reject the change request.
     * 
     * @param reviewedBy The ID of the staff member reviewing
     * @param reason The reason for rejection
     */
    public void reject(UUID reviewedBy, String reason) {
        if (this.status != EventChangeRequestStatus.PENDING) {
            throw new IllegalStateException("Cannot reject a request that is not pending");
        }
        this.status = EventChangeRequestStatus.REJECTED;
        this.reviewedBy = reviewedBy;
        this.reviewedAt = Instant.now();
        this.rejectionReason = reason;
    }

    /**
     * Cancel the change request.
     */
    public void cancel() {
        if (this.status != EventChangeRequestStatus.PENDING) {
            throw new IllegalStateException("Cannot cancel a request that is not pending");
        }
        this.status = EventChangeRequestStatus.CANCELLED;
    }

    /**
     * Check if the request is still pending.
     */
    public boolean isPending() {
        return this.status == EventChangeRequestStatus.PENDING;
    }

    /**
     * Check if the request has been resolved (accepted or rejected).
     */
    public boolean isResolved() {
        return this.status == EventChangeRequestStatus.ACCEPTED || 
               this.status == EventChangeRequestStatus.REJECTED;
    }

    /**
     * Check if this request is for a specific patient.
     */
    public boolean isForPatient(UUID patientId) {
        return this.patientId.equals(patientId);
    }

    /**
     * Check if the attempt number is within the limit.
     */
    public boolean isWithinAttemptLimit() {
        return this.attemptNumber <= 3;
    }
}
