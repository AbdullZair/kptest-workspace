package com.kptest.controller;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.kptest.api.controller.AuthController;
import com.kptest.api.dto.*;
import com.kptest.application.service.AuthenticationService;
import com.kptest.application.service.RegistrationService;
import com.kptest.domain.patient.Patient;
import com.kptest.domain.user.AccountStatus;
import com.kptest.domain.user.User;
import com.kptest.domain.user.UserRepository;
import com.kptest.domain.user.UserRole;
import com.kptest.exception.AccountLockedException;
import com.kptest.exception.DuplicateResourceException;
import com.kptest.exception.InvalidCredentialsException;
import com.kptest.infrastructure.config.CustomUserDetailsService;
import com.kptest.infrastructure.security.JwtService;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Nested;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.boot.autoconfigure.ImportAutoConfiguration;
import org.springframework.http.MediaType;
import org.springframework.security.test.context.support.WithMockUser;
import org.springframework.test.web.servlet.MockMvc;

import java.time.Instant;
import java.util.Map;
import java.util.Optional;
import java.util.UUID;

import static org.mockito.ArgumentMatchers.*;
import static org.mockito.BDDMockito.*;
import static org.springframework.security.test.web.servlet.request.SecurityMockMvcRequestPostProcessors.csrf;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

/**
 * Web MVC tests for AuthController.
 */
@WebMvcTest(
    controllers = AuthController.class,
    excludeAutoConfiguration = {
        org.springframework.boot.autoconfigure.security.servlet.SecurityAutoConfiguration.class,
        org.springframework.boot.autoconfigure.security.servlet.SecurityFilterAutoConfiguration.class,
        org.springframework.boot.autoconfigure.security.servlet.UserDetailsServiceAutoConfiguration.class,
        org.springframework.boot.autoconfigure.data.jpa.JpaRepositoriesAutoConfiguration.class,
        org.springframework.boot.autoconfigure.orm.jpa.HibernateJpaAutoConfiguration.class
    }
)
@ImportAutoConfiguration(exclude = {
    com.kptest.infrastructure.config.JpaConfig.class
})
@DisplayName("AuthController Web MVC Tests")
class AuthControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ObjectMapper objectMapper;

    @MockBean
    private AuthenticationService authenticationService;

    @MockBean
    private RegistrationService registrationService;

    @MockBean
    private JwtService jwtService;

    @MockBean
    private UserRepository userRepository;

    @MockBean
    private com.kptest.infrastructure.config.CustomUserDetailsService customUserDetailsService;

    private User testUser;
    private Patient testPatient;
    private static final String TEST_EMAIL = "test@example.com";
    private static final String TEST_PASSWORD = "TestPassword123!";
    private static final String TEST_PESEL = "90010112345";
    private static final String TEST_FIRST_NAME = "John";
    private static final String TEST_LAST_NAME = "Doe";
    private static final String TEST_ACCESS_TOKEN = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.test";
    private static final String TEST_REFRESH_TOKEN = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.refresh";
    private static final UUID TEST_USER_ID = UUID.randomUUID();

    @BeforeEach
    void setUp() {
        testUser = createUser();
        testPatient = createPatient(testUser);
    }

    private User createUser() {
        User user = User.create(TEST_EMAIL, "hashedPassword", UserRole.PATIENT);
        user.setId(TEST_USER_ID);
        user.setTwoFactorEnabled(false);
        user.setCreatedAt(Instant.now());
        return user;
    }

    private Patient createPatient(User user) {
        Patient patient = Patient.create(user, TEST_PESEL, TEST_FIRST_NAME, TEST_LAST_NAME);
        patient.setId(UUID.randomUUID());
        return patient;
    }

    @Nested
    @DisplayName("Registration Tests")
    class RegistrationTests {

        @Test
        @DisplayName("shouldRegisterPatient_WhenValidRequest")
        void shouldRegisterPatient_WhenValidRequest() throws Exception {
            // Given
            RegisterRequest request = new RegisterRequest(
                TEST_EMAIL,
                TEST_PASSWORD,
                TEST_PESEL,
                TEST_FIRST_NAME,
                TEST_LAST_NAME,
                TEST_EMAIL,
                "+48123456789",
                "true"
            );

            given(registrationService.registerPatient(
                any(), any(), any(), any(), any(), any(), any()
            )).willReturn(testUser);

            given(userRepository.findById(TEST_USER_ID)).willReturn(Optional.of(testUser));

            // When & Then
            mockMvc.perform(post("/api/v1/auth/register")
                    .with(csrf())
                    .contentType(MediaType.APPLICATION_JSON)
                    .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.user_id").value(TEST_USER_ID.toString()))
                .andExpect(jsonPath("$.email").value(TEST_EMAIL))
                .andExpect(jsonPath("$.first_name").value(TEST_FIRST_NAME))
                .andExpect(jsonPath("$.last_name").value(TEST_LAST_NAME));

            then(registrationService).should().registerPatient(
                any(), any(), any(), any(), any(), any(), any()
            );
        }

        @Test
        @DisplayName("shouldReturn400_WhenInvalidRegistrationData")
        void shouldReturn400_WhenInvalidRegistrationData() throws Exception {
            // Given
            RegisterRequest invalidRequest = new RegisterRequest(
                "", // Empty identifier
                "weak", // Weak password
                "", // Empty PESEL
                "", // Empty first name
                "", // Empty last name
                "invalid-email", // Invalid email
                "invalid-phone", // Invalid phone
                "" // No terms acceptance
            );

            // When & Then
            mockMvc.perform(post("/api/v1/auth/register")
                    .with(csrf())
                    .contentType(MediaType.APPLICATION_JSON)
                    .content(objectMapper.writeValueAsString(invalidRequest)))
                .andExpect(status().isBadRequest());

            then(registrationService).should(never()).registerPatient(any(), any(), any(), any(), any(), any(), any());
        }

        @Test
        @DisplayName("shouldReturn400_WhenMissingRequiredFields")
        void shouldReturn400_WhenMissingRequiredFields() throws Exception {
            // Given
            String incompleteJson = """
                {
                    "password": "TestPassword123!"
                }
                """;

            // When & Then
            mockMvc.perform(post("/api/v1/auth/register")
                    .with(csrf())
                    .contentType(MediaType.APPLICATION_JSON)
                    .content(incompleteJson))
                .andExpect(status().isBadRequest());
        }

        @Test
        @DisplayName("shouldReturn409_WhenEmailAlreadyExists")
        void shouldReturn409_WhenEmailAlreadyExists() throws Exception {
            // Given
            RegisterRequest request = new RegisterRequest(
                TEST_EMAIL,
                TEST_PASSWORD,
                TEST_PESEL,
                TEST_FIRST_NAME,
                TEST_LAST_NAME,
                TEST_EMAIL,
                "+48123456789",
                "true"
            );

            given(registrationService.registerPatient(
                any(), any(), any(), any(), any(), any(), any()
            )).willThrow(new DuplicateResourceException("User", "email", TEST_EMAIL));

            // When & Then
            mockMvc.perform(post("/api/v1/auth/register")
                    .with(csrf())
                    .contentType(MediaType.APPLICATION_JSON)
                    .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isConflict());
        }

        @Test
        @DisplayName("shouldReturn409_WhenPeselAlreadyExists")
        void shouldReturn409_WhenPeselAlreadyExists() throws Exception {
            // Given
            RegisterRequest request = new RegisterRequest(
                TEST_EMAIL,
                TEST_PASSWORD,
                TEST_PESEL,
                TEST_FIRST_NAME,
                TEST_LAST_NAME,
                TEST_EMAIL,
                "+48123456789",
                "true"
            );

            given(registrationService.registerPatient(
                any(), any(), any(), any(), any(), any(), any()
            )).willThrow(new DuplicateResourceException("Patient", "pesel", TEST_PESEL));

            // When & Then
            mockMvc.perform(post("/api/v1/auth/register")
                    .with(csrf())
                    .contentType(MediaType.APPLICATION_JSON)
                    .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isConflict());
        }
    }

    @Nested
    @DisplayName("Login Tests")
    class LoginTests {

        @Test
        @DisplayName("shouldLogin_WhenValidCredentials")
        void shouldLogin_WhenValidCredentials() throws Exception {
            // Given
            LoginRequest request = new LoginRequest(TEST_EMAIL, TEST_PASSWORD, null);

            AuthenticationService.AuthResult authResult = new AuthenticationService.AuthResult(
                TEST_ACCESS_TOKEN,
                TEST_REFRESH_TOKEN,
                3600L,
                false,
                null
            );

            given(authenticationService.authenticate(TEST_EMAIL, TEST_PASSWORD, null))
                .willReturn(authResult);

            // When & Then
            mockMvc.perform(post("/api/v1/auth/login")
                    .with(csrf())
                    .contentType(MediaType.APPLICATION_JSON)
                    .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.access_token").value(TEST_ACCESS_TOKEN))
                .andExpect(jsonPath("$.refresh_token").value(TEST_REFRESH_TOKEN))
                .andExpect(jsonPath("$.token_type").value("Bearer"))
                .andExpect(jsonPath("$.expires_in").value(3600L))
                .andExpect(jsonPath("$.requires_2fa").doesNotExist());

            then(authenticationService).should().authenticate(TEST_EMAIL, TEST_PASSWORD, null);
        }

        @Test
        @DisplayName("shouldReturn401_WhenInvalidCredentials")
        void shouldReturn401_WhenInvalidCredentials() throws Exception {
            // Given
            LoginRequest request = new LoginRequest(TEST_EMAIL, "wrongpassword", null);

            given(authenticationService.authenticate(TEST_EMAIL, "wrongpassword", null))
                .willThrow(new InvalidCredentialsException());

            // When & Then
            mockMvc.perform(post("/api/v1/auth/login")
                    .with(csrf())
                    .contentType(MediaType.APPLICATION_JSON)
                    .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isUnauthorized());

            then(authenticationService).should().authenticate(TEST_EMAIL, "wrongpassword", null);
        }

        @Test
        @DisplayName("shouldReturn2faRequired_When2faEnabled")
        void shouldReturn2faRequired_When2faEnabled() throws Exception {
            // Given
            LoginRequest request = new LoginRequest(TEST_EMAIL, TEST_PASSWORD, null);

            AuthenticationService.AuthResult authResult = AuthenticationService.AuthResult.requires2fa("temp_token_123");

            given(authenticationService.authenticate(TEST_EMAIL, TEST_PASSWORD, null))
                .willReturn(authResult);

            // When & Then
            mockMvc.perform(post("/api/v1/auth/login")
                    .with(csrf())
                    .contentType(MediaType.APPLICATION_JSON)
                    .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.requires_2fa").value(true))
                .andExpect(jsonPath("$.temp_token").value("temp_token_123"))
                .andExpect(jsonPath("$.access_token").doesNotExist())
                .andExpect(jsonPath("$.refresh_token").doesNotExist());
        }

        @Test
        @DisplayName("shouldReturn400_WhenMissingCredentials")
        void shouldReturn400_WhenMissingCredentials() throws Exception {
            // Given
            String emptyJson = "{}";

            // When & Then
            mockMvc.perform(post("/api/v1/auth/login")
                    .with(csrf())
                    .contentType(MediaType.APPLICATION_JSON)
                    .content(emptyJson))
                .andExpect(status().isBadRequest());
        }

        @Test
        @DisplayName("shouldLoginWithTotpCode_WhenProvided")
        void shouldLoginWithTotpCode_WhenProvided() throws Exception {
            // Given
            String totpCode = "123456";
            LoginRequest request = new LoginRequest(TEST_EMAIL, TEST_PASSWORD, totpCode);

            AuthenticationService.AuthResult authResult = new AuthenticationService.AuthResult(
                TEST_ACCESS_TOKEN,
                TEST_REFRESH_TOKEN,
                3600L,
                false,
                null
            );

            given(authenticationService.authenticate(TEST_EMAIL, TEST_PASSWORD, totpCode))
                .willReturn(authResult);

            // When & Then
            mockMvc.perform(post("/api/v1/auth/login")
                    .with(csrf())
                    .contentType(MediaType.APPLICATION_JSON)
                    .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isOk());

            then(authenticationService).should().authenticate(TEST_EMAIL, TEST_PASSWORD, totpCode);
        }
    }

    @Nested
    @DisplayName("2FA Verification Tests")
    class TwoFactorVerificationTests {

        @Test
        @DisplayName("shouldVerify2fa_WhenValidTempTokenAndCode")
        void shouldVerify2fa_WhenValidTempTokenAndCode() throws Exception {
            // Given
            Map<String, String> request = Map.of(
                "temp_token", "temp_token_123",
                "totp_code", "123456"
            );

            AuthenticationService.AuthResult authResult = new AuthenticationService.AuthResult(
                TEST_ACCESS_TOKEN,
                TEST_REFRESH_TOKEN,
                3600L,
                false,
                null
            );

            given(authenticationService.verify2fa("temp_token_123", "123456"))
                .willReturn(authResult);

            // When & Then
            mockMvc.perform(post("/api/v1/auth/2fa/verify")
                    .with(csrf())
                    .contentType(MediaType.APPLICATION_JSON)
                    .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.access_token").value(TEST_ACCESS_TOKEN))
                .andExpect(jsonPath("$.refresh_token").value(TEST_REFRESH_TOKEN));
        }

        @Test
        @DisplayName("shouldReturn401_WhenInvalid2faCode")
        void shouldReturn401_WhenInvalid2faCode() throws Exception {
            // Given
            Map<String, String> request = Map.of(
                "temp_token", "temp_token_123",
                "totp_code", "wrong_code"
            );

            given(authenticationService.verify2fa("temp_token_123", "wrong_code"))
                .willThrow(new InvalidCredentialsException());

            // When & Then
            mockMvc.perform(post("/api/v1/auth/2fa/verify")
                    .with(csrf())
                    .contentType(MediaType.APPLICATION_JSON)
                    .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isUnauthorized());
        }
    }

    @Nested
    @DisplayName("2FA Management Tests")
    class TwoFaManagementTests {

        @Test
        @DisplayName("shouldEnable2fa_WhenAuthenticated")
        @WithMockUser(username = "test-user-id")
        void shouldEnable2fa_WhenAuthenticated() throws Exception {
            // Given
            AuthenticationService.TwoFaSetupResult setupResult = new AuthenticationService.TwoFaSetupResult(
                false,
                "otpauth://totp/test?secret=ABC123",
                "ABC123",
                new String[]{"CODE1", "CODE2", "CODE3"}
            );

            given(authenticationService.enable2fa(TEST_USER_ID)).willReturn(setupResult);

            // When & Then
            mockMvc.perform(post("/api/v1/auth/2fa/enable")
                    .with(csrf()))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.enabled").value(false))
                .andExpect(jsonPath("$.qr_code_url").value("otpauth://totp/test?secret=ABC123"))
                .andExpect(jsonPath("$.secret_key").value("ABC123"))
                .andExpect(jsonPath("$.backup_codes").isArray());
        }

        @Test
        @DisplayName("shouldConfirm2fa_WhenValidCode")
        @WithMockUser(username = "test-user-id")
        void shouldConfirm2fa_WhenValidCode() throws Exception {
            // Given
            Map<String, String> request = Map.of("totp_code", "123456");

            given(authenticationService.confirm2fa(TEST_USER_ID, "123456")).willReturn(true);

            // When & Then
            mockMvc.perform(post("/api/v1/auth/2fa/confirm")
                    .with(csrf())
                    .contentType(MediaType.APPLICATION_JSON)
                    .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(true));
        }

        @Test
        @DisplayName("shouldReturnFalse_WhenConfirm2faWithInvalidCode")
        @WithMockUser(username = "test-user-id")
        void shouldReturnFalse_WhenConfirm2faWithInvalidCode() throws Exception {
            // Given
            Map<String, String> request = Map.of("totp_code", "wrong_code");

            given(authenticationService.confirm2fa(TEST_USER_ID, "wrong_code")).willReturn(false);

            // When & Then
            mockMvc.perform(post("/api/v1/auth/2fa/confirm")
                    .with(csrf())
                    .contentType(MediaType.APPLICATION_JSON)
                    .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(false));
        }

        @Test
        @DisplayName("shouldDisable2fa_WhenValidCode")
        @WithMockUser(username = "test-user-id")
        void shouldDisable2fa_WhenValidCode() throws Exception {
            // Given
            Map<String, String> request = Map.of("totp_code", "123456");

            willDoNothing().given(authenticationService).disable2fa(TEST_USER_ID, "123456");

            // When & Then
            mockMvc.perform(post("/api/v1/auth/2fa/disable")
                    .with(csrf())
                    .contentType(MediaType.APPLICATION_JSON)
                    .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(true));
        }

        @Test
        @DisplayName("shouldReturn401_When2faManagementWithoutAuthentication")
        void shouldReturn401_When2faManagementWithoutAuthentication() throws Exception {
            // When & Then
            mockMvc.perform(post("/api/v1/auth/2fa/enable")
                    .with(csrf()))
                .andExpect(status().isUnauthorized());

            mockMvc.perform(post("/api/v1/auth/2fa/confirm")
                    .with(csrf())
                    .contentType(MediaType.APPLICATION_JSON)
                    .content("{}"))
                .andExpect(status().isUnauthorized());

            mockMvc.perform(post("/api/v1/auth/2fa/disable")
                    .with(csrf())
                    .contentType(MediaType.APPLICATION_JSON)
                    .content("{}"))
                .andExpect(status().isUnauthorized());
        }
    }

    @Nested
    @DisplayName("Token Refresh Tests")
    class TokenRefreshTests {

        @Test
        @DisplayName("shouldRefreshToken_WhenValidRefreshToken")
        void shouldRefreshToken_WhenValidRefreshToken() throws Exception {
            // Given
            RefreshTokenRequest request = new RefreshTokenRequest(TEST_REFRESH_TOKEN);

            AuthenticationService.AuthResult authResult = new AuthenticationService.AuthResult(
                TEST_ACCESS_TOKEN,
                TEST_REFRESH_TOKEN + "_new",
                3600L,
                false,
                null
            );

            given(authenticationService.refreshTokens(TEST_REFRESH_TOKEN)).willReturn(authResult);

            // When & Then
            mockMvc.perform(post("/api/v1/auth/refresh")
                    .with(csrf())
                    .contentType(MediaType.APPLICATION_JSON)
                    .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.access_token").value(TEST_ACCESS_TOKEN))
                .andExpect(jsonPath("$.refresh_token").value(TEST_REFRESH_TOKEN + "_new"));
        }

        @Test
        @DisplayName("shouldReturn401_WhenInvalidRefreshToken")
        void shouldReturn401_WhenInvalidRefreshToken() throws Exception {
            // Given
            RefreshTokenRequest request = new RefreshTokenRequest("invalid_token");

            given(authenticationService.refreshTokens("invalid_token"))
                .willThrow(new InvalidCredentialsException());

            // When & Then
            mockMvc.perform(post("/api/v1/auth/refresh")
                    .with(csrf())
                    .contentType(MediaType.APPLICATION_JSON)
                    .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isUnauthorized());
        }

        @Test
        @DisplayName("shouldReturn400_WhenMissingRefreshToken")
        void shouldReturn400_WhenMissingRefreshToken() throws Exception {
            // Given
            String emptyJson = "{}";

            // When & Then
            mockMvc.perform(post("/api/v1/auth/refresh")
                    .with(csrf())
                    .contentType(MediaType.APPLICATION_JSON)
                    .content(emptyJson))
                .andExpect(status().isBadRequest());
        }
    }

    @Nested
    @DisplayName("Password Reset Tests")
    class PasswordResetTests {

        @Test
        @DisplayName("shouldReturnSuccess_WhenForgotPasswordRequest")
        void shouldReturnSuccess_WhenForgotPasswordRequest() throws Exception {
            // Given
            ForgotPasswordRequest request = new ForgotPasswordRequest(TEST_EMAIL, "email");

            // When & Then
            mockMvc.perform(post("/api/v1/auth/forgot-password")
                    .with(csrf())
                    .contentType(MediaType.APPLICATION_JSON)
                    .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.message").exists());
        }

        @Test
        @DisplayName("shouldReturnSuccess_WhenResetPasswordRequest")
        void shouldReturnSuccess_WhenResetPasswordRequest() throws Exception {
            // Given
            ResetPasswordRequest request = new ResetPasswordRequest("token123", "NewPassword123!");

            // When & Then
            mockMvc.perform(post("/api/v1/auth/reset-password")
                    .with(csrf())
                    .contentType(MediaType.APPLICATION_JSON)
                    .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(true));
        }
    }

    @Nested
    @DisplayName("User Profile Tests")
    class UserProfileTests {

        @Test
        @DisplayName("shouldGetCurrentUserProfile_WhenAuthenticated")
        @WithMockUser(username = "test-user-id")
        void shouldGetCurrentUserProfile_WhenAuthenticated() throws Exception {
            // Given
            given(userRepository.findById(TEST_USER_ID)).willReturn(Optional.of(testUser));

            // When & Then
            mockMvc.perform(get("/api/v1/auth/me")
                    .with(csrf()))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.user_id").value(TEST_USER_ID.toString()))
                .andExpect(jsonPath("$.email").value(TEST_EMAIL))
                .andExpect(jsonPath("$.role").value("PATIENT"));
        }

        @Test
        @DisplayName("shouldReturn401_WhenGetUserProfileWithoutAuthentication")
        void shouldReturn401_WhenGetUserProfileWithoutAuthentication() throws Exception {
            // When & Then
            mockMvc.perform(get("/api/v1/auth/me")
                    .with(csrf()))
                .andExpect(status().isUnauthorized());
        }

        @Test
        @DisplayName("shouldReturn404_WhenUserNotFound")
        @WithMockUser(username = "test-user-id")
        void shouldReturn404_WhenUserNotFound() throws Exception {
            // Given
            given(userRepository.findById(TEST_USER_ID)).willReturn(Optional.empty());

            // When & Then
            mockMvc.perform(get("/api/v1/auth/me")
                    .with(csrf()))
                .andExpect(status().isNotFound());
        }
    }

    @Nested
    @DisplayName("Account Locking Tests")
    class AccountLockingTests {

        @Test
        @DisplayName("shouldReturn423_WhenAccountLocked")
        void shouldReturn423_WhenAccountLocked() throws Exception {
            // Given
            LoginRequest request = new LoginRequest(TEST_EMAIL, TEST_PASSWORD, null);

            given(authenticationService.authenticate(TEST_EMAIL, TEST_PASSWORD, null))
                .willThrow(new AccountLockedException());

            // When & Then
            mockMvc.perform(post("/api/v1/auth/login")
                    .with(csrf())
                    .contentType(MediaType.APPLICATION_JSON)
                    .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isLocked());
        }
    }
}
