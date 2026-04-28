package com.kptest.domain.schedule.repository;

import com.kptest.domain.schedule.EventStatus;
import com.kptest.domain.schedule.EventType;
import com.kptest.domain.schedule.TherapyEvent;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.time.Instant;
import java.util.List;
import java.util.UUID;

/**
 * Repository for TherapyEvent entities.
 */
@Repository
public interface TherapyEventRepository extends JpaRepository<TherapyEvent, UUID> {

    /**
     * Find all events for a specific patient.
     */
    List<TherapyEvent> findByPatientIdOrderByScheduledAtAsc(UUID patientId);

    /**
     * Find all events for a specific project.
     */
    List<TherapyEvent> findByProjectIdOrderByScheduledAtAsc(UUID projectId);

    /**
     * Find events by patient ID and status.
     */
    List<TherapyEvent> findByPatientIdAndStatusOrderByScheduledAtAsc(UUID patientId, EventStatus status);

    /**
     * Find events by patient ID and type.
     */
    List<TherapyEvent> findByPatientIdAndTypeOrderByScheduledAtAsc(UUID patientId, EventType type);

    /**
     * Find events by patient ID within a date range.
     */
    @Query("SELECT e FROM TherapyEvent e WHERE e.patientId = :patientId " +
           "AND e.scheduledAt >= :startDate AND e.scheduledAt <= :endDate " +
           "ORDER BY e.scheduledAt ASC")
    List<TherapyEvent> findByPatientIdAndDateRange(
        @Param("patientId") UUID patientId,
        @Param("startDate") Instant startDate,
        @Param("endDate") Instant endDate
    );

    /**
     * Find events by patient ID, status, and date range.
     */
    @Query("SELECT e FROM TherapyEvent e WHERE e.patientId = :patientId " +
           "AND e.status = :status " +
           "AND e.scheduledAt >= :startDate AND e.scheduledAt <= :endDate " +
           "ORDER BY e.scheduledAt ASC")
    List<TherapyEvent> findByPatientIdAndStatusAndDateRange(
        @Param("patientId") UUID patientId,
        @Param("status") EventStatus status,
        @Param("startDate") Instant startDate,
        @Param("endDate") Instant endDate
    );

    /**
     * Find events by patient ID, type, and date range.
     */
    @Query("SELECT e FROM TherapyEvent e WHERE e.patientId = :patientId " +
           "AND e.type = :type " +
           "AND e.scheduledAt >= :startDate AND e.scheduledAt <= :endDate " +
           "ORDER BY e.scheduledAt ASC")
    List<TherapyEvent> findByPatientIdAndTypeAndDateRange(
        @Param("patientId") UUID patientId,
        @Param("type") EventType type,
        @Param("startDate") Instant startDate,
        @Param("endDate") Instant endDate
    );

    /**
     * Find all events within a date range (for all patients).
     */
    @Query("SELECT e FROM TherapyEvent e WHERE e.scheduledAt >= :startDate AND e.scheduledAt <= :endDate " +
           "ORDER BY e.scheduledAt ASC")
    List<TherapyEvent> findByDateRange(
        @Param("startDate") Instant startDate,
        @Param("endDate") Instant endDate
    );

    /**
     * Find upcoming events for a patient.
     */
    @Query("SELECT e FROM TherapyEvent e WHERE e.patientId = :patientId " +
           "AND e.status = 'SCHEDULED' " +
           "AND e.scheduledAt >= :now " +
           "ORDER BY e.scheduledAt ASC")
    List<TherapyEvent> findUpcomingEvents(
        @Param("patientId") UUID patientId,
        @Param("now") Instant now
    );

    /**
     * Find upcoming events for all patients (for reminder processing).
     */
    @Query("SELECT e FROM TherapyEvent e WHERE e.status = 'SCHEDULED' " +
           "AND e.scheduledAt > :now " +
           "ORDER BY e.scheduledAt ASC")
    List<TherapyEvent> findAllUpcomingEvents(@Param("now") Instant now);

    /**
     * Find events that need 24h reminders.
     */
    @Query("SELECT e FROM TherapyEvent e WHERE e.status = 'SCHEDULED' " +
           "AND e.remindersJson LIKE '%reminder24h%' " +
           "AND e.scheduledAt BETWEEN :start AND :end " +
           "ORDER BY e.scheduledAt ASC")
    List<TherapyEvent> findEventsNeeding24hReminders(
        @Param("start") Instant start,
        @Param("end") Instant end
    );

    /**
     * Find events that need 2h reminders.
     */
    @Query("SELECT e FROM TherapyEvent e WHERE e.status = 'SCHEDULED' " +
           "AND e.remindersJson LIKE '%reminder2h%' " +
           "AND e.scheduledAt BETWEEN :start AND :end " +
           "ORDER BY e.scheduledAt ASC")
    List<TherapyEvent> findEventsNeeding2hReminders(
        @Param("start") Instant start,
        @Param("end") Instant end
    );

    /**
     * Find events that need 30min reminders.
     */
    @Query("SELECT e FROM TherapyEvent e WHERE e.status = 'SCHEDULED' " +
           "AND e.remindersJson LIKE '%reminder30min%' " +
           "AND e.scheduledAt BETWEEN :start AND :end " +
           "ORDER BY e.scheduledAt ASC")
    List<TherapyEvent> findEventsNeeding30minReminders(
        @Param("start") Instant start,
        @Param("end") Instant end
    );

    /**
     * Find cyclic events for a project.
     */
    List<TherapyEvent> findByProjectIdAndIsCyclicTrue(UUID projectId);

    /**
     * Count events by patient and status.
     */
    long countByPatientIdAndStatus(UUID patientId, EventStatus status);

    /**
     * Find events by project ID and date range.
     */
    @Query("SELECT e FROM TherapyEvent e WHERE e.projectId = :projectId " +
           "AND e.scheduledAt >= :dateFrom AND e.scheduledAt <= :dateTo " +
           "ORDER BY e.scheduledAt ASC")
    List<TherapyEvent> findByProjectIdAndDateRange(
        @Param("projectId") UUID projectId,
        @Param("dateFrom") Instant dateFrom,
        @Param("dateTo") Instant dateTo
    );

    /**
     * Find top 10 events by project ID ordered by scheduled date descending.
     */
    @Query("SELECT e FROM TherapyEvent e WHERE e.projectId = :projectId " +
           "ORDER BY e.scheduledAt DESC")
    List<TherapyEvent> findTop10ByProjectIdOrderByScheduledDateDesc(@Param("projectId") UUID projectId);

    /**
     * Count events scheduled before a date.
     */
    @Query("SELECT COUNT(e) FROM TherapyEvent e WHERE e.scheduledAt < :date")
    long countByScheduledDateBefore(@Param("date") Instant date);

    /**
     * Find overdue events.
     */
    @Query("SELECT e FROM TherapyEvent e WHERE e.status != 'COMPLETED' " +
           "AND e.scheduledAt < CURRENT_TIMESTAMP")
    List<TherapyEvent> findOverdueEvents();

    /**
     * Find events by patient ID.
     */
    List<TherapyEvent> findByPatientId(UUID patientId);

    /**
     * Find all events.
     */
    List<TherapyEvent> findAll();
}
