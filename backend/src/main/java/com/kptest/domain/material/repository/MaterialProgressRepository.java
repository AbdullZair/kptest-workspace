package com.kptest.domain.material.repository;

import com.kptest.domain.material.MaterialProgress;
import com.kptest.domain.material.MaterialProgress.MaterialStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

/**
 * Repository for MaterialProgress entity.
 */
@Repository
public interface MaterialProgressRepository extends JpaRepository<MaterialProgress, UUID> {

    /**
     * Find progress by material ID and patient ID.
     */
    @Query("SELECT p FROM MaterialProgress p WHERE p.materialId = :materialId AND p.patientId = :patientId")
    Optional<MaterialProgress> findByMaterialIdAndPatientId(
        @Param("materialId") UUID materialId,
        @Param("patientId") UUID patientId
    );

    /**
     * Find all progress for a patient.
     */
    @Query("SELECT p FROM MaterialProgress p WHERE p.patientId = :patientId ORDER BY p.updatedAt DESC")
    List<MaterialProgress> findByPatientId(@Param("patientId") UUID patientId);

    /**
     * Find all progress for a material.
     */
    @Query("SELECT p FROM MaterialProgress p WHERE p.materialId = :materialId")
    List<MaterialProgress> findByMaterialId(@Param("materialId") UUID materialId);

    /**
     * Count progress by status for a patient.
     */
    @Query("SELECT COUNT(p) FROM MaterialProgress p WHERE p.patientId = :patientId AND p.status = :status")
    long countByPatientIdAndStatus(
        @Param("patientId") UUID patientId,
        @Param("status") MaterialStatus status
    );

    /**
     * Count completed materials for a patient.
     */
    @Query("SELECT COUNT(p) FROM MaterialProgress p WHERE p.patientId = :patientId AND p.status = 'COMPLETED'")
    long countCompletedByPatientId(@Param("patientId") UUID patientId);

    /**
     * Count in-progress materials for a patient.
     */
    @Query("SELECT COUNT(p) FROM MaterialProgress p WHERE p.patientId = :patientId AND p.status = 'IN_PROGRESS'")
    long countInProgressByPatientId(@Param("patientId") UUID patientId);

    /**
     * Find progress by material ID and status.
     */
    @Query("SELECT p FROM MaterialProgress p WHERE p.materialId = :materialId AND p.status = :status")
    List<MaterialProgress> findByMaterialIdAndStatus(
        @Param("materialId") UUID materialId,
        @Param("status") MaterialStatus status
    );

    /**
     * Check if progress exists for material and patient.
     */
    @Query("SELECT COUNT(p) > 0 FROM MaterialProgress p WHERE p.materialId = :materialId AND p.patientId = :patientId")
    boolean existsByMaterialIdAndPatientId(
        @Param("materialId") UUID materialId,
        @Param("patientId") UUID patientId
    );

    /**
     * Find progress by patient IDs.
     */
    @Query("SELECT p FROM MaterialProgress p WHERE p.patientId IN :patientIds")
    List<MaterialProgress> findByPatientIdIn(@Param("patientIds") List<UUID> patientIds);

    /**
     * Find all progress records.
     */
    List<MaterialProgress> findAll();
}
