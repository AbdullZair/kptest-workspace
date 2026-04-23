package com.kptest.domain.message.repository;

import com.kptest.domain.message.MessageThread;
import com.kptest.domain.message.ThreadType;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;
import java.util.Set;
import java.util.UUID;

/**
 * Repository for MessageThread entity.
 */
@Repository
public interface MessageThreadRepository extends JpaRepository<MessageThread, UUID> {

    /**
     * Find threads by project ID.
     */
    @Query("SELECT t FROM MessageThread t WHERE t.projectId = :projectId ORDER BY t.lastMessageAt DESC")
    List<MessageThread> findByProjectId(@Param("projectId") UUID projectId, Pageable pageable);

    /**
     * Find threads by project ID and type.
     */
    @Query("SELECT t FROM MessageThread t WHERE t.projectId = :projectId AND t.type = :type ORDER BY t.lastMessageAt DESC")
    List<MessageThread> findByProjectIdAndType(@Param("projectId") UUID projectId, @Param("type") ThreadType type, Pageable pageable);

    /**
     * Count threads by project ID.
     */
    @Query("SELECT COUNT(t) FROM MessageThread t WHERE t.projectId = :projectId")
    long countByProjectId(@Param("projectId") UUID projectId);

    /**
     * Find thread by ID and project ID.
     */
    @Query("SELECT t FROM MessageThread t WHERE t.id = :id AND t.projectId = :projectId")
    Optional<MessageThread> findByIdAndProjectId(@Param("id") UUID id, @Param("projectId") UUID projectId);

    /**
     * Find threads with filters.
     */
    @Query("""
        SELECT DISTINCT t FROM MessageThread t
        WHERE (:projectId IS NULL OR t.projectId = :projectId)
          AND (:type IS NULL OR t.type = :type)
          AND (:createdBy IS NULL OR t.createdBy = :createdBy)
        ORDER BY t.lastMessageAt DESC
        """)
    List<MessageThread> findAllWithFilters(
        @Param("projectId") UUID projectId,
        @Param("type") ThreadType type,
        @Param("createdBy") UUID createdBy,
        Pageable pageable
    );

    /**
     * Count threads with filters.
     */
    @Query("""
        SELECT COUNT(DISTINCT t) FROM MessageThread t
        WHERE (:projectId IS NULL OR t.projectId = :projectId)
          AND (:type IS NULL OR t.type = :type)
          AND (:createdBy IS NULL OR t.createdBy = :createdBy)
        """)
    long countWithFilters(
        @Param("projectId") UUID projectId,
        @Param("type") ThreadType type,
        @Param("createdBy") UUID createdBy
    );
}
