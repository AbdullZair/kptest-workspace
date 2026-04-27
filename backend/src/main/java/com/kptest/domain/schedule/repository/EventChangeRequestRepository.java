package com.kptest.domain.schedule.repository;

import com.kptest.domain.schedule.EventChangeRequest;
import com.kptest.domain.schedule.EventChangeRequestStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.Instant;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

/**
 * Repository for EventChangeRequest entities.
 */
@Repository
public interface EventChangeRequestRepository extends JpaRepository<EventChangeRequest, UUID> {

    /**
     * Find all change requests for a specific event.
     */
    List<EventChangeRequest> findByEventId(UUID eventId);

    /**
     * Find all pending change requests for a specific event.
     */
    List<EventChangeRequest> findByEventIdAndStatus(UUID eventId, EventChangeRequestStatus status);

    /**
     * Find all change requests for a specific patient.
     */
    List<EventChangeRequest> findByPatientId(UUID patientId);

    /**
     * Find all change requests for a specific patient and event.
     */
    List<EventChangeRequest> findByPatientIdAndEventId(UUID patientId, UUID eventId);

    /**
     * Find the latest change request for a specific patient and event.
     */
    Optional<EventChangeRequest> findFirstByPatientIdAndEventIdOrderByCreatedAtDesc(UUID patientId, UUID eventId);

    /**
     * Count pending requests for a patient and event.
     */
    long countByPatientIdAndEventIdAndStatus(UUID patientId, UUID eventId, EventChangeRequestStatus status);

    /**
     * Find pending requests that are older than a certain date.
     */
    @Query("SELECT r FROM EventChangeRequest r WHERE r.status = :status AND r.createdAt < :beforeDate")
    List<EventChangeRequest> findPendingRequestsOlderThan(
        @Param("status") EventChangeRequestStatus status,
        @Param("beforeDate") Instant beforeDate
    );

    /**
     * Find all requests for a project's events.
     */
    @Query("SELECT r FROM EventChangeRequest r JOIN TherapyEvent e ON r.eventId = e.id WHERE e.projectId = :projectId")
    List<EventChangeRequest> findByProjectId(@Param("projectId") UUID projectId);
}
