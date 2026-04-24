package com.kptest.domain.notification.repository;

import com.kptest.domain.notification.NotificationPreference;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.Optional;
import java.util.UUID;

/**
 * Repository for NotificationPreference entity.
 */
@Repository
public interface NotificationPreferenceRepository extends JpaRepository<NotificationPreference, UUID> {

    /**
     * Find notification preferences by user ID.
     */
    @Query("SELECT np FROM NotificationPreference np WHERE np.userId = :userId")
    Optional<NotificationPreference> findByUserId(@Param("userId") UUID userId);

    /**
     * Check if user has notification preferences.
     */
    @Query("SELECT COUNT(np) FROM NotificationPreference np WHERE np.userId = :userId")
    long countByUserId(@Param("userId") UUID userId);

    /**
     * Delete notification preferences by user ID.
     */
    void deleteByUserId(@Param("userId") UUID userId);
}
