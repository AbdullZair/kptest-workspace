package com.kptest.domain.patient.repository;

import com.kptest.domain.patient.ActivationCode;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.Optional;
import java.util.UUID;

/**
 * Repository for ActivationCode entity.
 */
@Repository
public interface ActivationCodeRepository extends JpaRepository<ActivationCode, UUID> {

    /**
     * Find activation code by code value.
     */
    @Query("SELECT ac FROM ActivationCode ac WHERE ac.code = :code")
    Optional<ActivationCode> findByCode(@Param("code") String code);

    /**
     * Find activation code by patient ID.
     */
    @Query("SELECT ac FROM ActivationCode ac WHERE ac.patientId = :patientId ORDER BY ac.createdAt DESC")
    Optional<ActivationCode> findLatestByPatientId(@Param("patientId") UUID patientId);

    /**
     * Count valid activation codes by patient ID.
     */
    @Query("SELECT COUNT(ac) FROM ActivationCode ac WHERE ac.patientId = :patientId AND ac.isUsed = false AND ac.expiresAt > CURRENT_TIMESTAMP")
    long countValidByPatientId(@Param("patientId") UUID patientId);
}
