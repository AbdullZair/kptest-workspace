package com.kptest.infrastructure.sms;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;

/**
 * SMS Service for sending text message notifications.
 * Implements funk.43: SMS notifications for critical reminders.
 */
@Slf4j
@Service
@RequiredArgsConstructor
public class SmsService {

    private final SmsProvider smsProvider;

    /**
     * Send critical reminder SMS to patient.
     * Used for appointment reminders, medication alerts, etc.
     * 
     * @param phoneNumber Recipient phone number
     * @param message Message content
     * @return true if sent successfully
     */
    public boolean sendCriticalReminder(String phoneNumber, String message) {
        log.info("Sending critical SMS reminder to: {}", maskPhoneNumber(phoneNumber));
        return smsProvider.send(phoneNumber, message);
    }

    /**
     * Send appointment reminder SMS.
     * 
     * @param phoneNumber Patient phone number
     * @param appointmentDate Appointment date and time
     * @param appointmentType Type of appointment
     * @param location Appointment location
     * @return true if sent successfully
     */
    public boolean sendAppointmentReminder(String phoneNumber, LocalDateTime appointmentDate, 
                                           String appointmentType, String location) {
        String message = String.format(
            "PRZYPOMNIENIE: Wizyta (%s) dnia %s o godz. %s. Lokalizacja: %s. W razie pytan tel: 123-456-789",
            appointmentType,
            appointmentDate.toLocalDate(),
            appointmentDate.toLocalTime().toString().substring(0, 5),
            location
        );
        
        log.info("Sending appointment reminder SMS to: {}", maskPhoneNumber(phoneNumber));
        return smsProvider.send(phoneNumber, message, "KPTEST");
    }

    /**
     * Send verification code SMS for 2FA or password reset.
     * 
     * @param phoneNumber Recipient phone number
     * @param code Verification code (4-6 digits)
     * @return true if sent successfully
     */
    public boolean sendVerificationCode(String phoneNumber, String code) {
        String message = String.format(
            "KPTEST: Twoj kod weryfikacyjny to: %s. Wazny przez 10 minut. Nie udostepniaj nikomu.",
            code
        );
        
        log.info("Sending verification code SMS to: {}", maskPhoneNumber(phoneNumber));
        return smsProvider.send(phoneNumber, message, "KPTEST");
    }

    /**
     * Send password reset confirmation SMS.
     * 
     * @param phoneNumber User phone number
     * @return true if sent successfully
     */
    public boolean sendPasswordResetConfirmation(String phoneNumber) {
        String message = "KPTEST: Haslo zostalo zresetowane. Jesli nie wykonales tej operacji, skontaktuj sie z administratorem.";
        
        log.info("Sending password reset confirmation SMS to: {}", maskPhoneNumber(phoneNumber));
        return smsProvider.send(phoneNumber, message, "KPTEST");
    }

    /**
     * Send project assignment notification SMS.
     * Implements ww.25: Notify patient about project assignment.
     * 
     * @param phoneNumber Patient phone number
     * @param projectName Name of the assigned project
     * @return true if sent successfully
     */
    public boolean sendProjectAssignmentNotification(String phoneNumber, String projectName) {
        String message = String.format(
            "KPTEST: Zostales przypisany do projektu terapeutycznego: %s. Zaloguj sie do aplikacji, aby zobaczyc szczegoly.",
            projectName
        );
        
        log.info("Sending project assignment SMS to: {}", maskPhoneNumber(phoneNumber));
        return smsProvider.send(phoneNumber, message, "KPTEST");
    }

    /**
     * Send bulk SMS to multiple recipients.
     * 
     * @param phoneNumbers List of phone numbers
     * @param message Message content
     * @return Number of successfully sent messages
     */
    public int sendBulk(List<String> phoneNumbers, String message) {
        int successCount = 0;
        
        for (String phoneNumber : phoneNumbers) {
            if (smsProvider.send(phoneNumber, message)) {
                successCount++;
            }
        }
        
        log.info("Bulk SMS sent: {}/{} successful", successCount, phoneNumbers.size());
        return successCount;
    }

    /**
     * Check if SMS service is available.
     * 
     * @return true if SMS provider is configured and ready
     */
    public boolean isAvailable() {
        return smsProvider.isAvailable();
    }

    /**
     * Get SMS provider name for diagnostics.
     * 
     * @return Provider name
     */
    public String getProviderName() {
        return smsProvider.getProviderName();
    }

    /**
     * Mask phone number for logging.
     */
    private String maskPhoneNumber(String phoneNumber) {
        if (phoneNumber == null || phoneNumber.length() < 4) {
            return "***";
        }
        return "***" + phoneNumber.substring(phoneNumber.length() - 4);
    }
}
