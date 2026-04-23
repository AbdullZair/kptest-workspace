package com.kptest.domain.user;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.Optional;
import java.util.UUID;

/**
 * Repository for User entity.
 */
@Repository
public interface UserRepository extends JpaRepository<User, UUID> {

    /**
     * Find user by email (case-insensitive).
     */
    @Query("SELECT u FROM User u WHERE LOWER(u.email) = LOWER(:email) AND u.deletedAt IS NULL")
    Optional<User> findByEmail(@Param("email") String email);

    /**
     * Find user by phone.
     */
    @Query("SELECT u FROM User u WHERE u.phone = :phone AND u.deletedAt IS NULL")
    Optional<User> findByPhone(@Param("phone") String phone);

    /**
     * Find user by email or phone.
     */
    @Query("SELECT u FROM User u WHERE (LOWER(u.email) = LOWER(:identifier) OR u.phone = :identifier) AND u.deletedAt IS NULL")
    Optional<User> findByEmailOrPhone(@Param("identifier") String identifier);

    /**
     * Check if email exists (case-insensitive).
     */
    @Query("SELECT COUNT(u) > 0 FROM User u WHERE LOWER(u.email) = LOWER(:email) AND u.deletedAt IS NULL")
    boolean existsByEmail(@Param("email") String email);

    /**
     * Check if phone exists.
     */
    @Query("SELECT COUNT(u) > 0 FROM User u WHERE u.phone = :phone AND u.deletedAt IS NULL")
    boolean existsByPhone(@Param("phone") String phone);

    /**
     * Count active users by role.
     */
    @Query("SELECT COUNT(u) FROM User u WHERE u.role = :role AND u.status = com.kptest.domain.user.AccountStatus.ACTIVE AND u.deletedAt IS NULL")
    long countActiveByRole(@Param("role") UserRole role);
}
