package com.kptest.domain.audit.repository;

import com.kptest.domain.audit.DataProcessingActivity;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.UUID;

/**
 * Repository for DataProcessingActivity entity.
 */
@Repository
public interface DataProcessingActivityRepository extends JpaRepository<DataProcessingActivity, UUID> {

    /**
     * Find data processing activities by legal basis.
     */
    Page<DataProcessingActivity> findByLegalBasis(DataProcessingActivity.LegalBasis legalBasis, Pageable pageable);
}
