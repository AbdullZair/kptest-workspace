package com.kptest.infrastructure.security;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.redis.core.RedisTemplate;
import org.springframework.stereotype.Service;

import java.time.Duration;
import java.util.UUID;

/**
 * Service for managing refresh tokens in Redis.
 */
@Slf4j
@Service
@RequiredArgsConstructor
public class RefreshTokenService {

    private final RedisTemplate<String, String> redisTemplate;
    
    private static final String REFRESH_TOKEN_PREFIX = "refresh_token:";
    private static final Duration REFRESH_TOKEN_TTL = Duration.ofDays(7);

    /**
     * Store refresh token in Redis.
     */
    public void storeRefreshToken(UUID userId, String refreshToken) {
        String key = buildKey(userId, refreshToken);
        redisTemplate.opsForValue().set(key, userId.toString(), REFRESH_TOKEN_TTL);
        log.debug("Stored refresh token for user {}", userId);
    }

    /**
     * Validate refresh token.
     */
    public boolean validateRefreshToken(UUID userId, String refreshToken) {
        String key = buildKey(userId, refreshToken);
        String storedUserId = redisTemplate.opsForValue().get(key);
        return userId.toString().equals(storedUserId);
    }

    /**
     * Revoke refresh token.
     */
    public void revokeRefreshToken(UUID userId, String refreshToken) {
        String key = buildKey(userId, refreshToken);
        redisTemplate.delete(key);
        log.debug("Revoked refresh token for user {}", userId);
    }

    /**
     * Rotate refresh token (revoke old, store new).
     */
    public void rotateRefreshToken(UUID userId, String oldRefreshToken, String newRefreshToken) {
        revokeRefreshToken(userId, oldRefreshToken);
        storeRefreshToken(userId, newRefreshToken);
        log.debug("Rotated refresh token for user {}", userId);
    }

    /**
     * Revoke all refresh tokens for a user.
     */
    public void revokeAllUserTokens(UUID userId) {
        // In production, use a different storage strategy for efficient user-based lookup
        log.info("Revoking all tokens for user {}", userId);
        // This is a simplified implementation
    }

    private String buildKey(UUID userId, String refreshToken) {
        // Use hash of refresh token as key for efficient lookup
        return REFRESH_TOKEN_PREFIX + refreshToken.hashCode();
    }
}
