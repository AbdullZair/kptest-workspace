package com.kptest.infrastructure.security;

import com.kptest.domain.user.UserRole;
import io.jsonwebtoken.Claims;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.security.Keys;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import javax.crypto.SecretKey;
import java.nio.charset.StandardCharsets;
import java.util.Date;
import java.util.HashMap;
import java.util.Map;
import java.util.UUID;

/**
 * JWT Service for token generation and validation.
 */
@Slf4j
@Service
public class JwtService {

    @Value("${kptest.jwt.secret}")
    private String jwtSecret;
    
    @Value("${kptest.jwt.expiration-ms}")
    private long jwtExpirationMs;
    
    @Value("${kptest.jwt.refresh-expiration-ms}")
    private long refreshExpirationMs;
    
    @Value("${kptest.jwt.issuer}")
    private String jwtIssuer;

    private SecretKey getSigningKey() {
        byte[] keyBytes = jwtSecret.getBytes(StandardCharsets.UTF_8);
        return Keys.hmacShaKeyFor(keyBytes);
    }

    /**
     * Generate access token for authenticated user.
     */
    public String generateAccessToken(UUID userId, UserRole role, boolean twoFaVerified) {
        Map<String, Object> claims = new HashMap<>();
        claims.put("sub", userId.toString());
        claims.put("role", role.name());
        claims.put("2fa_verified", twoFaVerified);

        return Jwts.builder()
            .claims(claims)
            .header().add("typ", "JWT").and()
            .issuer(jwtIssuer)
            .issuedAt(new Date())
            .expiration(new Date(System.currentTimeMillis() + jwtExpirationMs))
            .signWith(getSigningKey())
            .compact();
    }

    /**
     * Generate refresh token.
     */
    public String generateRefreshToken(UUID userId) {
        return Jwts.builder()
            .subject(userId.toString())
            .issuer(jwtIssuer)
            .issuedAt(new Date())
            .expiration(new Date(System.currentTimeMillis() + refreshExpirationMs))
            .signWith(getSigningKey())
            .compact();
    }

    /**
     * Extract user ID from token.
     */
    public UUID getUserId(String token) {
        Claims claims = extractAllClaims(token);
        return UUID.fromString(claims.getSubject());
    }

    /**
     * Extract user role from token.
     */
    public UserRole getUserRole(String token) {
        Claims claims = extractAllClaims(token);
        return UserRole.valueOf(claims.get("role", String.class));
    }

    /**
     * Check if 2FA was verified for this token.
     */
    public boolean is2faVerified(String token) {
        Claims claims = extractAllClaims(token);
        return claims.get("2fa_verified", Boolean.class);
    }

    /**
     * Check if token is expired.
     */
    public boolean isTokenExpired(String token) {
        try {
            Claims claims = extractAllClaims(token);
            return claims.getExpiration().before(new Date());
        } catch (Exception e) {
            return true;
        }
    }

    /**
     * Validate token.
     */
    public boolean validateToken(String token, UUID userId) {
        try {
            final UUID tokenUserId = getUserId(token);
            return tokenUserId.equals(userId) && !isTokenExpired(token);
        } catch (Exception e) {
            log.warn("Token validation failed: {}", e.getMessage());
            return false;
        }
    }

    /**
     * Get token expiration time in milliseconds.
     */
    public long getAccessTokenExpirationMs() {
        return jwtExpirationMs;
    }

    /**
     * Extract all claims from token.
     */
    private Claims extractAllClaims(String token) {
        return Jwts.parser()
            .verifyWith(getSigningKey())
            .build()
            .parseSignedClaims(token)
            .getPayload();
    }
}
