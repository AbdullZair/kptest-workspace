package com.kptest.domain.message.repository;

import com.kptest.domain.message.InboxThreadStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

/**
 * Repository for InboxThreadStatus entity.
 */
@Repository
public interface InboxThreadStatusRepository extends JpaRepository<InboxThreadStatus, UUID> {

    /**
     * Find inbox thread status by thread ID.
     */
    Optional<InboxThreadStatus> findByThreadId(UUID threadId);

    /**
     * Find all inbox thread statuses by assigned user ID.
     */
    @Query("SELECT s FROM InboxThreadStatus s WHERE s.assignedTo = :userId ORDER BY s.updatedAt DESC")
    List<InboxThreadStatus> findByAssignedTo(@Param("userId") UUID userId);

    /**
     * Find all inbox thread statuses by status.
     */
    @Query("SELECT s FROM InboxThreadStatus s WHERE s.status = :status ORDER BY s.updatedAt DESC")
    List<InboxThreadStatus> findByStatus(@Param("status") InboxThreadStatus.Status status);

    /**
     * Count unread threads by assigned user ID.
     */
    @Query("SELECT COUNT(s) FROM InboxThreadStatus s WHERE s.assignedTo = :userId AND s.status = 'NEW'")
    long countUnreadByAssignedTo(@Param("userId") UUID userId);

    /**
     * Find all inbox thread statuses with filters.
     */
    @Query("""
        SELECT s FROM InboxThreadStatus s
        WHERE (:assignedTo IS NULL OR s.assignedTo = :assignedTo)
          AND (:status IS NULL OR s.status = :status)
        ORDER BY s.updatedAt DESC
        """)
    List<InboxThreadStatus> findAllWithFilters(
        @Param("assignedTo") UUID assignedTo,
        @Param("status") InboxThreadStatus.Status status
    );
}
