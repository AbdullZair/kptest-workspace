package com.kptest.domain.patient;

import com.kptest.domain.user.VerificationStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.Optional;
import java.util.UUID;

/**
 * Repository for Patient entity.
 */
@Repository
public interface PatientRepository extends JpaRepository<Patient, UUID> {

    /**
     * Find patient by user ID.
     */
    @Query("SELECT p FROM Patient p JOIN p.user u WHERE u.id = :userId")
    Optional<Patient> findByUserId(@Param("userId") UUID userId);

    /**
     * Find patient by PESEL.
     */
    @Query("SELECT p FROM Patient p WHERE p.pesel = :pesel")
    Optional<Patient> findByPesel(@Param("pesel") String pesel);

    /**
     * Find patient by HIS patient ID.
     */
    @Query("SELECT p FROM Patient p WHERE p.hisPatientId = :hisPatientId")
    Optional<Patient> findByHisPatientId(@Param("hisPatientId") String hisPatientId);

    /**
     * Check if PESEL exists.
     */
    @Query("SELECT COUNT(p) > 0 FROM Patient p WHERE p.pesel = :pesel")
    boolean existsByPesel(@Param("pesel") String pesel);

    /**
     * Count patients by verification status.
     */
    @Query("SELECT COUNT(p) FROM Patient p WHERE p.verificationStatus = :status")
    long countByVerificationStatus(@Param("status") VerificationStatus status);
}
