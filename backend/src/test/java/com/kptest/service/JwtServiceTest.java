package com.kptest.service;

import com.kptest.domain.user.UserRole;
import com.kptest.infrastructure.security.JwtService;
import io.jsonwebtoken.ExpiredJwtException;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.security.Keys;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Nested;
import org.junit.jupiter.api.Test;
import org.springframework.test.util.ReflectionTestUtils;

import javax.crypto.SecretKey;
import java.nio.charset.StandardCharsets;
import java.util.Date;
import java.util.UUID;

import static org.assertj.core.api.Assertions.*;

/**
 * Unit tests for JwtService.
 */
@DisplayName("JwtService Unit Tests")
class JwtServiceTest {

    private JwtService jwtService;

    private static final String TEST_SECRET = "test-jwt-secret-key-for-testing-purposes-only-min-256-bits-required";
    private static final String TEST_ISSUER = "kptest-test";
    private static final long ACCESS_TOKEN_EXPIRATION_MS = 3600000; // 1 hour
    private static final long REFRESH_TOKEN_EXPIRATION_MS = 604800000; // 7 days
    private static final UUID TEST_USER_ID = UUID.fromString("123e4567-e89b-12d3-a456-426614174000");

    @BeforeEach
    void setUp() {
        jwtService = new JwtService();
        ReflectionTestUtils.setField(jwtService, "jwtSecret", TEST_SECRET);
        ReflectionTestUtils.setField(jwtService, "jwtExpirationMs", ACCESS_TOKEN_EXPIRATION_MS);
        ReflectionTestUtils.setField(jwtService, "refreshExpirationMs", REFRESH_TOKEN_EXPIRATION_MS);
        ReflectionTestUtils.setField(jwtService, "jwtIssuer", TEST_ISSUER);
    }

    @Nested
    @DisplayName("Access Token Generation Tests")
    class AccessTokenGenerationTests {

        @Test
        @DisplayName("shouldGenerateValidAccessToken")
        void shouldGenerateValidAccessToken() {
            // Given
            UserRole role = UserRole.PATIENT;
            boolean twoFaVerified = true;

            // When
            String token = jwtService.generateAccessToken(TEST_USER_ID, role, twoFaVerified);

            // Then
            assertThat(token).isNotNull();
            assertThat(token).isNotBlank();
            assertThat(token.split("\\.")).hasSize(3); // JWT has 3 parts
        }

        @Test
        @DisplayName("shouldGenerateAccessTokenWithCorrectClaims")
        void shouldGenerateAccessTokenWithCorrectClaims() {
            // Given
            UserRole role = UserRole.PATIENT;
            boolean twoFaVerified = true;

            // When
            String token = jwtService.generateAccessToken(TEST_USER_ID, role, twoFaVerified);

            // Then - verify claims
            SecretKey key = Keys.hmacShaKeyFor(TEST_SECRET.getBytes(StandardCharsets.UTF_8));
            var claims = Jwts.parser()
                .verifyWith(key)
                .build()
                .parseSignedClaims(token)
                .getPayload();

            assertThat(claims.getSubject()).isEqualTo(TEST_USER_ID.toString());
            assertThat(claims.get("role", String.class)).isEqualTo(role.name());
            assertThat(claims.get("2fa_verified", Boolean.class)).isTrue();
            assertThat(claims.getIssuer()).isEqualTo(TEST_ISSUER);
            assertThat(claims.getIssuedAt()).isNotNull();
            assertThat(claims.getExpiration()).isNotNull();
        }

        @Test
        @DisplayName("shouldGenerateAccessTokenWithFalse2faVerified_WhenNotVerified")
        void shouldGenerateAccessTokenWithFalse2faVerified_WhenNotVerified() {
            // Given
            boolean twoFaVerified = false;

            // When
            String token = jwtService.generateAccessToken(TEST_USER_ID, UserRole.PATIENT, twoFaVerified);

            // Then
            SecretKey key = Keys.hmacShaKeyFor(TEST_SECRET.getBytes(StandardCharsets.UTF_8));
            var claims = Jwts.parser()
                .verifyWith(key)
                .build()
                .parseSignedClaims(token)
                .getPayload();

            assertThat(claims.get("2fa_verified", Boolean.class)).isFalse();
        }

        @Test
        @DisplayName("shouldGenerateAccessTokenWithCorrectExpiration")
        void shouldGenerateAccessTokenWithCorrectExpiration() {
            // Given
            Date beforeGeneration = new Date();

            // When
            String token = jwtService.generateAccessToken(TEST_USER_ID, UserRole.PATIENT, true);

            // Then
            SecretKey key = Keys.hmacShaKeyFor(TEST_SECRET.getBytes(StandardCharsets.UTF_8));
            var claims = Jwts.parser()
                .verifyWith(key)
                .build()
                .parseSignedClaims(token)
                .getPayload();

            Date expiration = claims.getExpiration();
            Date issuedAt = claims.getIssuedAt();

            assertThat(expiration).isAfter(beforeGeneration);
            assertThat(issuedAt).isBeforeOrEqualTo(new Date());
            
            // Check expiration is approximately correct (within 1 second tolerance)
            long expectedExpirationMs = issuedAt.getTime() + ACCESS_TOKEN_EXPIRATION_MS;
            assertThat(Math.abs(expiration.getTime() - expectedExpirationMs)).isLessThan(1000);
        }
    }

    @Nested
    @DisplayName("Refresh Token Generation Tests")
    class RefreshTokenGenerationTests {

        @Test
        @DisplayName("shouldGenerateValidRefreshToken")
        void shouldGenerateValidRefreshToken() {
            // Given

            // When
            String token = jwtService.generateRefreshToken(TEST_USER_ID);

            // Then
            assertThat(token).isNotNull();
            assertThat(token).isNotBlank();
            assertThat(token.split("\\.")).hasSize(3); // JWT has 3 parts
        }

        @Test
        @DisplayName("shouldGenerateRefreshTokenWithCorrectSubject")
        void shouldGenerateRefreshTokenWithCorrectSubject() {
            // When
            String token = jwtService.generateRefreshToken(TEST_USER_ID);

            // Then
            SecretKey key = Keys.hmacShaKeyFor(TEST_SECRET.getBytes(StandardCharsets.UTF_8));
            var claims = Jwts.parser()
                .verifyWith(key)
                .build()
                .parseSignedClaims(token)
                .getPayload();

            assertThat(claims.getSubject()).isEqualTo(TEST_USER_ID.toString());
            assertThat(claims.getIssuer()).isEqualTo(TEST_ISSUER);
        }

        @Test
        @DisplayName("shouldGenerateRefreshTokenWithLongerExpiration")
        void shouldGenerateRefreshTokenWithLongerExpiration() {
            // Given
            Date beforeGeneration = new Date();

            // When
            String token = jwtService.generateRefreshToken(TEST_USER_ID);

            // Then
            SecretKey key = Keys.hmacShaKeyFor(TEST_SECRET.getBytes(StandardCharsets.UTF_8));
            var claims = Jwts.parser()
                .verifyWith(key)
                .build()
                .parseSignedClaims(token)
                .getPayload();

            Date expiration = claims.getExpiration();
            Date issuedAt = claims.getIssuedAt();

            long expectedExpirationMs = issuedAt.getTime() + REFRESH_TOKEN_EXPIRATION_MS;
            assertThat(Math.abs(expiration.getTime() - expectedExpirationMs)).isLessThan(1000);
            
            // Refresh token should expire later than access token
            long accessTokenExpirationMs = issuedAt.getTime() + ACCESS_TOKEN_EXPIRATION_MS;
            assertThat(expiration.getTime()).isGreaterThan(accessTokenExpirationMs);
        }
    }

    @Nested
    @DisplayName("Token Extraction Tests")
    class TokenExtractionTests {

        @Test
        @DisplayName("shouldExtractUserIdFromToken")
        void shouldExtractUserIdFromToken() {
            // Given
            String token = jwtService.generateAccessToken(TEST_USER_ID, UserRole.PATIENT, true);

            // When
            UUID extractedUserId = jwtService.getUserId(token);

            // Then
            assertThat(extractedUserId).isEqualTo(TEST_USER_ID);
        }

        @Test
        @DisplayName("shouldExtractUserRoleFromToken")
        void shouldExtractUserRoleFromToken() {
            // Given
            String token = jwtService.generateAccessToken(TEST_USER_ID, UserRole.PATIENT, true);

            // When
            UserRole extractedRole = jwtService.getUserRole(token);

            // Then
            assertThat(extractedRole).isEqualTo(UserRole.PATIENT);
        }

        @Test
        @DisplayName("shouldExtract2faVerifiedStatusFromToken")
        void shouldExtract2faVerifiedStatusFromToken() {
            // Given
            String token = jwtService.generateAccessToken(TEST_USER_ID, UserRole.PATIENT, true);

            // When
            boolean is2faVerified = jwtService.is2faVerified(token);

            // Then
            assertThat(is2faVerified).isTrue();
        }

        @Test
        @DisplayName("shouldExtractUserIdFromRefreshToken")
        void shouldExtractUserIdFromRefreshToken() {
            // Given
            String token = jwtService.generateRefreshToken(TEST_USER_ID);

            // When
            UUID extractedUserId = jwtService.getUserId(token);

            // Then
            assertThat(extractedUserId).isEqualTo(TEST_USER_ID);
        }
    }

    @Nested
    @DisplayName("Token Validation Tests")
    class TokenValidationTests {

        @Test
        @DisplayName("shouldValidateToken_WhenValid")
        void shouldValidateToken_WhenValid() {
            // Given
            String token = jwtService.generateAccessToken(TEST_USER_ID, UserRole.PATIENT, true);

            // When
            boolean isValid = jwtService.validateToken(token, TEST_USER_ID);

            // Then
            assertThat(isValid).isTrue();
        }

        @Test
        @DisplayName("shouldReturnFalse_WhenTokenUserIdDoesNotMatch")
        void shouldReturnFalse_WhenTokenUserIdDoesNotMatch() {
            // Given
            String token = jwtService.generateAccessToken(TEST_USER_ID, UserRole.PATIENT, true);
            UUID differentUserId = UUID.fromString("00000000-0000-0000-0000-000000000000");

            // When
            boolean isValid = jwtService.validateToken(token, differentUserId);

            // Then
            assertThat(isValid).isFalse();
        }

        @Test
        @DisplayName("shouldDetectExpiredToken")
        void shouldDetectExpiredToken() {
            // Given - create token with very short expiration
            ReflectionTestUtils.setField(jwtService, "jwtExpirationMs", 1L); // 1ms
            
            String token = jwtService.generateAccessToken(TEST_USER_ID, UserRole.PATIENT, true);
            
            // Wait for token to expire
            try {
                Thread.sleep(10);
            } catch (InterruptedException e) {
                Thread.currentThread().interrupt();
            }

            // When & Then
            assertThat(jwtService.isTokenExpired(token)).isTrue();
        }

        @Test
        @DisplayName("shouldReturnTrue_WhenTokenNotExpired")
        void shouldReturnTrue_WhenTokenNotExpired() {
            // Given
            String token = jwtService.generateAccessToken(TEST_USER_ID, UserRole.PATIENT, true);

            // When & Then
            assertThat(jwtService.isTokenExpired(token)).isFalse();
        }

        @Test
        @DisplayName("shouldReturnTrue_WhenTokenIsExpired_forRefreshToken")
        void shouldReturnTrue_WhenTokenIsExpired_forRefreshToken() {
            // Given - create refresh token with very short expiration
            ReflectionTestUtils.setField(jwtService, "refreshExpirationMs", 1L); // 1ms
            
            String token = jwtService.generateRefreshToken(TEST_USER_ID);
            
            // Wait for token to expire
            try {
                Thread.sleep(10);
            } catch (InterruptedException e) {
                Thread.currentThread().interrupt();
            }

            // When & Then
            assertThat(jwtService.isTokenExpired(token)).isTrue();
        }

        @Test
        @DisplayName("shouldReturnFalse_WhenInvalidToken")
        void shouldReturnFalse_WhenInvalidToken() {
            // Given
            String invalidToken = "invalid.token.here";

            // When
            boolean isValid = jwtService.validateToken(invalidToken, TEST_USER_ID);

            // Then
            assertThat(isValid).isFalse();
        }

        @Test
        @DisplayName("shouldReturnTrue_WhenMalformedToken")
        void shouldReturnTrue_WhenMalformedToken_forIsTokenExpired() {
            // Given
            String malformedToken = "not.a.valid.jwt.token";

            // When - malformed tokens should be treated as expired
            boolean isExpired = jwtService.isTokenExpired(malformedToken);

            // Then
            assertThat(isExpired).isTrue();
        }
    }

    @Nested
    @DisplayName("Token Expiration Tests")
    class TokenExpirationTests {

        @Test
        @DisplayName("shouldGetAccessTokenExpirationMs")
        void shouldGetAccessTokenExpirationMs() {
            // When
            long expirationMs = jwtService.getAccessTokenExpirationMs();

            // Then
            assertThat(expirationMs).isEqualTo(ACCESS_TOKEN_EXPIRATION_MS);
        }

        @Test
        @DisplayName("shouldThrowException_WhenParsingExpiredToken")
        void shouldThrowException_WhenParsingExpiredToken() {
            // Given - create token with very short expiration
            ReflectionTestUtils.setField(jwtService, "jwtExpirationMs", 1L); // 1ms
            
            String token = jwtService.generateAccessToken(TEST_USER_ID, UserRole.PATIENT, true);
            
            // Wait for token to expire
            try {
                Thread.sleep(10);
            } catch (InterruptedException e) {
                Thread.currentThread().interrupt();
            }

            // When & Then
            assertThatThrownBy(() -> jwtService.getUserId(token))
                .isInstanceOf(ExpiredJwtException.class);
        }

        @Test
        @DisplayName("shouldThrowException_WhenParsingInvalidToken")
        void shouldThrowException_WhenParsingInvalidToken() {
            // Given
            String invalidToken = "invalid.token.signature";

            // When & Then
            assertThatThrownBy(() -> jwtService.getUserId(invalidToken))
                .isInstanceOf(Exception.class);
        }
    }

    @Nested
    @DisplayName("Different User Roles Tests")
    class UserRoleTests {

        @Test
        @DisplayName("shouldGenerateTokenForPatientRole")
        void shouldGenerateTokenForPatientRole() {
            // When
            String token = jwtService.generateAccessToken(TEST_USER_ID, UserRole.PATIENT, true);

            // Then
            assertThat(jwtService.getUserRole(token)).isEqualTo(UserRole.PATIENT);
        }

        @Test
        @DisplayName("shouldGenerateTokenForDoctorRole")
        void shouldGenerateTokenForDoctorRole() {
            // When
            String token = jwtService.generateAccessToken(TEST_USER_ID, UserRole.DOCTOR, true);

            // Then
            assertThat(jwtService.getUserRole(token)).isEqualTo(UserRole.DOCTOR);
        }

        @Test
        @DisplayName("shouldGenerateTokenForAdminRole")
        void shouldGenerateTokenForAdminRole() {
            // When
            String token = jwtService.generateAccessToken(TEST_USER_ID, UserRole.ADMIN, true);

            // Then
            assertThat(jwtService.getUserRole(token)).isEqualTo(UserRole.ADMIN);
        }
    }
}
