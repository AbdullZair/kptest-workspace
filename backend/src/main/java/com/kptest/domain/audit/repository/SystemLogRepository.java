package com.kptest.domain.audit.repository;

import com.kptest.domain.audit.SystemLog;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.Instant;
import java.util.UUID;

/**
 * Repository for SystemLog entity.
 */
@Repository
public interface SystemLogRepository extends JpaRepository<SystemLog, UUID> {

    /**
     * Find system logs by log level.
     */
    Page<SystemLog> findByLevel(@Param("level") SystemLog.LogLevel level, Pageable pageable);

    /**
     * Find system logs by date range.
     */
    @Query("SELECT s FROM SystemLog s WHERE s.createdAt BETWEEN :from AND :to")
    Page<SystemLog> findByDateRange(
        @Param("from") Instant from,
        @Param("to") Instant to,
        Pageable pageable
    );

    /**
     * Find system logs by level and date range.
     */
    @Query("SELECT s FROM SystemLog s WHERE s.level = :level AND s.createdAt BETWEEN :from AND :to")
    Page<SystemLog> findByLevelAndDateRange(
        @Param("level") SystemLog.LogLevel level,
        @Param("from") Instant from,
        @Param("to") Instant to,
        Pageable pageable
    );

    /**
     * Find error logs by date range.
     */
    @Query("SELECT s FROM SystemLog s WHERE s.level = 'ERROR' AND s.createdAt BETWEEN :from AND :to")
    Page<SystemLog> findErrorsByDateRange(
        @Param("from") Instant from,
        @Param("to") Instant to,
        Pageable pageable
    );

    /**
     * Count system logs by level.
     */
    long countByLevel(@Param("level") SystemLog.LogLevel level);

    /**
     * Count logs created after a specific date.
     */
    long countByCreatedAtAfter(@Param("date") Instant date);
}
