package com.kptest.domain.gamification.repository;
import com.kptest.domain.gamification.Badge;

import com.kptest.domain.gamification.BadgeCategory;
import com.kptest.domain.gamification.PatientBadge;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

/**
 * Repository interface for PatientBadge entity.
 */
@Repository
public interface PatientBadgeRepository extends JpaRepository<PatientBadge, UUID> {

    /**
     * Find all badges earned by a patient.
     */
    List<PatientBadge> findByPatientIdOrderByEarnedAtDesc(UUID patientId);

    /**
     * Find all notified badges for a patient.
     */
    List<PatientBadge> findByPatientIdAndNotified(UUID patientId, Boolean notified);

    /**
     * Check if patient has a specific badge.
     */
    boolean existsByPatientIdAndBadgeId(UUID patientId, UUID badgeId);

    /**
     * Find a specific patient badge.
     */
    Optional<PatientBadge> findByPatientIdAndBadgeId(UUID patientId, UUID badgeId);

    /**
     * Count badges earned by a patient.
     */
    long countByPatientId(UUID patientId);

    /**
     * Count badges by category for a patient.
     */
    @Query("SELECT COUNT(pb) FROM PatientBadge pb JOIN pb.badge b WHERE pb.patient.id = :patientId AND b.category = :category")
    long countByPatientIdAndBadgeCategory(@Param("patientId") UUID patientId, @Param("category") Badge.BadgeCategory category);

    /**
     * Find recent badges earned by patient.
     */
    @Query("SELECT pb FROM PatientBadge pb WHERE pb.patient.id = :patientId ORDER BY pb.earnedAt DESC")
    List<PatientBadge> findRecentBadges(@Param("patientId") UUID patientId);
}
