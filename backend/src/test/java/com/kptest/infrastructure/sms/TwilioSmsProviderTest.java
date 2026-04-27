package com.kptest.infrastructure.sms;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.test.util.ReflectionTestUtils;

import static org.junit.jupiter.api.Assertions.*;

/**
 * Unit tests for TwilioSmsProvider.
 */
@DisplayName("TwilioSmsProvider Tests")
class TwilioSmsProviderTest {

    private TwilioSmsProvider smsProvider;

    @BeforeEach
    void setUp() {
        smsProvider = new TwilioSmsProvider();
    }

    @Test
    @DisplayName("Should return false when provider is disabled")
    void shouldReturnFalseWhenDisabled() {
        // Given
        ReflectionTestUtils.setField(smsProvider, "enabled", false);

        // When
        boolean result = smsProvider.send("+48123456789", "Test message");

        // Then
        assertFalse(result);
    }

    @Test
    @DisplayName("Should return false when phone number is null")
    void shouldReturnFalseWhenPhoneNumberIsNull() {
        // Given
        ReflectionTestUtils.setField(smsProvider, "enabled", true);

        // When
        boolean result = smsProvider.send(null, "Test message");

        // Then
        assertFalse(result);
    }

    @Test
    @DisplayName("Should return false when phone number is empty")
    void shouldReturnFalseWhenPhoneNumberIsEmpty() {
        // Given
        ReflectionTestUtils.setField(smsProvider, "enabled", true);

        // When
        boolean result = smsProvider.send("", "Test message");

        // Then
        assertFalse(result);
    }

    @Test
    @DisplayName("Should return false when message is null")
    void shouldReturnFalseWhenMessageIsNull() {
        // Given
        ReflectionTestUtils.setField(smsProvider, "enabled", true);

        // When
        boolean result = smsProvider.send("+48123456789", null);

        // Then
        assertFalse(result);
    }

    @Test
    @DisplayName("Should return false when message is empty")
    void shouldReturnFalseWhenMessageIsEmpty() {
        // Given
        ReflectionTestUtils.setField(smsProvider, "enabled", true);

        // When
        boolean result = smsProvider.send("+48123456789", "");

        // Then
        assertFalse(result);
    }

    @Test
    @DisplayName("Should return true when provider is enabled and configured")
    void shouldReturnTrueWhenEnabled() {
        // Given
        ReflectionTestUtils.setField(smsProvider, "enabled", true);
        ReflectionTestUtils.setField(smsProvider, "accountSid", "test_sid");
        ReflectionTestUtils.setField(smsProvider, "authToken", "test_token");
        ReflectionTestUtils.setField(smsProvider, "fromNumber", "+48000000000");

        // When
        boolean result = smsProvider.send("+48123456789", "Test message");

        // Then
        assertTrue(result);
    }

    @Test
    @DisplayName("Should send with custom sender ID")
    void shouldSendWithCustomSenderId() {
        // Given
        ReflectionTestUtils.setField(smsProvider, "enabled", true);
        ReflectionTestUtils.setField(smsProvider, "fromNumber", "+48000000000");

        // When
        boolean result = smsProvider.send("+48123456789", "Test message", "CUSTOM");

        // Then
        assertTrue(result);
    }

    @Test
    @DisplayName("Should return false for isAvailable when disabled")
    void shouldReturnFalseForIsAvailableWhenDisabled() {
        // Given
        ReflectionTestUtils.setField(smsProvider, "enabled", false);

        // When
        boolean result = smsProvider.isAvailable();

        // Then
        assertFalse(result);
    }

    @Test
    @DisplayName("Should return false for isAvailable when accountSid is missing")
    void shouldReturnFalseForIsAvailableWhenAccountSidMissing() {
        // Given
        ReflectionTestUtils.setField(smsProvider, "enabled", true);
        ReflectionTestUtils.setField(smsProvider, "authToken", "test_token");
        ReflectionTestUtils.setField(smsProvider, "fromNumber", "+48000000000");

        // When
        boolean result = smsProvider.isAvailable();

        // Then
        assertFalse(result);
    }

    @Test
    @DisplayName("Should return true for isAvailable when fully configured")
    void shouldReturnTrueForIsAvailableWhenConfigured() {
        // Given
        ReflectionTestUtils.setField(smsProvider, "enabled", true);
        ReflectionTestUtils.setField(smsProvider, "accountSid", "test_sid");
        ReflectionTestUtils.setField(smsProvider, "authToken", "test_token");
        ReflectionTestUtils.setField(smsProvider, "fromNumber", "+48000000000");

        // When
        boolean result = smsProvider.isAvailable();

        // Then
        assertTrue(result);
    }

    @Test
    @DisplayName("Should return correct provider name")
    void shouldReturnCorrectProviderName() {
        // When
        String result = smsProvider.getProviderName();

        // Then
        assertEquals("Twilio", result);
    }
}
