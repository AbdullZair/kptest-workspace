package com.kptest.infrastructure.sms;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.*;

/**
 * Unit tests for SmsService.
 * Tests SMS notification functionality (funk.43).
 */
@ExtendWith(MockitoExtension.class)
@DisplayName("SmsService Tests")
class SmsServiceTest {

    @Mock
    private SmsProvider smsProvider;

    private SmsService smsService;

    @BeforeEach
    void setUp() {
        smsService = new SmsService(smsProvider);
    }

    @Test
    @DisplayName("Should send critical reminder SMS successfully")
    void shouldSendCriticalReminderSuccessfully() {
        // Given
        String phoneNumber = "+48123456789";
        String message = "Critical reminder message";
        when(smsProvider.send(phoneNumber, message)).thenReturn(true);

        // When
        boolean result = smsService.sendCriticalReminder(phoneNumber, message);

        // Then
        assertTrue(result);
        verify(smsProvider, times(1)).send(phoneNumber, message);
    }

    @Test
    @DisplayName("Should handle SMS send failure gracefully")
    void shouldHandleSmsSendFailure() {
        // Given
        String phoneNumber = "+48123456789";
        String message = "Critical reminder message";
        when(smsProvider.send(phoneNumber, message)).thenReturn(false);

        // When
        boolean result = smsService.sendCriticalReminder(phoneNumber, message);

        // Then
        assertFalse(result);
        verify(smsProvider, times(1)).send(phoneNumber, message);
    }

    @Test
    @DisplayName("Should send appointment reminder with formatted message")
    void shouldSendAppointmentReminder() {
        // Given
        String phoneNumber = "+48123456789";
        when(smsProvider.send(anyString(), anyString(), anyString())).thenReturn(true);

        // When
        boolean result = smsService.sendAppointmentReminder(
            phoneNumber,
            java.time.LocalDateTime.of(2026, 4, 25, 10, 30),
            "Wizyta kontrolna",
            "Gabinet 101"
        );

        // Then
        assertTrue(result);
        verify(smsProvider, times(1)).send(eq(phoneNumber), contains("Wizyta kontrolna"), eq("KPTEST"));
    }

    @Test
    @DisplayName("Should send verification code SMS")
    void shouldSendVerificationCode() {
        // Given
        String phoneNumber = "+48123456789";
        String code = "123456";
        when(smsProvider.send(anyString(), anyString(), anyString())).thenReturn(true);

        // When
        boolean result = smsService.sendVerificationCode(phoneNumber, code);

        // Then
        assertTrue(result);
        verify(smsProvider, times(1)).send(eq(phoneNumber), contains(code), eq("KPTEST"));
    }

    @Test
    @DisplayName("Should send password reset confirmation SMS")
    void shouldSendPasswordResetConfirmation() {
        // Given
        String phoneNumber = "+48123456789";
        when(smsProvider.send(anyString(), anyString(), anyString())).thenReturn(true);

        // When
        boolean result = smsService.sendPasswordResetConfirmation(phoneNumber);

        // Then
        assertTrue(result);
        verify(smsProvider, times(1)).send(eq(phoneNumber), contains("Haslo zostalo zresetowane"), eq("KPTEST"));
    }

    @Test
    @DisplayName("Should send project assignment notification SMS")
    void shouldSendProjectAssignmentNotification() {
        // Given
        String phoneNumber = "+48123456789";
        String projectName = "Terapia Słuchowa 2026";
        when(smsProvider.send(anyString(), anyString(), anyString())).thenReturn(true);

        // When
        boolean result = smsService.sendProjectAssignmentNotification(phoneNumber, projectName);

        // Then
        assertTrue(result);
        verify(smsProvider, times(1)).send(eq(phoneNumber), contains(projectName), eq("KPTEST"));
    }

    @Test
    @DisplayName("Should send bulk SMS to multiple recipients")
    void shouldSendBulkSms() {
        // Given
        java.util.List<String> phoneNumbers = java.util.List.of(
            "+48123456789",
            "+48987654321",
            "+48555666777"
        );
        String message = "Bulk message";
        when(smsProvider.send(anyString(), eq(message))).thenReturn(true);

        // When
        int successCount = smsService.sendBulk(phoneNumbers, message);

        // Then
        assertEquals(3, successCount);
        verify(smsProvider, times(3)).send(anyString(), eq(message));
    }

    @Test
    @DisplayName("Should return correct success count for partial bulk send")
    void shouldReturnPartialSuccessCountForBulkSms() {
        // Given
        java.util.List<String> phoneNumbers = java.util.List.of(
            "+48123456789",
            "+48987654321",
            "+48555666777"
        );
        String message = "Bulk message";
        when(smsProvider.send(phoneNumbers.get(0), message)).thenReturn(true);
        when(smsProvider.send(phoneNumbers.get(1), message)).thenReturn(false);
        when(smsProvider.send(phoneNumbers.get(2), message)).thenReturn(true);

        // When
        int successCount = smsService.sendBulk(phoneNumbers, message);

        // Then
        assertEquals(2, successCount);
    }

    @Test
    @DisplayName("Should check if SMS service is available")
    void shouldCheckIfServiceIsAvailable() {
        // Given
        when(smsProvider.isAvailable()).thenReturn(true);

        // When
        boolean result = smsService.isAvailable();

        // Then
        assertTrue(result);
        verify(smsProvider, times(1)).isAvailable();
    }

    @Test
    @DisplayName("Should return provider name")
    void shouldGetProviderName() {
        // Given
        when(smsProvider.getProviderName()).thenReturn("Twilio");

        // When
        String result = smsService.getProviderName();

        // Then
        assertEquals("Twilio", result);
    }

    @Test
    @DisplayName("Should handle null phone number gracefully")
    void shouldHandleNullPhoneNumber() {
        // Given
        String message = "Test message";

        // When
        boolean result = smsService.sendCriticalReminder(null, message);

        // Then
        assertFalse(result);
    }

    @Test
    @DisplayName("Should handle empty phone number gracefully")
    void shouldHandleEmptyPhoneNumber() {
        // Given
        String phoneNumber = "";
        String message = "Test message";

        // When
        boolean result = smsService.sendCriticalReminder(phoneNumber, message);

        // Then
        assertFalse(result);
    }
}
