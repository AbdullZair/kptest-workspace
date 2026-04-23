package com.kptest.domain.project;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

/**
 * Repository for PatientProject entity.
 */
@Repository
public interface PatientProjectRepository extends JpaRepository<PatientProject, UUID> {

    /**
     * Find all active patient projects for a patient.
     */
    @Query("SELECT pp FROM PatientProject pp WHERE pp.patient.id = :patientId AND pp.leftAt IS NULL ORDER BY pp.enrolledAt DESC")
    List<PatientProject> findActiveByPatientId(@Param("patientId") UUID patientId);

    /**
     * Find all patient projects (including historical) for a patient.
     */
    @Query("SELECT pp FROM PatientProject pp WHERE pp.patient.id = :patientId ORDER BY pp.enrolledAt DESC")
    List<PatientProject> findByPatientId(@Param("patientId") UUID patientId);

    /**
     * Find all active patient projects for a project.
     */
    @Query("SELECT pp FROM PatientProject pp WHERE pp.project.id = :projectId AND pp.leftAt IS NULL ORDER BY pp.enrolledAt DESC")
    List<PatientProject> findActiveByProjectId(@Param("projectId") UUID projectId);

    /**
     * Find active enrollment for a patient in a specific project.
     */
    @Query("SELECT pp FROM PatientProject pp WHERE pp.patient.id = :patientId AND pp.project.id = :projectId AND pp.leftAt IS NULL")
    Optional<PatientProject> findActiveEnrollment(@Param("patientId") UUID patientId, 
                                                   @Param("projectId") UUID projectId);

    /**
     * Check if patient is enrolled in a project (active).
     */
    @Query("SELECT COUNT(pp) > 0 FROM PatientProject pp WHERE pp.patient.id = :patientId AND pp.project.id = :projectId AND pp.leftAt IS NULL")
    boolean existsActiveEnrollment(@Param("patientId") UUID patientId, 
                                   @Param("projectId") UUID projectId);

    /**
     * Count active patients in a project.
     */
    @Query("SELECT COUNT(pp) FROM PatientProject pp WHERE pp.project.id = :projectId AND pp.leftAt IS NULL")
    long countActivePatientsByProjectId(@Param("projectId") UUID projectId);

    /**
     * Calculate average compliance score for a project.
     */
    @Query("SELECT AVG(pp.complianceScore) FROM PatientProject pp WHERE pp.project.id = :projectId AND pp.leftAt IS NULL")
    Optional<Double> averageComplianceScoreByProjectId(@Param("projectId") UUID projectId);
}
