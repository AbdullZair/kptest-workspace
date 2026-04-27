package com.kptest.domain.message.repository;

import com.kptest.domain.message.Message;
import com.kptest.domain.message.MessagePriority;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.Instant;
import java.util.List;
import java.util.Optional;
import java.util.Set;
import java.util.UUID;

/**
 * Repository for Message entity.
 */
@Repository
public interface MessageRepository extends JpaRepository<Message, UUID> {

    /**
     * Find messages by thread ID.
     */
    @Query("SELECT m FROM Message m WHERE m.thread.id = :threadId ORDER BY m.sentAt ASC")
    List<Message> findByThreadId(@Param("threadId") UUID threadId, Pageable pageable);

    /**
     * Find messages by thread ID with pagination.
     */
    @Query("SELECT m FROM Message m WHERE m.thread.id = :threadId ORDER BY m.sentAt DESC")
    List<Message> findByThreadIdDescending(@Param("threadId") UUID threadId, Pageable pageable);

    /**
     * Count messages by thread ID.
     */
    @Query("SELECT COUNT(m) FROM Message m WHERE m.thread.id = :threadId")
    long countByThreadId(@Param("threadId") UUID threadId);

    /**
     * Find unread messages for a user.
     */
    @Query("""
        SELECT m FROM Message m
        WHERE m.thread.id IN (
            SELECT t.id FROM MessageThread t WHERE t.projectId = :projectId
        )
        AND m.senderId != :userId
        AND (m.readBy IS NULL OR :userId NOT IN elements(m.readBy))
        ORDER BY m.sentAt DESC
        """)
    List<Message> findUnreadMessages(
        @Param("userId") UUID userId,
        @Param("projectId") UUID projectId,
        Pageable pageable
    );

    /**
     * Count unread messages for a user.
     */
    @Query("""
        SELECT COUNT(m) FROM Message m
        WHERE m.thread.id IN (
            SELECT t.id FROM MessageThread t WHERE t.projectId = :projectId
        )
        AND m.senderId != :userId
        AND (m.readBy IS NULL OR :userId NOT IN elements(m.readBy))
        """)
    long countUnreadMessages(@Param("userId") UUID userId, @Param("projectId") UUID projectId);

    /**
     * Find messages by priority.
     */
    @Query("SELECT m FROM Message m WHERE m.thread.id = :threadId AND m.priority = :priority ORDER BY m.sentAt DESC")
    List<Message> findByThreadIdAndPriority(@Param("threadId") UUID threadId, @Param("priority") MessagePriority priority, Pageable pageable);

    /**
     * Find messages sent after a specific date.
     */
    @Query("SELECT m FROM Message m WHERE m.thread.id = :threadId AND m.sentAt > :since ORDER BY m.sentAt ASC")
    List<Message> findByThreadIdAndSentAtAfter(@Param("threadId") UUID threadId, @Param("since") Instant since, Pageable pageable);

    /**
     * Search messages by content.
     */
    @Query("""
        SELECT m FROM Message m
        WHERE m.thread.id = :threadId
          AND LOWER(m.content) LIKE LOWER(CONCAT('%', :query, '%'))
        ORDER BY m.sentAt DESC
        """)
    List<Message> searchByThreadIdAndContent(@Param("threadId") UUID threadId, @Param("query") String query, Pageable pageable);

    /**
     * Find message by ID and thread ID.
     */
    @Query("SELECT m FROM Message m WHERE m.id = :id AND m.thread.id = :threadId")
    Optional<Message> findByIdAndThreadId(@Param("id") UUID id, @Param("threadId") UUID threadId);

    /**
     * Find replies to a parent message.
     */
    @Query("SELECT m FROM Message m WHERE m.parentMessage.id = :parentId ORDER BY m.sentAt ASC")
    List<Message> findReplies(@Param("parentId") UUID parentId);

    /**
     * Count messages by patient ID (sent).
     */
    @Query("SELECT COUNT(m) FROM Message m JOIN m.thread t WHERE t.patientId = :patientId")
    int countByPatientId(@Param("patientId") UUID patientId);

    /**
     * Count messages received by patient (as recipient).
     */
    @Query("SELECT COUNT(m) FROM Message m JOIN m.thread t WHERE t.patientId = :patientId AND m.senderId != :patientId")
    int countByRecipientPatientId(@Param("patientId") UUID patientId);

    /**
     * Count unread messages.
     */
    long countByIsReadFalse();

    /**
     * Find messages by sender ID.
     */
    @Query("SELECT m FROM Message m WHERE m.senderId = :senderId ORDER BY m.sentAt DESC")
    List<Message> findBySenderId(@Param("senderId") UUID senderId);
}
