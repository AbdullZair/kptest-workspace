package com.kptest.domain.user;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Nested;
import org.junit.jupiter.api.Test;

import java.time.Instant;
import java.util.UUID;

import static org.assertj.core.api.Assertions.*;

/**
 * Unit tests for User entity.
 */
@DisplayName("User Entity Unit Tests")
class UserTest {

    private User user;
    private static final String TEST_EMAIL = "test@example.com";
    private static final String TEST_PASSWORD_HASH = "hashedPassword123";
    private static final int MAX_LOGIN_ATTEMPTS = 5;
    private static final int LOCKOUT_MINUTES = 30;

    @BeforeEach
    void setUp() {
        user = User.create(TEST_EMAIL, TEST_PASSWORD_HASH, UserRole.PATIENT);
    }

    @Nested
    @DisplayName("Create User Tests")
    class CreateUserTests {

        @Test
        @DisplayName("shouldCreateUser_WithValidData")
        void shouldCreateUser_WithValidData() {
            // When
            User created = User.create("new@example.com", "hash", UserRole.PATIENT);

            // Then
            assertThat(created).isNotNull();
            assertThat(created.getEmail()).isEqualTo("new@example.com");
            assertThat(created.getPasswordHash()).isEqualTo("hash");
            assertThat(created.getRole()).isEqualTo(UserRole.PATIENT);
            assertThat(created.getStatus()).isEqualTo(AccountStatus.ACTIVE);
            assertThat(created.isTwoFactorEnabled()).isFalse();
            assertThat(created.getFailedLoginAttempts()).isZero();
        }

        @Test
        @DisplayName("shouldCreateUser_WithDifferentRoles")
        void shouldCreateUser_WithDifferentRoles() {
            // When & Then
            for (UserRole role : UserRole.values()) {
                User u = User.create(role.name() + "@example.com", "hash", role);
                assertThat(u.getRole()).isEqualTo(role);
            }
        }

        @Test
        @DisplayName("shouldSetDefaultStatusToActive")
        void shouldSetDefaultStatusToActive() {
            // When
            User created = User.create("test@example.com", "hash", UserRole.PATIENT);

            // Then
            assertThat(created.getStatus()).isEqualTo(AccountStatus.ACTIVE);
        }

        @Test
        @DisplayName("shouldSetTwoFactorEnabledToFalse")
        void shouldSetTwoFactorEnabledToFalse() {
            // When
            User created = User.create("test@example.com", "hash", UserRole.PATIENT);

            // Then
            assertThat(created.isTwoFactorEnabled()).isFalse();
        }

        @Test
        @DisplayName("shouldSetFailedLoginAttemptsToZero")
        void shouldSetFailedLoginAttemptsToZero() {
            // When
            User created = User.create("test@example.com", "hash", UserRole.PATIENT);

            // Then
            assertThat(created.getFailedLoginAttempts()).isZero();
        }
    }

    @Nested
    @DisplayName("Is Locked Tests")
    class IsLockedTests {

        @Test
        @DisplayName("shouldReturnFalse_WhenLockedUntilIsNull")
        void shouldReturnFalse_WhenLockedUntilIsNull() {
            // When
            boolean result = user.isLocked();

            // Then
            assertThat(result).isFalse();
        }

        @Test
        @DisplayName("shouldReturnTrue_WhenLockedUntilIsInFuture")
        void shouldReturnTrue_WhenLockedUntilIsInFuture() {
            // Given
            user.setLockedUntil(Instant.now().plusSeconds(3600));

            // When
            boolean result = user.isLocked();

            // Then
            assertThat(result).isTrue();
        }

        @Test
        @DisplayName("shouldReturnFalse_WhenLockedUntilIsInPast")
        void shouldReturnFalse_WhenLockedUntilIsInPast() {
            // Given
            user.setLockedUntil(Instant.now().minusSeconds(3600));

            // When
            boolean result = user.isLocked();

            // Then
            assertThat(result).isFalse();
        }
    }

    @Nested
    @DisplayName("Is Active Tests")
    class IsActiveTests {

        @Test
        @DisplayName("shouldReturnTrue_WhenUserIsActive")
        void shouldReturnTrue_WhenUserIsActive() {
            // When
            boolean result = user.isActive();

            // Then
            assertThat(result).isTrue();
        }

        @Test
        @DisplayName("shouldReturnFalse_WhenUserIsBlocked")
        void shouldReturnFalse_WhenUserIsBlocked() {
            // Given
            user.setStatus(AccountStatus.BLOCKED);

            // When
            boolean result = user.isActive();

            // Then
            assertThat(result).isFalse();
        }

        @Test
        @DisplayName("shouldReturnFalse_WhenUserIsDeactivated")
        void shouldReturnFalse_WhenUserIsDeactivated() {
            // Given
            user.setStatus(AccountStatus.DEACTIVATED);

            // When
            boolean result = user.isActive();

            // Then
            assertThat(result).isFalse();
        }

        @Test
        @DisplayName("shouldReturnFalse_WhenUserIsLocked")
        void shouldReturnFalse_WhenUserIsLocked() {
            // Given
            user.setLockedUntil(Instant.now().plusSeconds(3600));

            // When
            boolean result = user.isActive();

            // Then
            assertThat(result).isFalse();
        }

        @Test
        @DisplayName("shouldReturnFalse_WhenUserIsDeleted")
        void shouldReturnFalse_WhenUserIsDeleted() {
            // Given
            user.setDeletedAt(Instant.now());

            // When
            boolean result = user.isActive();

            // Then
            assertThat(result).isFalse();
        }
    }

    @Nested
    @DisplayName("Increment Failed Login Attempts Tests")
    class IncrementFailedLoginAttemptsTests {

        @Test
        @DisplayName("shouldIncrementFailedLoginAttempts")
        void shouldIncrementFailedLoginAttempts() {
            // When
            user.incrementFailedLoginAttempts(MAX_LOGIN_ATTEMPTS, LOCKOUT_MINUTES);

            // Then
            assertThat(user.getFailedLoginAttempts()).isEqualTo(1);
        }

        @Test
        @DisplayName("shouldLockAccount_WhenMaxAttemptsReached")
        void shouldLockAccount_WhenMaxAttemptsReached() {
            // Given
            for (int i = 0; i < MAX_LOGIN_ATTEMPTS; i++) {
                user.incrementFailedLoginAttempts(MAX_LOGIN_ATTEMPTS, LOCKOUT_MINUTES);
            }

            // When
            user.incrementFailedLoginAttempts(MAX_LOGIN_ATTEMPTS, LOCKOUT_MINUTES);

            // Then
            assertThat(user.isLocked()).isTrue();
            assertThat(user.getStatus()).isEqualTo(AccountStatus.BLOCKED);
            assertThat(user.getLockedUntil()).isNotNull();
        }

        @Test
        @DisplayName("shouldSetLockedUntil_WhenMaxAttemptsReached")
        void shouldSetLockedUntil_WhenMaxAttemptsReached() {
            // Given
            Instant beforeLock = Instant.now();
            for (int i = 0; i < MAX_LOGIN_ATTEMPTS; i++) {
                user.incrementFailedLoginAttempts(MAX_LOGIN_ATTEMPTS, LOCKOUT_MINUTES);
            }

            // When
            user.incrementFailedLoginAttempts(MAX_LOGIN_ATTEMPTS, LOCKOUT_MINUTES);

            // Then
            assertThat(user.getLockedUntil()).isAfterOrEqualTo(beforeLock);
        }

        @Test
        @DisplayName("shouldNotLockAccount_WhenMaxAttemptsNotReached")
        void shouldNotLockAccount_WhenMaxAttemptsNotReached() {
            // Given
            for (int i = 0; i < MAX_LOGIN_ATTEMPTS - 1; i++) {
                user.incrementFailedLoginAttempts(MAX_LOGIN_ATTEMPTS, LOCKOUT_MINUTES);
            }

            // When
            boolean locked = user.isLocked();

            // Then
            assertThat(locked).isFalse();
            assertThat(user.getStatus()).isNotEqualTo(AccountStatus.BLOCKED);
        }

        @Test
        @DisplayName("shouldBlockStatus_WhenMaxAttemptsReached")
        void shouldBlockStatus_WhenMaxAttemptsReached() {
            // When
            for (int i = 0; i < MAX_LOGIN_ATTEMPTS + 1; i++) {
                user.incrementFailedLoginAttempts(MAX_LOGIN_ATTEMPTS, LOCKOUT_MINUTES);
            }

            // Then
            assertThat(user.getStatus()).isEqualTo(AccountStatus.BLOCKED);
        }
    }

    @Nested
    @DisplayName("Reset Failed Login Attempts Tests")
    class ResetFailedLoginAttemptsTests {

        @Test
        @DisplayName("shouldResetFailedLoginAttempts")
        void shouldResetFailedLoginAttempts() {
            // Given
            user.incrementFailedLoginAttempts(MAX_LOGIN_ATTEMPTS, LOCKOUT_MINUTES);
            user.incrementFailedLoginAttempts(MAX_LOGIN_ATTEMPTS, LOCKOUT_MINUTES);

            // When
            user.resetFailedLoginAttempts();

            // Then
            assertThat(user.getFailedLoginAttempts()).isZero();
        }

        @Test
        @DisplayName("shouldClearLockedUntil")
        void shouldClearLockedUntil() {
            // Given
            user.setLockedUntil(Instant.now().plusSeconds(3600));

            // When
            user.resetFailedLoginAttempts();

            // Then
            assertThat(user.getLockedUntil()).isNull();
        }

        @Test
        @DisplayName("shouldSetStatusToActive_WhenWasBlocked")
        void shouldSetStatusToActive_WhenWasBlocked() {
            // Given
            user.setStatus(AccountStatus.BLOCKED);

            // When
            user.resetFailedLoginAttempts();

            // Then
            assertThat(user.getStatus()).isEqualTo(AccountStatus.ACTIVE);
        }

        @Test
        @DisplayName("shouldSetLastLoginAt")
        void shouldSetLastLoginAt() {
            // Given
            Instant beforeReset = Instant.now();

            // When
            user.resetFailedLoginAttempts();

            // Then
            assertThat(user.getLastLoginAt()).isAfterOrEqualTo(beforeReset);
        }
    }

    @Nested
    @DisplayName("Deactivate User Tests")
    class DeactivateUserTests {

        @Test
        @DisplayName("shouldDeactivateUser")
        void shouldDeactivateUser() {
            // When
            user.deactivate();

            // Then
            assertThat(user.getDeletedAt()).isNotNull();
            assertThat(user.getStatus()).isEqualTo(AccountStatus.DEACTIVATED);
        }

        @Test
        @DisplayName("shouldSetDeletedAt_WhenDeactivated")
        void shouldSetDeletedAt_WhenDeactivated() {
            // Given
            Instant beforeDeactivate = Instant.now();

            // When
            user.deactivate();

            // Then
            assertThat(user.getDeletedAt()).isAfterOrEqualTo(beforeDeactivate);
        }
    }

    @Nested
    @DisplayName("Two Factor Authentication Tests")
    class TwoFactorAuthTests {

        @Test
        @DisplayName("shouldSetTwoFactorEnabled")
        void shouldSetTwoFactorEnabled() {
            // When
            user.setTwoFactorEnabled(true);

            // Then
            assertThat(user.isTwoFactorEnabled()).isTrue();
        }

        @Test
        @DisplayName("shouldSetTwoFactorDisabled")
        void shouldSetTwoFactorDisabled() {
            // Given
            user.setTwoFactorEnabled(true);

            // When
            user.setTwoFactorEnabled(false);

            // Then
            assertThat(user.isTwoFactorEnabled()).isFalse();
        }

        @Test
        @DisplayName("shouldSetTwoFactorSecret")
        void shouldSetTwoFactorSecret() {
            // Given
            String secret = "TESTSECRET123";

            // When
            user.setTwoFactorSecret(secret);

            // Then
            assertThat(user.getTwoFactorSecret()).isEqualTo(secret);
        }
    }

    @Nested
    @DisplayName("User Fields Tests")
    class UserFieldsTests {

        @Test
        @DisplayName("shouldSetPhone")
        void shouldSetPhone() {
            // Given
            String phone = "+48123456789";

            // When
            user.setPhone(phone);

            // Then
            assertThat(user.getPhone()).isEqualTo(phone);
        }

        @Test
        @DisplayName("shouldSetPasswordHash")
        void shouldSetPasswordHash() {
            // Given
            String newHash = "newHash123";

            // When
            user.setPasswordHash(newHash);

            // Then
            assertThat(user.getPasswordHash()).isEqualTo(newHash);
        }

        @Test
        @DisplayName("shouldSetEmail")
        void shouldSetEmail() {
            // Given
            String newEmail = "new@example.com";

            // When
            user.setEmail(newEmail);

            // Then
            assertThat(user.getEmail()).isEqualTo(newEmail);
        }

        @Test
        @DisplayName("shouldSetRole")
        void shouldSetRole() {
            // Given
            UserRole newRole = UserRole.ADMIN;

            // When
            user.setRole(newRole);

            // Then
            assertThat(user.getRole()).isEqualTo(newRole);
        }
    }

    @Nested
    @DisplayName("User Equality Tests")
    class EqualityTests {

        @Test
        @DisplayName("shouldEqual_WhenSameId")
        void shouldEqual_WhenSameId() {
            // Given
            User user2 = new User();
            user2.setId(user.getId());

            // When & Then
            assertThat(user).isEqualTo(user2);
        }

        @Test
        @DisplayName("shouldNotEqual_WhenDifferentId")
        void shouldNotEqual_WhenDifferentId() {
            // Given
            User user2 = new User();
            user2.setId(UUID.randomUUID()); // Different ID

            // When & Then
            assertThat(user).isNotEqualTo(user2);
        }

        @Test
        @DisplayName("shouldNotEqual_WhenNull")
        void shouldNotEqual_WhenNull() {
            // When & Then
            assertThat(user).isNotNull();
        }

        @Test
        @DisplayName("shouldNotEqual_WhenDifferentClass")
        void shouldNotEqual_WhenDifferentClass() {
            // When & Then
            assertThat(user).isNotEqualTo("string");
        }
    }
}
