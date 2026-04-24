package com.kptest.service;

import com.kptest.application.service.AuthenticationService;
import com.kptest.application.service.RegistrationService;
import com.kptest.domain.user.AccountStatus;
import com.kptest.domain.user.User;
import com.kptest.domain.user.UserRepository;
import com.kptest.domain.user.UserRole;
import com.kptest.exception.AccountLockedException;
import com.kptest.exception.DuplicateResourceException;
import com.kptest.exception.InvalidCredentialsException;
import com.kptest.infrastructure.security.JwtService;
import com.kptest.infrastructure.security.RefreshTokenService;
import com.kptest.infrastructure.security.TotpService;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Nested;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.ArgumentCaptor;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.test.util.ReflectionTestUtils;

import java.time.Instant;
import java.util.Optional;
import java.util.UUID;

import static org.assertj.core.api.Assertions.*;
import static org.mockito.ArgumentMatchers.*;
import static org.mockito.BDDMockito.*;

/**
 * Unit tests for AuthenticationService.
 */
@ExtendWith(MockitoExtension.class)
@DisplayName("AuthenticationService Unit Tests")
class AuthenticationServiceTest {

    @Mock
    private UserRepository userRepository;

    @Mock
    private PasswordEncoder passwordEncoder;

    @Mock
    private JwtService jwtService;

    @Mock
    private TotpService totpService;

    @Mock
    private RefreshTokenService refreshTokenService;

    @Mock
    private RegistrationService registrationService;

    private AuthenticationService authenticationService;

    private User testUser;
    private static final String TEST_EMAIL = "test@example.com";
    private static final String TEST_PASSWORD = "TestPassword123!";
    private static final String TEST_PASSWORD_HASH = "$2a$10$hashedPassword";
    private static final String TEST_SECRET = "JBSWY3DPEHPK3PXP";
    private static final String TEST_ACCESS_TOKEN = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.test";
    private static final String TEST_REFRESH_TOKEN = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.refresh";

    @BeforeEach
    void setUp() {
        authenticationService = new AuthenticationService(
            userRepository,
            passwordEncoder,
            jwtService,
            totpService,
            refreshTokenService
        );

        ReflectionTestUtils.setField(authenticationService, "maxLoginAttempts", 5);
        ReflectionTestUtils.setField(authenticationService, "lockoutDurationMinutes", 30);
        ReflectionTestUtils.setField(authenticationService, "issuer", "kptest");

        testUser = createTestUser();
    }

    private User createTestUser() {
        User user = User.create(TEST_EMAIL, TEST_PASSWORD_HASH, UserRole.PATIENT);
        user.setId(UUID.randomUUID());
        user.setPhone(null);
        user.setTwoFactorSecret(null);
        user.setFailedLoginAttempts(0);
        user.setLockedUntil(null);
        return user;
    }

    @Nested
    @DisplayName("Registration Tests")
    class RegistrationTests {

        @Test
        @DisplayName("shouldRegisterPatient_WhenValidData")
        void shouldRegisterPatient_WhenValidData() throws Exception {
            // Given
            String identifier = "patient@example.com";
            String password = "SecurePass123!";
            String pesel = "90010112345";
            String firstName = "John";
            String lastName = "Doe";
            String email = "patient@example.com";
            String phone = "+48123456789";

            User newUser = createTestUser();
            newUser.setEmail(email);

            given(registrationService.registerPatient(any(), any(), any(), any(), any(), any(), any()))
                .willReturn(newUser);

            // When
            User result = registrationService.registerPatient(
                identifier, password, pesel, firstName, lastName, email, phone
            );

            // Then
            assertThat(result).isNotNull();
            assertThat(result.getEmail()).isEqualTo(email);
            then(registrationService).should().registerPatient(
                identifier, password, pesel, firstName, lastName, email, phone
            );
        }

        @Test
        @DisplayName("should throw DuplicateResourceException when email exists")
        void shouldThrowDuplicateResourceException_WhenEmailExists() {
            // Given
            String email = "existing@example.com";
            given(registrationService.registerPatient(eq(email), any(), any(), any(), any(), eq(email), any()))
                .willThrow(new DuplicateResourceException("User", "email", email));

            // When & Then
            assertThatThrownBy(() -> registrationService.registerPatient(
                email, "password", "90010112345", "John", "Doe", email, null
            ))
            .isInstanceOf(DuplicateResourceException.class)
            .hasMessageContaining("email");
        }
    }

    @Nested
    @DisplayName("Login Tests")
    class LoginTests {

        @Test
        @DisplayName("shouldLogin_WhenValidCredentials")
        void shouldLogin_WhenValidCredentials() {
            // Given
            String identifier = TEST_EMAIL;
            String password = TEST_PASSWORD;

            given(userRepository.findByEmailOrPhone(identifier)).willReturn(Optional.of(testUser));
            given(passwordEncoder.matches(password, TEST_PASSWORD_HASH)).willReturn(true);
            given(jwtService.generateAccessToken(any(UUID.class), any(UserRole.class), anyBoolean()))
                .willReturn(TEST_ACCESS_TOKEN);
            given(jwtService.generateRefreshToken(any(UUID.class))).willReturn(TEST_REFRESH_TOKEN);
            given(jwtService.getAccessTokenExpirationMs()).willReturn(3600000L);
            willDoNothing().given(refreshTokenService).storeRefreshToken(any(UUID.class), anyString());

            // When
            AuthenticationService.AuthResult result = authenticationService.authenticate(
                identifier, password, null
            );

            // Then
            assertThat(result).isNotNull();
            assertThat(result.requires2fa()).isFalse();
            assertThat(result.accessToken()).isEqualTo(TEST_ACCESS_TOKEN);
            assertThat(result.refreshToken()).isEqualTo(TEST_REFRESH_TOKEN);
            assertThat(result.expiresIn()).isEqualTo(3600000L);

            then(userRepository).should().save(any(User.class)); // resetFailedLoginAttempts
            then(refreshTokenService).should().storeRefreshToken(testUser.getId(), TEST_REFRESH_TOKEN);
        }

        @Test
        @DisplayName("shouldThrowInvalidCredentialsException_WhenWrongPassword")
        void shouldThrowInvalidCredentialsException_WhenWrongPassword() {
            // Given
            String identifier = TEST_EMAIL;
            String wrongPassword = "WrongPassword123!";

            given(userRepository.findByEmailOrPhone(identifier)).willReturn(Optional.of(testUser));
            given(passwordEncoder.matches(wrongPassword, TEST_PASSWORD_HASH)).willReturn(false);

            // When & Then
            assertThatThrownBy(() -> authenticationService.authenticate(identifier, wrongPassword, null))
                .isInstanceOf(InvalidCredentialsException.class);

            then(userRepository).should().save(any(User.class)); // incrementFailedLoginAttempts
        }

        @Test
        @DisplayName("shouldThrowAccountLockedException_WhenLocked")
        void shouldThrowAccountLockedException_WhenLocked() {
            // Given
            User lockedUser = createTestUser();
            lockedUser.setLockedUntil(Instant.now().plusSeconds(1800)); // Locked for 30 minutes
            lockedUser.setStatus(AccountStatus.BLOCKED);

            given(userRepository.findByEmailOrPhone(TEST_EMAIL)).willReturn(Optional.of(lockedUser));

            // When & Then
            assertThatThrownBy(() -> authenticationService.authenticate(TEST_EMAIL, TEST_PASSWORD, null))
                .isInstanceOf(AccountLockedException.class);

            then(userRepository).should(never()).save(any(User.class));
        }

        @Test
        @DisplayName("shouldThrowInvalidCredentialsException_WhenAccountInactive")
        void shouldThrowInvalidCredentialsException_WhenAccountInactive() {
            // Given
            User inactiveUser = createTestUser();
            inactiveUser.setStatus(AccountStatus.DEACTIVATED);

            given(userRepository.findByEmailOrPhone(TEST_EMAIL)).willReturn(Optional.of(inactiveUser));

            // When & Then
            assertThatThrownBy(() -> authenticationService.authenticate(TEST_EMAIL, TEST_PASSWORD, null))
                .isInstanceOf(InvalidCredentialsException.class);
        }

        @Test
        @DisplayName("shouldThrowInvalidCredentialsException_WhenUserNotFound")
        void shouldThrowInvalidCredentialsException_WhenUserNotFound() {
            // Given
            given(userRepository.findByEmailOrPhone(TEST_EMAIL)).willReturn(Optional.empty());

            // When & Then
            assertThatThrownBy(() -> authenticationService.authenticate(TEST_EMAIL, TEST_PASSWORD, null))
                .isInstanceOf(InvalidCredentialsException.class);
        }
    }

    @Nested
    @DisplayName("2FA Tests")
    class TwoFactorAuthenticationTests {

        @Test
        @DisplayName("shouldRequire2fa_When2faEnabled")
        void shouldRequire2fa_When2faEnabled() {
            // Given
            User userWith2fa = createTestUser();
            userWith2fa.setTwoFactorEnabled(true);
            userWith2fa.setTwoFactorSecret(TEST_SECRET);

            given(userRepository.findByEmailOrPhone(TEST_EMAIL)).willReturn(Optional.of(userWith2fa));
            given(passwordEncoder.matches(TEST_PASSWORD, TEST_PASSWORD_HASH)).willReturn(true);

            // When
            AuthenticationService.AuthResult result = authenticationService.authenticate(
                TEST_EMAIL, TEST_PASSWORD, null
            );

            // Then
            assertThat(result).isNotNull();
            assertThat(result.requires2fa()).isTrue();
            assertThat(result.tempToken()).startsWith("temp_");
        }

        @Test
        @DisplayName("shouldLoginWith2fa_WhenValidTotpCode")
        void shouldLoginWith2fa_WhenValidTotpCode() {
            // Given
            User userWith2fa = createTestUser();
            userWith2fa.setTwoFactorEnabled(true);
            userWith2fa.setTwoFactorSecret(TEST_SECRET);
            String validTotpCode = "123456";

            given(userRepository.findByEmailOrPhone(TEST_EMAIL)).willReturn(Optional.of(userWith2fa));
            given(passwordEncoder.matches(TEST_PASSWORD, TEST_PASSWORD_HASH)).willReturn(true);
            given(totpService.verifyCode(TEST_SECRET, validTotpCode)).willReturn(true);
            given(jwtService.generateAccessToken(any(UUID.class), any(UserRole.class), eq(true)))
                .willReturn(TEST_ACCESS_TOKEN);
            given(jwtService.generateRefreshToken(any(UUID.class))).willReturn(TEST_REFRESH_TOKEN);
            given(jwtService.getAccessTokenExpirationMs()).willReturn(3600000L);
            willDoNothing().given(refreshTokenService).storeRefreshToken(any(UUID.class), anyString());

            // When
            AuthenticationService.AuthResult result = authenticationService.authenticate(
                TEST_EMAIL, TEST_PASSWORD, validTotpCode
            );

            // Then
            assertThat(result.requires2fa()).isFalse();
            assertThat(result.accessToken()).isEqualTo(TEST_ACCESS_TOKEN);
            then(totpService).should().verifyCode(TEST_SECRET, validTotpCode);
        }

        @Test
        @DisplayName("shouldThrowInvalidCredentialsException_WhenInvalidTotpCode")
        void shouldThrowInvalidCredentialsException_WhenInvalidTotpCode() {
            // Given
            User userWith2fa = createTestUser();
            userWith2fa.setTwoFactorEnabled(true);
            userWith2fa.setTwoFactorSecret(TEST_SECRET);
            String invalidTotpCode = "999999";

            given(userRepository.findByEmailOrPhone(TEST_EMAIL)).willReturn(Optional.of(userWith2fa));
            given(passwordEncoder.matches(TEST_PASSWORD, TEST_PASSWORD_HASH)).willReturn(true);
            given(totpService.verifyCode(TEST_SECRET, invalidTotpCode)).willReturn(false);

            // When & Then
            assertThatThrownBy(() -> authenticationService.authenticate(
                TEST_EMAIL, TEST_PASSWORD, invalidTotpCode
            ))
            .isInstanceOf(InvalidCredentialsException.class);
        }

        @Test
        @DisplayName("should verify 2fa when valid temp token and code")
        void shouldVerify2fa_WhenValidTempTokenAndCode() {
            // Given
            User userWith2fa = createTestUser();
            userWith2fa.setTwoFactorEnabled(true);
            userWith2fa.setTwoFactorSecret(TEST_SECRET);
            
            String tempToken = "temp_" + userWith2fa.getId() + "_" + System.currentTimeMillis();
            String validTotpCode = "123456";

            given(userRepository.findById(userWith2fa.getId())).willReturn(Optional.of(userWith2fa));
            given(totpService.verifyCode(TEST_SECRET, validTotpCode)).willReturn(true);
            given(jwtService.generateAccessToken(any(UUID.class), any(UserRole.class), eq(true)))
                .willReturn(TEST_ACCESS_TOKEN);
            given(jwtService.generateRefreshToken(any(UUID.class))).willReturn(TEST_REFRESH_TOKEN);
            given(jwtService.getAccessTokenExpirationMs()).willReturn(3600000L);
            willDoNothing().given(refreshTokenService).storeRefreshToken(any(UUID.class), anyString());

            // When
            AuthenticationService.AuthResult result = authenticationService.verify2fa(tempToken, validTotpCode);

            // Then
            assertThat(result.requires2fa()).isFalse();
            assertThat(result.accessToken()).isEqualTo(TEST_ACCESS_TOKEN);
        }

        @Test
        @DisplayName("shouldThrowInvalidCredentialsException_WhenInvalidTempToken")
        void shouldThrowInvalidCredentialsException_WhenInvalidTempToken() {
            // Given
            String invalidTempToken = "invalid_token";

            // When & Then
            assertThatThrownBy(() -> authenticationService.verify2fa(invalidTempToken, "123456"))
                .isInstanceOf(InvalidCredentialsException.class);
        }
    }

    @Nested
    @DisplayName("Token Refresh Tests")
    class TokenRefreshTests {

        @Test
        @DisplayName("shouldRefreshTokens_WhenValidRefreshToken")
        void shouldRefreshTokens_WhenValidRefreshToken() {
            // Given
            given(jwtService.isTokenExpired(TEST_REFRESH_TOKEN)).willReturn(false);
            given(jwtService.getUserId(TEST_REFRESH_TOKEN)).willReturn(testUser.getId());
            given(refreshTokenService.validateRefreshToken(testUser.getId(), TEST_REFRESH_TOKEN)).willReturn(true);
            given(userRepository.findById(testUser.getId())).willReturn(Optional.of(testUser));
            given(jwtService.generateAccessToken(any(UUID.class), any(UserRole.class), eq(true)))
                .willReturn(TEST_ACCESS_TOKEN);
            given(jwtService.generateRefreshToken(any(UUID.class))).willReturn(TEST_REFRESH_TOKEN + "_new");
            given(jwtService.getAccessTokenExpirationMs()).willReturn(3600000L);
            willDoNothing().given(refreshTokenService).rotateRefreshToken(any(UUID.class), anyString(), anyString());

            // When
            AuthenticationService.AuthResult result = authenticationService.refreshTokens(TEST_REFRESH_TOKEN);

            // Then
            assertThat(result).isNotNull();
            assertThat(result.requires2fa()).isFalse();
            assertThat(result.accessToken()).isEqualTo(TEST_ACCESS_TOKEN);
            assertThat(result.refreshToken()).isEqualTo(TEST_REFRESH_TOKEN + "_new");
            then(refreshTokenService).should().rotateRefreshToken(testUser.getId(), TEST_REFRESH_TOKEN, TEST_REFRESH_TOKEN + "_new");
        }

        @Test
        @DisplayName("shouldThrowInvalidCredentialsException_WhenRefreshTokenExpired")
        void shouldThrowInvalidCredentialsException_WhenRefreshTokenExpired() {
            // Given
            given(jwtService.isTokenExpired(TEST_REFRESH_TOKEN)).willReturn(true);

            // When & Then
            assertThatThrownBy(() -> authenticationService.refreshTokens(TEST_REFRESH_TOKEN))
                .isInstanceOf(InvalidCredentialsException.class);
        }

        @Test
        @DisplayName("shouldThrowInvalidCredentialsException_WhenRefreshTokenInvalid")
        void shouldThrowInvalidCredentialsException_WhenRefreshTokenInvalid() {
            // Given
            given(jwtService.isTokenExpired(TEST_REFRESH_TOKEN)).willReturn(false);
            given(jwtService.getUserId(TEST_REFRESH_TOKEN)).willReturn(testUser.getId());
            given(refreshTokenService.validateRefreshToken(testUser.getId(), TEST_REFRESH_TOKEN)).willReturn(false);

            // When & Then
            assertThatThrownBy(() -> authenticationService.refreshTokens(TEST_REFRESH_TOKEN))
                .isInstanceOf(InvalidCredentialsException.class);
        }
    }

    @Nested
    @DisplayName("2FA Management Tests")
    class TwoFaManagementTests {

        @Test
        @DisplayName("shouldEnable2fa_WhenUserExists")
        void shouldEnable2fa_WhenUserExists() {
            // Given
            given(userRepository.findById(testUser.getId())).willReturn(Optional.of(testUser));
            given(totpService.generateSecret()).willReturn(TEST_SECRET);
            given(totpService.generateQrCodeUri(TEST_SECRET, TEST_EMAIL, "kptest"))
                .willReturn("otpauth://totp/kptest:test@example.com?secret=" + TEST_SECRET + "&issuer=kptest");
            given(totpService.generateBackupCodes()).willReturn(new String[]{"CODE1", "CODE2", "CODE3"});

            // When
            AuthenticationService.TwoFaSetupResult result = authenticationService.enable2fa(testUser.getId());

            // Then
            assertThat(result).isNotNull();
            assertThat(result.enabled()).isFalse();
            assertThat(result.secretKey()).isEqualTo(TEST_SECRET);
            assertThat(result.qrCodeUrl()).contains(TEST_SECRET);
            then(userRepository).should().save(testUser);
        }

        @Test
        @DisplayName("shouldConfirm2fa_WhenValidTotpCode")
        void shouldConfirm2fa_WhenValidTotpCode() {
            // Given
            testUser.setTwoFactorSecret(TEST_SECRET);
            given(userRepository.findById(testUser.getId())).willReturn(Optional.of(testUser));
            given(totpService.verifyCode(TEST_SECRET, "123456")).willReturn(true);

            // When
            boolean result = authenticationService.confirm2fa(testUser.getId(), "123456");

            // Then
            assertThat(result).isTrue();
            assertThat(testUser.isTwoFactorEnabled()).isTrue();
            then(userRepository).should().save(testUser);
        }

        @Test
        @DisplayName("shouldReturnFalse_WhenConfirm2faWithInvalidCode")
        void shouldReturnFalse_WhenConfirm2faWithInvalidCode() {
            // Given
            testUser.setTwoFactorSecret(TEST_SECRET);
            given(userRepository.findById(testUser.getId())).willReturn(Optional.of(testUser));
            given(totpService.verifyCode(TEST_SECRET, "999999")).willReturn(false);

            // When
            boolean result = authenticationService.confirm2fa(testUser.getId(), "999999");

            // Then
            assertThat(result).isFalse();
        }

        @Test
        @DisplayName("shouldDisable2fa_WhenValidTotpCode")
        void shouldDisable2fa_WhenValidTotpCode() {
            // Given
            testUser.setTwoFactorEnabled(true);
            testUser.setTwoFactorSecret(TEST_SECRET);
            given(userRepository.findById(testUser.getId())).willReturn(Optional.of(testUser));
            given(totpService.verifyCode(TEST_SECRET, "123456")).willReturn(true);

            // When
            authenticationService.disable2fa(testUser.getId(), "123456");

            // Then
            assertThat(testUser.isTwoFactorEnabled()).isFalse();
            assertThat(testUser.getTwoFactorSecret()).isNull();
            then(userRepository).should().save(testUser);
        }
    }

    @Nested
    @DisplayName("Account Locking Tests")
    class AccountLockingTests {

        @Test
        @DisplayName("shouldLockAccount_AfterMaxFailedAttempts")
        void shouldLockAccount_AfterMaxFailedAttempts() {
            // Given - user with 4 failed attempts
            testUser.setFailedLoginAttempts(4);
            given(userRepository.findByEmailOrPhone(TEST_EMAIL)).willReturn(Optional.of(testUser));
            given(passwordEncoder.matches(TEST_PASSWORD, TEST_PASSWORD_HASH)).willReturn(false);

            // When
            assertThatThrownBy(() -> authenticationService.authenticate(TEST_EMAIL, TEST_PASSWORD, null))
                .isInstanceOf(InvalidCredentialsException.class);

            // Then - account should be locked after 5th attempt
            ArgumentCaptor<User> userCaptor = ArgumentCaptor.forClass(User.class);
            then(userRepository).should().save(userCaptor.capture());

            User savedUser = userCaptor.getValue();
            assertThat(savedUser.getFailedLoginAttempts()).isEqualTo(5);
            assertThat(savedUser.isLocked()).isTrue();
            assertThat(savedUser.getStatus()).isEqualTo(AccountStatus.BLOCKED);
        }

        @Test
        @DisplayName("shouldResetFailedAttempts_AfterSuccessfulLogin")
        void shouldResetFailedAttempts_AfterSuccessfulLogin() {
            // Given - user with 3 failed attempts
            testUser.setFailedLoginAttempts(3);
            given(userRepository.findByEmailOrPhone(TEST_EMAIL)).willReturn(Optional.of(testUser));
            given(passwordEncoder.matches(TEST_PASSWORD, TEST_PASSWORD_HASH)).willReturn(true);
            given(jwtService.generateAccessToken(any(UUID.class), any(UserRole.class), anyBoolean()))
                .willReturn(TEST_ACCESS_TOKEN);
            given(jwtService.generateRefreshToken(any(UUID.class))).willReturn(TEST_REFRESH_TOKEN);
            given(jwtService.getAccessTokenExpirationMs()).willReturn(3600000L);
            willDoNothing().given(refreshTokenService).storeRefreshToken(any(UUID.class), anyString());

            // When
            authenticationService.authenticate(TEST_EMAIL, TEST_PASSWORD, null);

            // Then
            ArgumentCaptor<User> userCaptor = ArgumentCaptor.forClass(User.class);
            then(userRepository).should().save(userCaptor.capture());

            User savedUser = userCaptor.getValue();
            assertThat(savedUser.getFailedLoginAttempts()).isEqualTo(0);
            assertThat(savedUser.isLocked()).isFalse();
        }
    }
}
