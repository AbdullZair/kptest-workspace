package com.kptest.domain.material.repository;

import com.kptest.domain.material.EducationalMaterial;
import com.kptest.domain.material.EducationalMaterial.DifficultyLevel;
import com.kptest.domain.material.EducationalMaterial.MaterialType;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

/**
 * Repository for EducationalMaterial entity.
 */
@Repository
public interface EducationalMaterialRepository extends JpaRepository<EducationalMaterial, UUID> {

    /**
     * Find materials by project ID.
     */
    @Query("SELECT m FROM EducationalMaterial m WHERE m.projectId = :projectId AND m.published = true")
    List<EducationalMaterial> findByProjectIdAndPublished(@Param("projectId") UUID projectId);

    /**
     * Find all materials by project ID (including unpublished).
     */
    @Query("SELECT m FROM EducationalMaterial m WHERE m.projectId = :projectId")
    List<EducationalMaterial> findByProjectId(@Param("projectId") UUID projectId);

    /**
     * Find material by ID.
     */
    @Query("SELECT m FROM EducationalMaterial m WHERE m.id = :id")
    Optional<EducationalMaterial> findById(@Param("id") UUID id);

    /**
     * Find materials with filters.
     */
    @Query("""
        SELECT m FROM EducationalMaterial m
        WHERE m.projectId = :projectId
          AND (:category IS NULL OR m.category = :category)
          AND (:difficulty IS NULL OR m.difficulty = :difficulty)
          AND (:type IS NULL OR m.type = :type)
          AND (:published IS NULL OR m.published = :published)
        ORDER BY m.createdAt DESC
        """)
    List<EducationalMaterial> findAllWithFilters(
        @Param("projectId") UUID projectId,
        @Param("category") String category,
        @Param("difficulty") DifficultyLevel difficulty,
        @Param("type") MaterialType type,
        @Param("published") Boolean published,
        Pageable pageable
    );

    /**
     * Count materials by project ID.
     */
    @Query("SELECT COUNT(m) FROM EducationalMaterial m WHERE m.projectId = :projectId")
    long countByProjectId(@Param("projectId") UUID projectId);

    /**
     * Count published materials by project ID.
     */
    @Query("SELECT COUNT(m) FROM EducationalMaterial m WHERE m.projectId = :projectId AND m.published = true")
    long countPublishedByProjectId(@Param("projectId") UUID projectId);

    /**
     * Find materials assigned to patient.
     */
    @Query("""
        SELECT m FROM EducationalMaterial m
        WHERE m.projectId = :projectId
          AND m.published = true
          AND (m.assignedToPatients IS NULL
               OR m.assignedToPatients IS EMPTY
               OR :patientId MEMBER OF m.assignedToPatients)
        """)
    List<EducationalMaterial> findByProjectIdAndAssignedToPatient(
        @Param("projectId") UUID projectId,
        @Param("patientId") UUID patientId
    );

    /**
     * Find materials assigned to stage.
     */
    @Query("""
        SELECT m FROM EducationalMaterial m
        WHERE m.projectId = :projectId
          AND m.published = true
          AND (m.assignedToStages IS NULL
               OR m.assignedToStages IS EMPTY
               OR :stageId MEMBER OF m.assignedToStages)
        """)
    List<EducationalMaterial> findByProjectIdAndAssignedToStage(
        @Param("projectId") UUID projectId,
        @Param("stageId") UUID stageId
    );

    /**
     * Search materials by title.
     */
    @Query("""
        SELECT m FROM EducationalMaterial m
        WHERE m.projectId = :projectId
          AND LOWER(m.title) LIKE LOWER(CONCAT('%', :query, '%'))
        ORDER BY m.createdAt DESC
        """)
    List<EducationalMaterial> searchByTitle(
        @Param("projectId") UUID projectId,
        @Param("query") String query
    );
}
