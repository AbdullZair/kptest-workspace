package com.kptest.domain.patient;

import com.kptest.domain.user.VerificationStatus;
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

    /**
     * Find patients with filters.
     */
    @Query("""
        SELECT DISTINCT p FROM Patient p
        LEFT JOIN p.user u
        WHERE (:pesel IS NULL OR p.pesel = :pesel)
          AND (:name IS NULL OR LOWER(p.firstName) LIKE LOWER(CONCAT('%', :name, '%')) 
                            OR LOWER(p.lastName) LIKE LOWER(CONCAT('%', :name, '%')))
          AND (:hisPatientId IS NULL OR p.hisPatientId = :hisPatientId)
          AND (:status IS NULL OR u.status IN :status)
          AND (:verificationStatus IS NULL OR p.verificationStatus IN :verificationStatus)
        ORDER BY p.lastName ASC
        """)
    List<Patient> findAllWithFilters(
        @Param("pesel") String pesel,
        @Param("name") String name,
        @Param("hisPatientId") String hisPatientId,
        @Param("status") Set<String> status,
        @Param("verificationStatus") Set<VerificationStatus> verificationStatus,
        @Param("project") String project,
        Pageable pageable
    );

    /**
     * Count patients with filters.
     */
    @Query("""
        SELECT COUNT(DISTINCT p) FROM Patient p
        LEFT JOIN p.user u
        WHERE (:pesel IS NULL OR p.pesel = :pesel)
          AND (:name IS NULL OR LOWER(p.firstName) LIKE LOWER(CONCAT('%', :name, '%')) 
                            OR LOWER(p.lastName) LIKE LOWER(CONCAT('%', :name, '%')))
          AND (:hisPatientId IS NULL OR p.hisPatientId = :hisPatientId)
          AND (:status IS NULL OR u.status IN :status)
          AND (:verificationStatus IS NULL OR p.verificationStatus IN :verificationStatus)
        """)
    long countWithFilters(
        @Param("pesel") String pesel,
        @Param("name") String name,
        @Param("hisPatientId") String hisPatientId,
        @Param("status") Set<String> status,
        @Param("verificationStatus") Set<VerificationStatus> verificationStatus,
        @Param("project") String project
    );

    /**
     * Search patients by query.
     */
    @Query("""
        SELECT p FROM Patient p
        WHERE LOWER(p.pesel) LIKE LOWER(CONCAT('%', :query, '%'))
           OR LOWER(CONCAT(p.firstName, ' ', p.lastName)) LIKE LOWER(CONCAT('%', :query, '%'))
           OR LOWER(p.hisPatientId) LIKE LOWER(CONCAT('%', :query, '%'))
        ORDER BY p.lastName ASC
        """)
    List<Patient> search(@Param("query") String query);
}
