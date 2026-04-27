package com.kptest.domain.project.repository;

import com.kptest.domain.project.TherapyStageEntity;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

/**
 * Repository interface for TherapyStageEntity.
 */
@Repository
public interface TherapyStageRepository extends JpaRepository<TherapyStageEntity, UUID> {

    /**
     * Find all stages for a project ordered by order_index.
     */
    List<TherapyStageEntity> findByProjectIdOrderByOrderIndex(UUID projectId);

    /**
     * Find all active stages for a project ordered by order_index.
     */
    List<TherapyStageEntity> findByProjectIdAndActiveOrderByOrderIndex(UUID projectId, Boolean active);

    /**
     * Find stage by project and order index.
     */
    Optional<TherapyStageEntity> findByProjectIdAndOrderIndex(UUID projectId, Integer orderIndex);

    /**
     * Check if stage exists by ID and project ID.
     */
    boolean existsByIdAndProjectId(UUID id, UUID projectId);

    /**
     * Count stages by project.
     */
    long countByProjectId(UUID projectId);

    /**
     * Find the maximum order index for a project.
     */
    @Query("SELECT COALESCE(MAX(t.orderIndex), 0) FROM TherapyStageEntity t WHERE t.project.id = :projectId")
    Integer findMaxOrderIndexByProjectId(@Param("projectId") UUID projectId);

    /**
     * Find all stages by required quiz ID.
     */
    List<TherapyStageEntity> findByRequiredQuizQuizId(UUID quizId);
}
