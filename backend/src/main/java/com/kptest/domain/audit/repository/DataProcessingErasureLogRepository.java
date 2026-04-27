package com.kptest.domain.audit.repository;

import com.kptest.domain.audit.DataProcessingErasureLog;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.UUID;

/**
 * Repository for DataProcessingErasureLog entity.
 */
@Repository
public interface DataProcessingErasureLogRepository extends JpaRepository<DataProcessingErasureLog, UUID> {

    /**
     * Find erasure logs by patient ID.
     */
    Page<DataProcessingErasureLog> findByPatientId(UUID patientId, Pageable pageable);

    /**
     * Count erasure logs by patient ID.
     */
    long countByPatientId(UUID patientId);
}
