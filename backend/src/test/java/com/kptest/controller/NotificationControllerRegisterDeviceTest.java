package com.kptest.controller;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.kptest.api.controller.NotificationController;
import com.kptest.api.dto.RegisterDeviceRequest;
import com.kptest.application.service.NotificationService;
import com.kptest.domain.notification.UserDeviceToken;
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

import java.util.Map;
import java.util.UUID;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.BDDMockito.*;
import static org.springframework.security.test.web.servlet.request.SecurityMockMvcRequestPostProcessors.csrf;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@WebMvcTest(NotificationController.class)
@ContextConfiguration(classes = WebMvcTestConfig.class)
@Import(WebMvcMockBeansConfig.class)
@org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc(addFilters = false)
@DisplayName("NotificationController Register Device Web MVC Tests")
class NotificationControllerRegisterDeviceTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ObjectMapper objectMapper;

    @MockBean
    private NotificationService notificationService;

    private static final UUID TEST_USER_ID = UUID.randomUUID();
    private static final String TEST_DEVICE_TOKEN = "fcm_device_token_12345";
    private static final RegisterDeviceRequest.Platform TEST_PLATFORM = RegisterDeviceRequest.Platform.IOS;

    @Nested
    @DisplayName("Register Device Tests")
    class RegisterDeviceTests {

        @Test
        @DisplayName("shouldRegisterDevice_WhenValidRequest")
        @WithMockUser(username = "test-user-id", roles = {"PATIENT"})
        void shouldRegisterDevice_WhenValidRequest() throws Exception {
            RegisterDeviceRequest request = new RegisterDeviceRequest(
                TEST_DEVICE_TOKEN,
                TEST_PLATFORM
            );

            given(notificationService.registerDeviceToken(
                any(UUID.class), anyString(), any(UserDeviceToken.Platform.class)
            )).willReturn(null);

            mockMvc.perform(post("/api/v1/notifications/devices/register")
                    .with(TestAuthPostProcessors.stringPrincipal(TEST_USER_ID.toString(), "PATIENT"))
                    .contentType(MediaType.APPLICATION_JSON)
                    .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.message").value("Device registered successfully"));

            then(notificationService).should().registerDeviceToken(
                any(UUID.class), eq(TEST_DEVICE_TOKEN), eq(UserDeviceToken.Platform.IOS)
            );
        }

        @Test
        @DisplayName("shouldRegisterAndroidDevice_WhenValidRequest")
        @WithMockUser(username = "test-user-id", roles = {"PATIENT"})
        void shouldRegisterAndroidDevice_WhenValidRequest() throws Exception {
            RegisterDeviceRequest request = new RegisterDeviceRequest(
                TEST_DEVICE_TOKEN,
                RegisterDeviceRequest.Platform.ANDROID
            );

            given(notificationService.registerDeviceToken(
                any(UUID.class), anyString(), any(UserDeviceToken.Platform.class)
            )).willReturn(null);

            mockMvc.perform(post("/api/v1/notifications/devices/register")
                    .with(TestAuthPostProcessors.stringPrincipal(TEST_USER_ID.toString(), "PATIENT"))
                    .contentType(MediaType.APPLICATION_JSON)
                    .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isOk());

            then(notificationService).should().registerDeviceToken(
                any(UUID.class), eq(TEST_DEVICE_TOKEN), eq(UserDeviceToken.Platform.ANDROID)
            );
        }

        // Negative-auth case (no token -> 401/403) moved to
        // com.kptest.controller.integration.SecurityIntegrationTest.

        @Test
        @DisplayName("shouldReturn400_WhenTokenMissing")
        @WithMockUser(username = "test-user-id", roles = {"PATIENT"})
        void shouldReturn400_WhenTokenMissing() throws Exception {
            Map<String, String> request = Map.of("platform", "IOS");

            mockMvc.perform(post("/api/v1/notifications/devices/register")
                    .contentType(MediaType.APPLICATION_JSON)
                    .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isBadRequest());

            then(notificationService).should(never()).registerDeviceToken(any(), any(), any());
        }

        @Test
        @DisplayName("shouldReturn400_WhenPlatformMissing")
        @WithMockUser(username = "test-user-id", roles = {"PATIENT"})
        void shouldReturn400_WhenPlatformMissing() throws Exception {
            Map<String, String> request = Map.of("token", TEST_DEVICE_TOKEN);

            mockMvc.perform(post("/api/v1/notifications/devices/register")
                    .contentType(MediaType.APPLICATION_JSON)
                    .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isBadRequest());

            then(notificationService).should(never()).registerDeviceToken(any(), any(), any());
        }

        @Test
        @DisplayName("shouldReturn400_WhenInvalidPlatform")
        @WithMockUser(username = "test-user-id", roles = {"PATIENT"})
        void shouldReturn400_WhenInvalidPlatform() throws Exception {
            Map<String, String> request = Map.of(
                "token", TEST_DEVICE_TOKEN,
                "platform", "INVALID_PLATFORM"
            );

            mockMvc.perform(post("/api/v1/notifications/devices/register")
                    .contentType(MediaType.APPLICATION_JSON)
                    .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isBadRequest());
        }

        @Test
        @DisplayName("shouldReturn400_WhenEmptyToken")
        @WithMockUser(username = "test-user-id", roles = {"PATIENT"})
        void shouldReturn400_WhenEmptyToken() throws Exception {
            RegisterDeviceRequest request = new RegisterDeviceRequest(
                "",
                TEST_PLATFORM
            );

            mockMvc.perform(post("/api/v1/notifications/devices/register")
                    .contentType(MediaType.APPLICATION_JSON)
                    .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isBadRequest());
        }
    }
}
