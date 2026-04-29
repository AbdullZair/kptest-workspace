package com.kptest.controller.integration;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.kptest.api.controller.AuthController;
import com.kptest.api.controller.NotificationController;
import com.kptest.api.controller.PatientController;
import com.kptest.api.dto.ChangePasswordRequest;
import com.kptest.api.dto.RegisterDeviceRequest;
import com.kptest.infrastructure.config.SecurityConfig;
import com.kptest.infrastructure.security.JwtAuthenticationFilter;
import com.kptest.support.WebMvcMockBeansConfig;
import com.kptest.support.WebMvcTestConfig;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Nested;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.boot.test.context.TestConfiguration;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Import;
import org.springframework.context.annotation.Primary;
import org.springframework.http.MediaType;
import org.springframework.security.test.context.support.WithMockUser;
import org.springframework.test.context.ContextConfiguration;
import org.springframework.test.web.servlet.MockMvc;

import java.util.UUID;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.delete;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

/**
 * Integration tests for negative authentication / authorization paths
 * that the per-controller {@code @WebMvcTest} slices cannot exercise
 * because they run with {@code addFilters = false}.
 *
 * <p>This slice keeps the {@code WebMvcTestConfig} / {@code WebMvcMockBeansConfig}
 * skeleton (lightweight, no JPA / Flyway / Redis) but additionally imports the
 * real {@link SecurityConfig} and a real
 * {@link JwtAuthenticationFilter}, so the full
 * {@code SecurityFilterChain} is wired into MockMvc. We deliberately do
 * <strong>not</strong> use {@code @AutoConfigureMockMvc(addFilters = false)} -
 * filters are active.</p>
 *
 * <p>Cases covered (5 tests moved from the 4 controller test classes):</p>
 * <ul>
 *   <li>2FA management endpoints without auth - {@code AuthController}</li>
 *   <li>{@code GET /api/v1/auth/me} without auth - {@code AuthController}</li>
 *   <li>{@code POST /api/v1/auth/change-password} without auth - {@code AuthController}</li>
 *   <li>{@code POST /api/v1/notifications/devices/register} without auth -
 *       {@code NotificationController}</li>
 *   <li>{@code DELETE /api/v1/patients/{id}} as DOCTOR (not ADMIN) - 403</li>
 * </ul>
 */
@WebMvcTest({
    AuthController.class,
    NotificationController.class,
    PatientController.class
})
@ContextConfiguration(classes = WebMvcTestConfig.class)
@Import({
    WebMvcMockBeansConfig.class,
    SecurityConfig.class,
    SecurityIntegrationTest.RealJwtFilterConfig.class
})
@AutoConfigureMockMvc
@org.springframework.test.context.TestPropertySource(properties = {
    "spring.main.allow-bean-definition-overriding=true"
})
@DisplayName("Security integration tests (negative auth/authorization)")
class SecurityIntegrationTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ObjectMapper objectMapper;

    /**
     * Replaces the mocked {@code JwtAuthenticationFilter} from
     * {@link WebMvcMockBeansConfig} with the real implementation. The real
     * filter is a no-op when no {@code Authorization: Bearer ...} header is
     * present (returns immediately to the chain), which is exactly what these
     * negative tests need.
     */
    @TestConfiguration
    static class RealJwtFilterConfig {

        /**
         * Bean name {@code jwtAuthenticationFilter} matches the mock bean
         * declared in {@link WebMvcMockBeansConfig}. Because Spring processes
         * {@code @TestConfiguration} after the regular configuration and we
         * disable bean-definition-overriding by default, we register the
         * real filter under a different name and rely on
         * {@link Primary} to win the autowire.
         *
         * Setting {@code spring.main.allow-bean-definition-overriding=true}
         * via {@code @TestPropertySource} on the test class would also work,
         * but using a name and {@link Primary} keeps it local to this slice.
         */
        @Bean(name = "jwtAuthenticationFilter")
        @Primary
        JwtAuthenticationFilter jwtAuthenticationFilter(
            com.kptest.infrastructure.security.JwtService jwtService
        ) {
            return new JwtAuthenticationFilter(jwtService);
        }
    }

    /**
     * Endpoints under {@code /api/v1/auth/**} are configured with
     * {@code permitAll()} at the filter-chain level and
     * {@code @PreAuthorize("isAuthenticated()")} at the method level.
     * For an anonymous request the {@code AccessDeniedException} thrown by
     * method security is translated by
     * {@link com.kptest.exception.GlobalExceptionHandler} to HTTP 403
     * (FORBIDDEN). The contract under test is "the request is rejected
     * without valid authentication" - we accept either 401 or 403.
     */
    @Nested
    @DisplayName("Auth endpoints reject anonymous requests")
    class AuthEndpointsRejectAnonymous {

        @Test
        @DisplayName("shouldReject_When2faManagementWithoutAuthentication")
        void shouldReject_When2faManagementWithoutAuthentication() throws Exception {
            assertUnauthenticated(post("/api/v1/auth/2fa/enable"));

            assertUnauthenticated(post("/api/v1/auth/2fa/confirm")
                .contentType(MediaType.APPLICATION_JSON)
                .content("{}"));

            assertUnauthenticated(post("/api/v1/auth/2fa/disable")
                .contentType(MediaType.APPLICATION_JSON)
                .content("{}"));
        }

        @Test
        @DisplayName("shouldReject_WhenGetUserProfileWithoutAuthentication")
        void shouldReject_WhenGetUserProfileWithoutAuthentication() throws Exception {
            assertUnauthenticated(get("/api/v1/auth/me"));
        }

        @Test
        @DisplayName("shouldReject_WhenChangePasswordWithoutAuthentication")
        void shouldReject_WhenChangePasswordWithoutAuthentication() throws Exception {
            ChangePasswordRequest request = new ChangePasswordRequest(
                "OldPassword123!",
                "NewSecurePassword123!"
            );

            assertUnauthenticated(post("/api/v1/auth/change-password")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(request)));
        }
    }

    /**
     * {@code /api/v1/notifications/**} is not under {@code permitAll()} so
     * anonymous requests are blocked at the filter chain by
     * {@code .anyRequest().authenticated()}.
     */
    @Nested
    @DisplayName("Protected endpoints reject anonymous requests")
    class ProtectedEndpointsRejectAnonymous {

        @Test
        @DisplayName("shouldReject_WhenRegisterDeviceWithoutAuthentication")
        void shouldReject_WhenRegisterDeviceWithoutAuthentication() throws Exception {
            RegisterDeviceRequest request = new RegisterDeviceRequest(
                "fcm_device_token_12345",
                RegisterDeviceRequest.Platform.IOS
            );

            assertUnauthenticated(post("/api/v1/notifications/devices/register")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(request)));
        }
    }

    /**
     * Endpoints with role-based {@code @PreAuthorize} return 403 when the
     * authenticated principal lacks the required role.
     */
    @Nested
    @DisplayName("Role-based authorization rejects insufficient roles")
    class RoleBasedAuthorization {

        @Test
        @WithMockUser(roles = {"DOCTOR"})
        @DisplayName("shouldReturnForbidden_WhenUserIsNotAdmin")
        void shouldReturnForbidden_WhenUserIsNotAdmin() throws Exception {
            UUID patientId = UUID.randomUUID();

            mockMvc.perform(delete("/api/v1/patients/{id}", patientId))
                .andExpect(status().isForbidden());
        }
    }

    private void assertUnauthenticated(
        org.springframework.test.web.servlet.RequestBuilder requestBuilder
    ) throws Exception {
        mockMvc.perform(requestBuilder)
            .andExpect(result -> {
                int status = result.getResponse().getStatus();
                if (status != 401 && status != 403) {
                    throw new AssertionError(
                        "Expected 401 or 403 for unauthenticated request, got " + status
                    );
                }
            });
    }
}
