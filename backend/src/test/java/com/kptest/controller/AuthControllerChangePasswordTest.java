package com.kptest.controller;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.kptest.api.controller.AuthController;
import com.kptest.api.dto.ChangePasswordRequest;
import com.kptest.application.service.AuthenticationService;
import com.kptest.application.service.RegistrationService;
import com.kptest.domain.patient.Patient;
import com.kptest.domain.user.AccountStatus;
import com.kptest.domain.user.User;
import com.kptest.domain.user.UserRole;
import com.kptest.exception.BusinessRuleException;
import com.kptest.exception.InvalidCredentialsException;
import com.kptest.infrastructure.config.CustomUserDetailsService;
import com.kptest.infrastructure.security.JwtService;
import com.kptest.domain.user.UserRepository;
import com.kptest.infrastructure.security.RefreshTokenService;
import com.kptest.infrastructure.security.TotpService;
import com.kptest.support.TestAuthPostProcessors;
import com.kptest.support.WebMvcMockBeansConfig;
import com.kptest.support.WebMvcTestConfig;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Nested;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.boot.autoconfigure.ImportAutoConfiguration;
import org.springframework.boot.autoconfigure.security.servlet.SecurityAutoConfiguration;
import org.springframework.boot.autoconfigure.security.servlet.SecurityFilterAutoConfiguration;
import org.springframework.context.annotation.Import;
import org.springframework.http.MediaType;
import org.springframework.security.test.context.support.WithMockUser;
import org.springframework.test.context.ContextConfiguration;
import org.springframework.test.web.servlet.MockMvc;

import java.time.Instant;
import java.util.Map;
import java.util.Optional;
import java.util.UUID;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyString;
import static org.mockito.BDDMockito.*;
import static org.springframework.security.test.web.servlet.request.SecurityMockMvcRequestPostProcessors.csrf;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@WebMvcTest(AuthController.class)
@ContextConfiguration(classes = WebMvcTestConfig.class)
@Import(WebMvcMockBeansConfig.class)
@org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc(addFilters = false)
@DisplayName("AuthController Change Password Web MVC Tests")
class AuthControllerChangePasswordTest {

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
    private TotpService totpService;

    @MockBean
    private RefreshTokenService refreshTokenService;

    @MockBean
    private CustomUserDetailsService customUserDetailsService;

    @MockBean
    private UserRepository userRepository;

    private User testUser;
    private static final UUID TEST_USER_ID = UUID.randomUUID();
    private static final String VALID_NEW_PASSWORD = "NewSecurePassword123!";
    private static final String INVALID_SHORT_PASSWORD = "Short1!";
    private static final String INVALID_NO_SPECIAL = "NoSpecialChar123";
    private static final String INVALID_NO_UPPERCASE = "nouppercase123!";

    @BeforeEach
    void setUp() {
        testUser = createUser();
    }

    private User createUser() {
        User user = User.create("test@example.com", "hashedPassword", UserRole.PATIENT);
        user.setId(TEST_USER_ID);
        user.setTwoFactorEnabled(false);
        user.setCreatedAt(Instant.now());
        return user;
    }

    @Nested
    @DisplayName("Change Password Tests")
    class ChangePasswordTests {

        @Test
        @DisplayName("shouldChangePassword_WhenValidRequest")
        @WithMockUser(username = "test-user-id", roles = {"PATIENT"})
        void shouldChangePassword_WhenValidRequest() throws Exception {
            ChangePasswordRequest request = new ChangePasswordRequest(
                "OldPassword123!",
                VALID_NEW_PASSWORD
            );

            willDoNothing().given(authenticationService).changePassword(
                any(UUID.class), anyString(), anyString()
            );

            mockMvc.perform(post("/api/v1/auth/change-password")
                    .with(TestAuthPostProcessors.stringPrincipal(TEST_USER_ID.toString(), "PATIENT"))
                    .contentType(MediaType.APPLICATION_JSON)
                    .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.message").value("Password changed successfully"));

            then(authenticationService).should().changePassword(any(UUID.class), anyString(), anyString());
        }

        @Test
        @org.junit.jupiter.api.Disabled("Security filter chain is mocked out in @WebMvcTest slice; covered by integration tests")
        @DisplayName("shouldReturn401_WhenNotAuthenticated")
        void shouldReturn401_WhenNotAuthenticated() throws Exception {
            ChangePasswordRequest request = new ChangePasswordRequest(
                "OldPassword123!",
                VALID_NEW_PASSWORD
            );

            mockMvc.perform(post("/api/v1/auth/change-password")
                    .contentType(MediaType.APPLICATION_JSON)
                    .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isUnauthorized());

            then(authenticationService).should(never()).changePassword(any(UUID.class), anyString(), anyString());
        }

        @Test
        @DisplayName("shouldReturn400_WhenCurrentPasswordMissing")
        @WithMockUser(username = "test-user-id", roles = {"PATIENT"})
        void shouldReturn400_WhenCurrentPasswordMissing() throws Exception {
            Map<String, String> request = Map.of("newPassword", VALID_NEW_PASSWORD);

            mockMvc.perform(post("/api/v1/auth/change-password")
                    .contentType(MediaType.APPLICATION_JSON)
                    .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isBadRequest());

            then(authenticationService).should(never()).changePassword(any(UUID.class), anyString(), anyString());
        }

        @Test
        @DisplayName("shouldReturn400_WhenNewPasswordMissing")
        @WithMockUser(username = "test-user-id", roles = {"PATIENT"})
        void shouldReturn400_WhenNewPasswordMissing() throws Exception {
            Map<String, String> request = Map.of("currentPassword", "OldPassword123!");

            mockMvc.perform(post("/api/v1/auth/change-password")
                    .contentType(MediaType.APPLICATION_JSON)
                    .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isBadRequest());

            then(authenticationService).should(never()).changePassword(any(UUID.class), anyString(), anyString());
        }

        @Test
        @DisplayName("shouldReturn401_WhenCurrentPasswordInvalid")
        @WithMockUser(username = "test-user-id", roles = {"PATIENT"})
        void shouldReturn401_WhenCurrentPasswordInvalid() throws Exception {
            ChangePasswordRequest request = new ChangePasswordRequest(
                "WrongPassword123!",
                VALID_NEW_PASSWORD
            );

            willThrow(new InvalidCredentialsException())
                .given(authenticationService).changePassword(any(UUID.class), anyString(), anyString());

            mockMvc.perform(post("/api/v1/auth/change-password")
                    .with(TestAuthPostProcessors.stringPrincipal(TEST_USER_ID.toString(), "PATIENT"))
                    .contentType(MediaType.APPLICATION_JSON)
                    .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isUnauthorized());
        }

        @Test
        @DisplayName("shouldReturn400_WhenNewPasswordTooShort")
        @WithMockUser(username = "test-user-id", roles = {"PATIENT"})
        void shouldReturn400_WhenNewPasswordTooShort() throws Exception {
            ChangePasswordRequest request = new ChangePasswordRequest(
                "OldPassword123!",
                INVALID_SHORT_PASSWORD
            );

            mockMvc.perform(post("/api/v1/auth/change-password")
                    .contentType(MediaType.APPLICATION_JSON)
                    .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isBadRequest());

            then(authenticationService).should(never()).changePassword(any(UUID.class), anyString(), anyString());
        }

        @Test
        @DisplayName("shouldReturn400_WhenNewPasswordMissingSpecialChar")
        @WithMockUser(username = "test-user-id", roles = {"PATIENT"})
        void shouldReturn400_WhenNewPasswordMissingSpecialChar() throws Exception {
            ChangePasswordRequest request = new ChangePasswordRequest(
                "OldPassword123!",
                INVALID_NO_SPECIAL
            );

            mockMvc.perform(post("/api/v1/auth/change-password")
                    .contentType(MediaType.APPLICATION_JSON)
                    .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isBadRequest());

            then(authenticationService).should(never()).changePassword(any(UUID.class), anyString(), anyString());
        }

        @Test
        @DisplayName("shouldReturn400_WhenNewPasswordSameAsCurrent")
        @WithMockUser(username = "test-user-id", roles = {"PATIENT"})
        void shouldReturn400_WhenNewPasswordSameAsCurrent() throws Exception {
            String samePassword = "SamePassword123!";
            ChangePasswordRequest request = new ChangePasswordRequest(samePassword, samePassword);

            willThrow(new BusinessRuleException("New password cannot be the same as current password"))
                .given(authenticationService).changePassword(any(UUID.class), eq(samePassword), eq(samePassword));

            mockMvc.perform(post("/api/v1/auth/change-password")
                    .with(TestAuthPostProcessors.stringPrincipal(TEST_USER_ID.toString(), "PATIENT"))
                    .contentType(MediaType.APPLICATION_JSON)
                    .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isBadRequest());
        }
    }
}
