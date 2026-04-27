package com.kptest.domain.notification.repository;

import com.kptest.domain.notification.UserDeviceToken;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

/**
 * Repository for UserDeviceToken entity.
 */
@Repository
public interface UserDeviceTokenRepository extends JpaRepository<UserDeviceToken, UUID> {

    /**
     * Find all device tokens for a user.
     */
    List<UserDeviceToken> findByUserId(UUID userId);

    /**
     * Find a specific device token by user and token value.
     */
    Optional<UserDeviceToken> findByUserIdAndToken(UUID userId, String token);

    /**
     * Delete all tokens for a user.
     */
    void deleteByUserId(UUID userId);

    /**
     * Delete a specific token by user and token value.
     */
    void deleteByUserIdAndToken(UUID userId, String token);
}
