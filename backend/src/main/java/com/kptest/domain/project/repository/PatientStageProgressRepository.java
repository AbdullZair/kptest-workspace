package com.kptest.domain.project.repository;

import com.kptest.domain.project.PatientStageProgress;
import com.kptest.domain.project.PatientStageProgress.StageStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

/**
 * Repository interface for PatientStageProgress.
 */
@Repository
public interface PatientStageProgressRepository extends JpaRepository<PatientStageProgress, UUID> {

    /**
     * Find all progress records for a patient project.
     */
    List<PatientStageProgress> findByPatientProjectId(UUID patientProjectId);

    /**
     * Find progress for a specific stage and patient project.
     */
    Optional<PatientStageProgress> findByPatientProjectIdAndStageId(UUID patientProjectId, UUID stageId);

    /**
     * Find all stages with a specific status for a patient project.
     */
    List<PatientStageProgress> findByPatientProjectIdAndStatus(UUID patientProjectId, StageStatus status);

    /**
     * Count completed stages for a patient project.
     */
    long countByPatientProjectIdAndStatus(UUID patientProjectId, StageStatus status);

    /**
     * Find the current stage (first non-completed unlocked stage) for a patient project.
     */
    Optional<PatientStageProgress> findFirstByPatientProjectIdAndStatusOrderByStageOrderIndex(
        UUID patientProjectId,
        StageStatus status
    );
}
