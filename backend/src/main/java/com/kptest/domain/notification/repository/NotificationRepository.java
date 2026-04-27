package com.kptest.domain.notification.repository;

import com.kptest.domain.notification.Notification;
import com.kptest.domain.notification.NotificationType;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.Instant;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

/**
 * Repository for Notification entity.
 */
@Repository
public interface NotificationRepository extends JpaRepository<Notification, UUID> {

    /**
     * Find notifications by user ID with pagination.
     */
    @Query("SELECT n FROM Notification n WHERE n.userId = :userId ORDER BY n.createdAt DESC")
    List<Notification> findByUserId(@Param("userId") UUID userId, Pageable pageable);

    /**
     * Find unread notifications by user ID.
     */
    @Query("SELECT n FROM Notification n WHERE n.userId = :userId AND n.read = false ORDER BY n.createdAt DESC")
    List<Notification> findUnreadByUserId(@Param("userId") UUID userId, Pageable pageable);

    /**
     * Count unread notifications by user ID.
     */
    @Query("SELECT COUNT(n) FROM Notification n WHERE n.userId = :userId AND n.read = false")
    long countUnreadByUserId(@Param("userId") UUID userId);

    /**
     * Find notifications by user ID and type.
     */
    @Query("SELECT n FROM Notification n WHERE n.userId = :userId AND n.type = :type ORDER BY n.createdAt DESC")
    List<Notification> findByUserIdAndType(@Param("userId") UUID userId, @Param("type") NotificationType type, Pageable pageable);

    /**
     * Find unread notifications by user ID and type.
     */
    @Query("SELECT n FROM Notification n WHERE n.userId = :userId AND n.read = false AND n.type = :type ORDER BY n.createdAt DESC")
    List<Notification> findUnreadByUserIdAndType(@Param("userId") UUID userId, @Param("type") NotificationType type, Pageable pageable);

    /**
     * Find notifications scheduled for sending.
     */
    @Query("SELECT n FROM Notification n WHERE n.scheduledFor IS NOT NULL AND n.scheduledFor <= :now AND n.sentAt IS NULL ORDER BY n.scheduledFor ASC")
    List<Notification> findScheduledForSending(@Param("now") Instant now, Pageable pageable);

    /**
     * Find notifications by user ID created after a date.
     */
    @Query("SELECT n FROM Notification n WHERE n.userId = :userId AND n.createdAt > :since ORDER BY n.createdAt DESC")
    List<Notification> findByUserIdAndCreatedAtAfter(@Param("userId") UUID userId, @Param("since") Instant since, Pageable pageable);

    /**
     * Delete notifications older than a date.
     */
    @Modifying
    @Query("DELETE FROM Notification n WHERE n.createdAt < :before")
    void deleteNotificationsOlderThan(@Param("before") Instant before);

    /**
     * Mark all notifications as read for a user.
     */
    @Modifying
    @Query("UPDATE Notification n SET n.read = true WHERE n.userId = :userId AND n.read = false")
    void markAllAsRead(@Param("userId") UUID userId);

    /**
     * Find notification by ID and user ID.
     */
    @Query("SELECT n FROM Notification n WHERE n.id = :id AND n.userId = :userId")
    Optional<Notification> findByIdAndUserId(@Param("id") UUID id, @Param("userId") UUID userId);

    /**
     * Count notifications by user ID and type.
     */
    @Query("SELECT COUNT(n) FROM Notification n WHERE n.userId = :userId AND n.type = :type")
    long countByUserIdAndType(@Param("userId") UUID userId, @Param("type") NotificationType type);

    /**
     * Count unread notifications by user ID and type.
     */
    @Query("SELECT COUNT(n) FROM Notification n WHERE n.userId = :userId AND n.read = false AND n.type = :type")
    long countUnreadByUserIdAndType(@Param("userId") UUID userId, @Param("type") NotificationType type);

    /**
     * Delete all notifications for a user.
     */
    void deleteByUserId(@Param("userId") UUID userId);
}
