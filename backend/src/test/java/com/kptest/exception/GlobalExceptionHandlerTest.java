package com.kptest.exception;

import com.fasterxml.jackson.databind.ObjectMapper;
import jakarta.validation.ConstraintViolationException;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Nested;
import org.junit.jupiter.api.Test;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.boot.autoconfigure.ImportAutoConfiguration;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.authentication.LockedException;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.setup.MockMvcBuilders;
import org.springframework.validation.BindingResult;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.servlet.resource.NoResourceFoundException;

import java.util.List;

import static org.mockito.BDDMockito.*;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

/**
 * Unit tests for GlobalExceptionHandler using standalone MockMvc setup.
 * This avoids loading the full Spring application context.
 */
@ImportAutoConfiguration(exclude = {
    com.kptest.infrastructure.config.JpaConfig.class
})
@DisplayName("GlobalExceptionHandler Unit Tests")
class GlobalExceptionHandlerTest {

    private MockMvc mockMvc;
    private ObjectMapper objectMapper;

    @BeforeEach
    void setUp() {
        GlobalExceptionHandler handler = new GlobalExceptionHandler();
        TestController controller = new TestController();
        
        mockMvc = MockMvcBuilders.standaloneSetup(controller)
            .setControllerAdvice(handler)
            .setMessageConverters(new org.springframework.http.converter.json.MappingJackson2HttpMessageConverter())
            .build();
        
        objectMapper = new ObjectMapper();
    }

    /**
     * Test controller to trigger various exceptions.
     */
    @RestController
    static class TestController {

        @GetMapping("/test/validation")
        public String triggerValidationException() throws MethodArgumentNotValidException {
            throw new MethodArgumentNotValidException(null, createMockBindingResult());
        }

        @GetMapping("/test/constraint")
        public String triggerConstraintViolationException() {
            throw new ConstraintViolationException("Validation error", null);
        }

        @GetMapping("/test/not-found")
        public String triggerResourceNotFoundException() {
            throw new ResourceNotFoundException("User", "123");
        }

        @GetMapping("/test/duplicate")
        public String triggerDuplicateResourceException() {
            throw new DuplicateResourceException("User", "email", "test@example.com");
        }

        @GetMapping("/test/business-rule")
        public String triggerBusinessRuleException() {
            throw new BusinessRuleException("Operation not allowed");
        }

        @GetMapping("/test/invalid-credentials")
        public String triggerInvalidCredentialsException() {
            throw new InvalidCredentialsException();
        }

        @GetMapping("/test/account-locked")
        public String triggerAccountLockedException() {
            throw new AccountLockedException();
        }

        @GetMapping("/test/invalid-2fa")
        public String triggerInvalid2faException() {
            throw new Invalid2faException("Invalid TOTP code");
        }

        @GetMapping("/test/access-denied")
        public String triggerAccessDeniedException() {
            throw new AccessDeniedException("Access denied");
        }

        @GetMapping("/test/his-integration")
        public String triggerHisIntegrationException() {
            throw new HisIntegrationException("HIS system unavailable");
        }

        @GetMapping("/test/generic")
        public String triggerGenericException() {
            throw new RuntimeException("Unexpected error");
        }

        @GetMapping("/test/bad-credentials")
        public String triggerBadCredentialsException() {
            throw new BadCredentialsException("Bad credentials");
        }

        @GetMapping("/test/locked")
        public String triggerLockedException() {
            throw new LockedException("Account locked");
        }

        @GetMapping("/test/domain")
        public String triggerDomainException() {
            throw new DomainException("DOMAIN_ERROR", "Domain error occurred") {};
        }
    }

    /**
     * Create mock binding result for validation tests.
     */
    private static BindingResult createMockBindingResult() {
        BindingResult mockBindingResult = mock(BindingResult.class);
        given(mockBindingResult.getFieldErrors()).willReturn(List.of(
            new org.springframework.validation.FieldError("object", "field", "Default message")
        ));
        given(mockBindingResult.hasErrors()).willReturn(true);
        return mockBindingResult;
    }

    @Nested
    @DisplayName("Validation Exception Tests")
    class ValidationExceptionTests {

        @Test
        @DisplayName("shouldReturn400_WhenMethodArgumentNotValidException")
        void shouldReturn400_WhenMethodArgumentNotValidException() throws Exception {
            // When & Then
            mockMvc.perform(get("/test/validation"))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.error_code").value("VALIDATION_ERROR"))
                .andExpect(jsonPath("$.message").value("Validation failed"))
                .andExpect(jsonPath("$.status").value(400))
                .andExpect(jsonPath("$.details").isArray())
                .andExpect(jsonPath("$.timestamp").exists())
                .andExpect(jsonPath("$.path").value("/test/validation"));
        }

        @Test
        @DisplayName("shouldReturn400_WhenConstraintViolationException")
        void shouldReturn400_WhenConstraintViolationException() throws Exception {
            // When & Then
            mockMvc.perform(get("/test/constraint"))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.error_code").value("VALIDATION_ERROR"))
                .andExpect(jsonPath("$.message").value("Validation failed"))
                .andExpect(jsonPath("$.status").value(400))
                .andExpect(jsonPath("$.details").isArray())
                .andExpect(jsonPath("$.timestamp").exists());
        }
    }

    @Nested
    @DisplayName("Resource Not Found Tests")
    class ResourceNotFoundTests {

        @Test
        @DisplayName("shouldReturn404_WhenResourceNotFoundException")
        void shouldReturn404_WhenResourceNotFoundException() throws Exception {
            // When & Then
            mockMvc.perform(get("/test/not-found"))
                .andExpect(status().isNotFound())
                .andExpect(jsonPath("$.error_code").value("RESOURCE_NOT_FOUND"))
                .andExpect(jsonPath("$.message").value("User not found with identifier: 123"))
                .andExpect(jsonPath("$.status").value(404))
                .andExpect(jsonPath("$.path").value("/test/not-found"));
        }

        @Test
        @DisplayName("shouldReturn404_WhenNoResourceFoundException")
        void shouldReturn404_WhenNoResourceFoundException() throws Exception {
            // When & Then
            mockMvc.perform(get("/non-existent-path"))
                .andExpect(status().isNotFound());
        }
    }

    @Nested
    @DisplayName("Duplicate Resource Tests")
    class DuplicateResourceTests {

        @Test
        @DisplayName("shouldReturn409_WhenDuplicateResourceException")
        void shouldReturn409_WhenDuplicateResourceException() throws Exception {
            // When & Then
            mockMvc.perform(get("/test/duplicate"))
                .andExpect(status().isConflict())
                .andExpect(jsonPath("$.error_code").value("DUPLICATE_RESOURCE"))
                .andExpect(jsonPath("$.message").value("User with email 'test@example.com' already exists"))
                .andExpect(jsonPath("$.status").value(409));
        }
    }

    @Nested
    @DisplayName("Business Rule Tests")
    class BusinessRuleTests {

        @Test
        @DisplayName("shouldReturn400_WhenBusinessRuleException")
        void shouldReturn400_WhenBusinessRuleException() throws Exception {
            // When & Then
            mockMvc.perform(get("/test/business-rule"))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.error_code").value("INVALID_OPERATION"))
                .andExpect(jsonPath("$.message").value("Operation not allowed"))
                .andExpect(jsonPath("$.status").value(400));
        }
    }

    @Nested
    @DisplayName("Authentication Exception Tests")
    class AuthenticationExceptionTests {

        @Test
        @DisplayName("shouldReturn401_WhenInvalidCredentialsException")
        void shouldReturn401_WhenInvalidCredentialsException() throws Exception {
            // When & Then
            mockMvc.perform(get("/test/invalid-credentials"))
                .andExpect(status().isUnauthorized())
                .andExpect(jsonPath("$.error_code").value("UNAUTHORIZED"))
                .andExpect(jsonPath("$.message").value("Invalid email/phone or password"))
                .andExpect(jsonPath("$.status").value(401));
        }

        @Test
        @DisplayName("shouldReturn401_WhenBadCredentialsException")
        void shouldReturn401_WhenBadCredentialsException() throws Exception {
            // When & Then
            mockMvc.perform(get("/test/bad-credentials"))
                .andExpect(status().isUnauthorized())
                .andExpect(jsonPath("$.error_code").value("UNAUTHORIZED"))
                .andExpect(jsonPath("$.message").value("Invalid email/phone or password"))
                .andExpect(jsonPath("$.status").value(401));
        }

        @Test
        @DisplayName("shouldReturn401_WhenInvalid2faException")
        void shouldReturn401_WhenInvalid2faException() throws Exception {
            // When & Then
            mockMvc.perform(get("/test/invalid-2fa"))
                .andExpect(status().isUnauthorized())
                .andExpect(jsonPath("$.error_code").value("UNAUTHORIZED"))
                .andExpect(jsonPath("$.message").value("Invalid TOTP code"))
                .andExpect(jsonPath("$.status").value(401));
        }
    }

    @Nested
    @DisplayName("Account Locking Tests")
    class AccountLockingTests {

        @Test
        @DisplayName("shouldReturn423_WhenAccountLockedException")
        void shouldReturn423_WhenAccountLockedException() throws Exception {
            // When & Then
            mockMvc.perform(get("/test/account-locked"))
                .andExpect(status().isLocked())
                .andExpect(jsonPath("$.error_code").value("ACCOUNT_LOCKED"))
                .andExpect(jsonPath("$.message").value("Account is temporarily locked due to too many failed login attempts"))
                .andExpect(jsonPath("$.status").value(423));
        }

        @Test
        @DisplayName("shouldReturn423_WhenLockedException")
        void shouldReturn423_WhenLockedException() throws Exception {
            // When & Then
            mockMvc.perform(get("/test/locked"))
                .andExpect(status().isLocked())
                .andExpect(jsonPath("$.error_code").value("ACCOUNT_LOCKED"))
                .andExpect(jsonPath("$.message").value("Account is temporarily locked. Please try again later."))
                .andExpect(jsonPath("$.status").value(423));
        }
    }

    @Nested
    @DisplayName("Authorization Tests")
    class AuthorizationTests {

        @Test
        @DisplayName("shouldReturn403_WhenAccessDeniedException")
        void shouldReturn403_WhenAccessDeniedException() throws Exception {
            // When & Then
            mockMvc.perform(get("/test/access-denied"))
                .andExpect(status().isForbidden())
                .andExpect(jsonPath("$.error_code").value("ACCESS_DENIED"))
                .andExpect(jsonPath("$.message").value("You don't have permission to access this resource"))
                .andExpect(jsonPath("$.status").value(403));
        }
    }

    @Nested
    @DisplayName("Integration Exception Tests")
    class IntegrationExceptionTests {

        @Test
        @DisplayName("shouldReturn503_WhenHisIntegrationException")
        void shouldReturn503_WhenHisIntegrationException() throws Exception {
            // When & Then
            mockMvc.perform(get("/test/his-integration"))
                .andExpect(status().isServiceUnavailable())
                .andExpect(jsonPath("$.error_code").value("HIS_UNAVAILABLE"))
                .andExpect(jsonPath("$.message").value("HIS system unavailable"))
                .andExpect(jsonPath("$.status").value(503));
        }
    }

    @Nested
    @DisplayName("Generic Exception Tests")
    class GenericExceptionTests {

        @Test
        @DisplayName("shouldReturn500_WhenGenericException")
        void shouldReturn500_WhenGenericException() throws Exception {
            // When & Then
            mockMvc.perform(get("/test/generic"))
                .andExpect(status().isInternalServerError())
                .andExpect(jsonPath("$.error_code").value("INTERNAL_ERROR"))
                .andExpect(jsonPath("$.message").value("An unexpected error occurred"))
                .andExpect(jsonPath("$.status").value(500));
        }

        @Test
        @DisplayName("shouldReturn500_WhenDomainException")
        void shouldReturn500_WhenDomainException() throws Exception {
            // When & Then
            mockMvc.perform(get("/test/domain"))
                .andExpect(status().isInternalServerError())
                .andExpect(jsonPath("$.error_code").value("INTERNAL_ERROR"))
                .andExpect(jsonPath("$.message").value("An unexpected error occurred"))
                .andExpect(jsonPath("$.status").value(500));
        }
    }

    @Nested
    @DisplayName("Error Response Structure Tests")
    class ErrorResponseStructureTests {

        @Test
        @DisplayName("shouldReturnConsistentErrorResponseStructure")
        void shouldReturnConsistentErrorResponseStructure() throws Exception {
            // When & Then for different exception types
            mockMvc.perform(get("/test/not-found"))
                .andExpect(status().isNotFound())
                .andExpect(jsonPath("$.error_code").exists())
                .andExpect(jsonPath("$.message").exists())
                .andExpect(jsonPath("$.status").exists())
                .andExpect(jsonPath("$.timestamp").exists())
                .andExpect(jsonPath("$.path").exists());

            mockMvc.perform(get("/test/invalid-credentials"))
                .andExpect(status().isUnauthorized())
                .andExpect(jsonPath("$.error_code").exists())
                .andExpect(jsonPath("$.message").exists())
                .andExpect(jsonPath("$.status").exists())
                .andExpect(jsonPath("$.timestamp").exists())
                .andExpect(jsonPath("$.path").exists());
        }

        @Test
        @DisplayName("shouldReturnFieldErrors_WhenValidationException")
        void shouldReturnFieldErrors_WhenValidationException() throws Exception {
            // When & Then
            mockMvc.perform(get("/test/validation"))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.details").isArray())
                .andExpect(jsonPath("$.details[0].field").exists())
                .andExpect(jsonPath("$.details[0].message").exists())
                .andExpect(jsonPath("$.details[0].rejected_value").exists());
        }
    }

    @Nested
    @DisplayName("HTTP Status Tests")
    class HttpStatusTests {

        @Test
        @DisplayName("shouldReturnCorrectStatus_forBadRequest")
        void shouldReturnCorrectStatus_forBadRequest() throws Exception {
            mockMvc.perform(get("/test/validation"))
                .andExpect(status().isBadRequest()); // 400
        }

        @Test
        @DisplayName("shouldReturnCorrectStatus_forUnauthorized")
        void shouldReturnCorrectStatus_forUnauthorized() throws Exception {
            mockMvc.perform(get("/test/invalid-credentials"))
                .andExpect(status().isUnauthorized()); // 401
        }

        @Test
        @DisplayName("shouldReturnCorrectStatus_forForbidden")
        void shouldReturnCorrectStatus_forForbidden() throws Exception {
            mockMvc.perform(get("/test/access-denied"))
                .andExpect(status().isForbidden()); // 403
        }

        @Test
        @DisplayName("shouldReturnCorrectStatus_forNotFound")
        void shouldReturnCorrectStatus_forNotFound() throws Exception {
            mockMvc.perform(get("/test/not-found"))
                .andExpect(status().isNotFound()); // 404
        }

        @Test
        @DisplayName("shouldReturnCorrectStatus_forConflict")
        void shouldReturnCorrectStatus_forConflict() throws Exception {
            mockMvc.perform(get("/test/duplicate"))
                .andExpect(status().isConflict()); // 409
        }

        @Test
        @DisplayName("shouldReturnCorrectStatus_forLocked")
        void shouldReturnCorrectStatus_forLocked() throws Exception {
            mockMvc.perform(get("/test/account-locked"))
                .andExpect(status().isLocked()); // 423
        }

        @Test
        @DisplayName("shouldReturnCorrectStatus_forInternalServerError")
        void shouldReturnCorrectStatus_forInternalServerError() throws Exception {
            mockMvc.perform(get("/test/generic"))
                .andExpect(status().isInternalServerError()); // 500
        }

        @Test
        @DisplayName("shouldReturnCorrectStatus_forServiceUnavailable")
        void shouldReturnCorrectStatus_forServiceUnavailable() throws Exception {
            mockMvc.perform(get("/test/his-integration"))
                .andExpect(status().isServiceUnavailable()); // 503
        }
    }
}
