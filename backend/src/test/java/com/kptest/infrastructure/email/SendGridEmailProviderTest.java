package com.kptest.infrastructure.email;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.test.util.ReflectionTestUtils;

import java.util.List;
import java.util.Map;

import static org.junit.jupiter.api.Assertions.*;

/**
 * Unit tests for SendGridEmailProvider.
 */
@DisplayName("SendGridEmailProvider Tests")
class SendGridEmailProviderTest {

    private SendGridEmailProvider emailProvider;

    @BeforeEach
    void setUp() {
        emailProvider = new SendGridEmailProvider();
    }

    @Test
    @DisplayName("Should return false when provider is disabled")
    void shouldReturnFalseWhenDisabled() {
        // Given
        ReflectionTestUtils.setField(emailProvider, "enabled", false);

        // When
        boolean result = emailProvider.send("test@example.com", "Subject", "Body");

        // Then
        assertFalse(result);
    }

    @Test
    @DisplayName("Should return false when recipient email is null")
    void shouldReturnFalseWhenEmailIsNull() {
        // Given
        ReflectionTestUtils.setField(emailProvider, "enabled", true);

        // When
        boolean result = emailProvider.send(null, "Subject", "Body");

        // Then
        assertFalse(result);
    }

    @Test
    @DisplayName("Should return false when recipient email is empty")
    void shouldReturnFalseWhenEmailIsEmpty() {
        // Given
        ReflectionTestUtils.setField(emailProvider, "enabled", true);

        // When
        boolean result = emailProvider.send("", "Subject", "Body");

        // Then
        assertFalse(result);
    }

    @Test
    @DisplayName("Should return false when subject is null")
    void shouldReturnFalseWhenSubjectIsNull() {
        // Given
        ReflectionTestUtils.setField(emailProvider, "enabled", true);

        // When
        boolean result = emailProvider.send("test@example.com", null, "Body");

        // Then
        assertFalse(result);
    }

    @Test
    @DisplayName("Should return false when subject is empty")
    void shouldReturnFalseWhenSubjectIsEmpty() {
        // Given
        ReflectionTestUtils.setField(emailProvider, "enabled", true);

        // When
        boolean result = emailProvider.send("test@example.com", "", "Body");

        // Then
        assertFalse(result);
    }

    @Test
    @DisplayName("Should return true when provider is enabled")
    void shouldReturnTrueWhenEnabled() {
        // Given
        ReflectionTestUtils.setField(emailProvider, "enabled", true);

        // When
        boolean result = emailProvider.send("test@example.com", "Subject", "Body");

        // Then
        assertTrue(result);
    }

    @Test
    @DisplayName("Should send HTML email successfully")
    void shouldSendHtmlEmail() {
        // Given
        ReflectionTestUtils.setField(emailProvider, "enabled", true);
        String htmlContent = "<html><body><h1>Test</h1></body></html>";

        // When
        boolean result = emailProvider.sendHtml("test@example.com", "Subject", htmlContent);

        // Then
        assertTrue(result);
    }

    @Test
    @DisplayName("Should send template email successfully")
    void shouldSendTemplateEmail() {
        // Given
        ReflectionTestUtils.setField(emailProvider, "enabled", true);
        Map<String, Object> variables = Map.of("name", "Test");

        // When
        boolean result = emailProvider.sendTemplate("test@example.com", "template_id", variables);

        // Then
        assertTrue(result);
    }

    @Test
    @DisplayName("Should send email with attachment successfully")
    void shouldSendEmailWithAttachment() {
        // Given
        ReflectionTestUtils.setField(emailProvider, "enabled", true);
        byte[] attachment = "test content".getBytes();

        // When
        boolean result = emailProvider.sendWithAttachment(
            "test@example.com", "Subject", "Body", "file.txt", attachment
        );

        // Then
        assertTrue(result);
    }

    @Test
    @DisplayName("Should send bulk email and return success count")
    void shouldSendBulkEmail() {
        // Given
        ReflectionTestUtils.setField(emailProvider, "enabled", true);
        List<String> recipients = List.of("a@example.com", "b@example.com", "c@example.com");

        // When
        int result = emailProvider.sendBulk(recipients, "Subject", "Body");

        // Then
        assertEquals(3, result);
    }

    @Test
    @DisplayName("Should return false for isAvailable when disabled")
    void shouldReturnFalseForIsAvailableWhenDisabled() {
        // Given
        ReflectionTestUtils.setField(emailProvider, "enabled", false);

        // When
        boolean result = emailProvider.isAvailable();

        // Then
        assertFalse(result);
    }

    @Test
    @DisplayName("Should return false for isAvailable when API key is missing")
    void shouldReturnFalseForIsAvailableWhenApiKeyMissing() {
        // Given
        ReflectionTestUtils.setField(emailProvider, "enabled", true);
        ReflectionTestUtils.setField(emailProvider, "fromEmail", "test@example.com");

        // When
        boolean result = emailProvider.isAvailable();

        // Then
        assertFalse(result);
    }

    @Test
    @DisplayName("Should return true for isAvailable when fully configured")
    void shouldReturnTrueForIsAvailableWhenConfigured() {
        // Given
        ReflectionTestUtils.setField(emailProvider, "enabled", true);
        ReflectionTestUtils.setField(emailProvider, "apiKey", "test_api_key");
        ReflectionTestUtils.setField(emailProvider, "fromEmail", "test@example.com");

        // When
        boolean result = emailProvider.isAvailable();

        // Then
        assertTrue(result);
    }

    @Test
    @DisplayName("Should return correct provider name")
    void shouldReturnCorrectProviderName() {
        // When
        String result = emailProvider.getProviderName();

        // Then
        assertEquals("SendGrid", result);
    }
}
