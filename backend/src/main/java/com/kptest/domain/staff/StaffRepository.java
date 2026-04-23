package com.kptest.domain.staff;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.Optional;
import java.util.UUID;

/**
 * Repository for Staff entity.
 */
@Repository
public interface StaffRepository extends JpaRepository<Staff, UUID> {

    /**
     * Find staff by user ID.
     */
    @Query("SELECT s FROM Staff s JOIN s.user u WHERE u.id = :userId")
    Optional<Staff> findByUserId(@Param("userId") UUID userId);

    /**
     * Find staff by employee ID.
     */
    @Query("SELECT s FROM Staff s WHERE s.employeeId = :employeeId")
    Optional<Staff> findByEmployeeId(@Param("employeeId") String employeeId);

    /**
     * Check if employee ID exists.
     */
    @Query("SELECT COUNT(s) > 0 FROM Staff s WHERE s.employeeId = :employeeId")
    boolean existsByEmployeeId(@Param("employeeId") String employeeId);

    /**
     * Count active staff members.
     */
    @Query("SELECT COUNT(s) FROM Staff s WHERE s.active = true")
    long countActive();
}
