package com.kptest.domain.audit.repository;

import com.kptest.domain.audit.AuditLog;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.Instant;
import java.util.List;
import java.util.UUID;

/**
 * Repository for AuditLog entity.
 */
@Repository
public interface AuditLogRepository extends JpaRepository<AuditLog, UUID> {

    /**
     * Find audit logs by user ID.
     */
    Page<AuditLog> findByUserId(@Param("userId") UUID userId, Pageable pageable);

    /**
     * Find audit logs by entity type.
     */
    Page<AuditLog> findByEntityType(@Param("entityType") String entityType, Pageable pageable);

    /**
     * Find audit logs by action.
     */
    Page<AuditLog> findByAction(@Param("action") AuditLog.AuditAction action, Pageable pageable);

    /**
     * Find audit logs by entity ID.
     */
    Page<AuditLog> findByEntityId(@Param("entityId") UUID entityId, Pageable pageable);

    /**
     * Find audit logs by user ID and date range.
     */
    @Query("SELECT a FROM AuditLog a WHERE a.userId = :userId AND a.createdAt BETWEEN :from AND :to")
    Page<AuditLog> findByUserIdAndDateRange(
        @Param("userId") UUID userId,
        @Param("from") Instant from,
        @Param("to") Instant to,
        Pageable pageable
    );

    /**
     * Find audit logs by date range.
     */
    @Query("SELECT a FROM AuditLog a WHERE a.createdAt BETWEEN :from AND :to")
    Page<AuditLog> findByDateRange(
        @Param("from") Instant from,
        @Param("to") Instant to,
        Pageable pageable
    );

    /**
     * Find audit logs by action and date range.
     */
    @Query("SELECT a FROM AuditLog a WHERE a.action = :action AND a.createdAt BETWEEN :from AND :to")
    Page<AuditLog> findByActionAndDateRange(
        @Param("action") AuditLog.AuditAction action,
        @Param("from") Instant from,
        @Param("to") Instant to,
        Pageable pageable
    );

    /**
     * Count audit logs by user ID.
     */
    long countByUserId(@Param("userId") UUID userId);

    /**
     * Count audit logs by action.
     */
    long countByAction(@Param("action") AuditLog.AuditAction action);

    /**
     * Find audit logs by entity type and entity ID.
     */
    @Query("SELECT a FROM AuditLog a WHERE a.entityType = :entityType AND a.entityId = :entityId ORDER BY a.createdAt DESC")
    List<AuditLog> findByEntityTypeAndEntityId(
        @Param("entityType") String entityType,
        @Param("entityId") UUID entityId
    );
}
