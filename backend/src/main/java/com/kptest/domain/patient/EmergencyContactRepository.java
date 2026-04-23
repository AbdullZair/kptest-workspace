package com.kptest.domain.patient;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

/**
 * Repository for EmergencyContact entity.
 */
@Repository
public interface EmergencyContactRepository extends JpaRepository<EmergencyContact, UUID> {

    /**
     * Find all emergency contacts for a patient.
     */
    @Query("SELECT ec FROM EmergencyContact ec WHERE ec.patient.id = :patientId ORDER BY ec.primary DESC, ec.contactName ASC")
    List<EmergencyContact> findByPatientId(@Param("patientId") UUID patientId);

    /**
     * Find primary emergency contact for a patient.
     */
    @Query("SELECT ec FROM EmergencyContact ec WHERE ec.patient.id = :patientId AND ec.primary = true")
    Optional<EmergencyContact> findPrimaryByPatientId(@Param("patientId") UUID patientId);

    /**
     * Delete all contacts for a patient.
     */
    void deleteByPatientId(@Param("patientId") UUID patientId);
}
