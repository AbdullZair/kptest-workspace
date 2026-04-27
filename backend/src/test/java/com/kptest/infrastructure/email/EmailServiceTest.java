package com.kptest.infrastructure.email;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.*;

/**
 * Unit tests for EmailService.
 * Tests email notification functionality (funk.42).
 */
@ExtendWith(MockitoExtension.class)
@DisplayName("EmailService Tests")
class EmailServiceTest {

    @Mock
    private EmailProvider emailProvider;

    private EmailService emailService;

    @BeforeEach
    void setUp() {
        emailService = new EmailService(emailProvider);
    }

    @Test
    @DisplayName("Should send welcome email successfully")
    void shouldSendWelcomeEmailSuccessfully() {
        // Given
        String to = "patient@example.com";
        String patientName = "Jan Kowalski";
        when(emailProvider.send(anyString(), anyString(), anyString())).thenReturn(true);

        // When
        boolean result = emailService.sendWelcomeEmail(to, patientName);

        // Then
        assertTrue(result);
        verify(emailProvider, times(1)).send(eq(to), contains("Witaj"), contains(patientName));
    }

    @Test
    @DisplayName("Should send appointment reminder email")
    void shouldSendAppointmentReminder() {
        // Given
        String to = "patient@example.com";
        when(emailProvider.send(anyString(), anyString(), anyString())).thenReturn(true);

        // When
        boolean result = emailService.sendAppointmentReminder(
            to,
            "Jan Kowalski",
            LocalDateTime.of(2026, 4, 25, 10, 30),
            "Wizyta kontrolna",
            "Gabinet 101",
            "Dr Nowak"
        );

        // Then
        assertTrue(result);
        verify(emailProvider, times(1)).send(eq(to), contains("PRZYPOMNIENIE"), contains("Wizyta kontrolna"));
    }

    @Test
    @DisplayName("Should send new message notification to staff")
    void shouldSendNewMessageNotification() {
        // Given
        String to = "staff@kptest.com";
        when(emailProvider.send(anyString(), anyString(), anyString())).thenReturn(true);

        // When
        boolean result = emailService.sendNewMessageNotification(
            to,
            "Dr Nowak",
            "Jan Kowalski",
            "Pilna sprawa dotycząca terapii",
            "https://kptest.com/messages/123"
        );

        // Then
        assertTrue(result);
        verify(emailProvider, times(1)).send(eq(to), contains("NOWA WIADOMOŚĆ"), contains("Jan Kowalski"));
    }

    @Test
    @DisplayName("Should send project assignment notification email")
    void shouldSendProjectAssignmentNotification() {
        // Given
        String to = "patient@example.com";
        when(emailProvider.send(anyString(), anyString(), anyString())).thenReturn(true);

        // When
        boolean result = emailService.sendProjectAssignmentNotification(
            to,
            "Jan Kowalski",
            "Terapia Słuchowa 2026",
            "Mgr Nowak"
        );

        // Then
        assertTrue(result);
        verify(emailProvider, times(1)).send(eq(to), contains("Przypisanie do projektu"), contains("Terapia Słuchowa"));
    }

    @Test
    @DisplayName("Should send password reset email")
    void shouldSendPasswordResetEmail() {
        // Given
        String to = "user@example.com";
        String resetLink = "https://kptest.com/reset/abc123";
        when(emailProvider.send(anyString(), anyString(), anyString())).thenReturn(true);

        // When
        boolean result = emailService.sendPasswordResetEmail(to, "Jan Kowalski", resetLink);

        // Then
        assertTrue(result);
        verify(emailProvider, times(1)).send(eq(to), contains("Reset hasła"), contains(resetLink));
    }

    @Test
    @DisplayName("Should send low adherence alert to staff")
    void shouldSendLowAdherenceAlert() {
        // Given
        String to = "staff@kptest.com";
        when(emailProvider.send(anyString(), anyString(), anyString())).thenReturn(true);

        // When
        boolean result = emailService.sendLowAdherenceAlert(
            to,
            "Dr Nowak",
            "Jan Kowalski",
            45.5,
            60.0
        );

        // Then
        assertTrue(result);
        verify(emailProvider, times(1)).send(eq(to), eq("ALERT: Niska adherencja pacjenta - Jan Kowalski"), anyString());
    }

    @Test
    @DisplayName("Should send new material notification email")
    void shouldSendNewMaterialNotification() {
        // Given
        String to = "patient@example.com";
        when(emailProvider.send(anyString(), anyString(), anyString())).thenReturn(true);

        // When
        boolean result = emailService.sendNewMaterialNotification(
            to,
            "Jan Kowalski",
            "Ćwiczenia słuchowe - etap 1",
            "Terapia Słuchowa 2026"
        );

        // Then
        assertTrue(result);
        verify(emailProvider, times(1)).send(eq(to), contains("NOWY MATERIAŁ"), contains("Ćwiczenia słuchowe"));
    }

    @Test
    @DisplayName("Should send bulk email to multiple recipients")
    void shouldSendBulkEmail() {
        // Given
        List<String> recipients = List.of("a@example.com", "b@example.com", "c@example.com");
        when(emailProvider.sendBulk(anyList(), anyString(), anyString())).thenReturn(3);

        // When
        int result = emailService.sendBulk(recipients, "Subject", "Body");

        // Then
        assertEquals(3, result);
        verify(emailProvider, times(1)).sendBulk(recipients, "Subject", "Body");
    }

    @Test
    @DisplayName("Should send HTML email")
    void shouldSendHtmlEmail() {
        // Given
        String to = "patient@example.com";
        String htmlContent = "<html><body><h1>Hello</h1></body></html>";
        when(emailProvider.sendHtml(to, "Subject", htmlContent)).thenReturn(true);

        // When
        boolean result = emailService.sendHtml(to, "Subject", htmlContent);

        // Then
        assertTrue(result);
        verify(emailProvider, times(1)).sendHtml(to, "Subject", htmlContent);
    }

    @Test
    @DisplayName("Should send template email with variables")
    void shouldSendTemplateEmail() {
        // Given
        String to = "patient@example.com";
        String templateName = "welcome_template";
        Map<String, Object> variables = Map.of("name", "Jan", "project", "Therapy");
        when(emailProvider.sendTemplate(to, templateName, variables)).thenReturn(true);

        // When
        boolean result = emailService.sendTemplate(to, templateName, variables);

        // Then
        assertTrue(result);
        verify(emailProvider, times(1)).sendTemplate(to, templateName, variables);
    }

    @Test
    @DisplayName("Should check if email service is available")
    void shouldCheckIfServiceIsAvailable() {
        // Given
        when(emailProvider.isAvailable()).thenReturn(true);

        // When
        boolean result = emailService.isAvailable();

        // Then
        assertTrue(result);
        verify(emailProvider, times(1)).isAvailable();
    }

    @Test
    @DisplayName("Should return provider name")
    void shouldGetProviderName() {
        // Given
        when(emailProvider.getProviderName()).thenReturn("SendGrid");

        // When
        String result = emailService.getProviderName();

        // Then
        assertEquals("SendGrid", result);
    }

    @Test
    @DisplayName("Should handle email send failure gracefully")
    void shouldHandleEmailSendFailure() {
        // Given
        when(emailProvider.send(anyString(), anyString(), anyString())).thenReturn(false);

        // When
        boolean result = emailService.sendWelcomeEmail("patient@example.com", "Jan Kowalski");

        // Then
        assertFalse(result);
    }
}
