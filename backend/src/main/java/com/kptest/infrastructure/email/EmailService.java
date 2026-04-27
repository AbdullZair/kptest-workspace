package com.kptest.infrastructure.email;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

/**
 * Email Service for sending email notifications.
 * Implements funk.42: Email notifications as alternative channel.
 */
@Slf4j
@Service
@RequiredArgsConstructor
public class EmailService {

    private final EmailProvider emailProvider;
    
    private static final DateTimeFormatter DATE_FORMATTER = DateTimeFormatter.ofPattern("dd.MM.yyyy HH:mm");

    /**
     * Send welcome email to new patient.
     * 
     * @param to Recipient email address
     * @param patientName Patient name
     * @return true if sent successfully
     */
    public boolean sendWelcomeEmail(String to, String patientName) {
        String subject = "Witaj w systemie KPTEST - Aktywacja konta";
        
        String body = String.format(
            "Szanowny/a %s,\n\n" +
            "Witamy w systemie KPTEST wspierającym terapię pacjentów po implantacji ślimakowej.\n\n" +
            "Twoje konto zostało aktywowane. Możesz teraz zalogować się do aplikacji mobilnej.\n\n" +
            "W przypadku pytań skontaktuj się z koordynatorem terapii.\n\n" +
            "Pozdrawiamy,\n" +
            "Zespół KPTEST",
            patientName
        );
        
        log.info("Sending welcome email to: {}", to);
        return emailProvider.send(to, subject, body);
    }

    /**
     * Send appointment reminder email.
     * Implements ww.42: Configuration of reminders for patients.
     * 
     * @param to Patient email address
     * @param patientName Patient name
     * @param appointmentDate Appointment date and time
     * @param appointmentType Type of appointment
     * @param location Appointment location
     * @param therapistName Therapist/coordinator name
     * @return true if sent successfully
     */
    public boolean sendAppointmentReminder(String to, String patientName, LocalDateTime appointmentDate,
                                           String appointmentType, String location, String therapistName) {
        String subject = "PRZYPOMNIENIE: Nadchodząca wizyta - " + appointmentType;
        
        String body = String.format(
            "Szanowny/a %s,\n\n" +
            "Przypominamy o nadchodzącej wizycie:\n\n" +
            "Typ: %s\n" +
            "Data: %s\n" +
            "Godzina: %s\n" +
            "Lokalizacja: %s\n" +
            "Prowadzący: %s\n\n" +
            "Jeśli nie możesz dotrzeć na wizytę, prosimy o wcześniejszy kontakt.\n\n" +
            "Pozdrawiamy,\n" +
            "Zespół KPTEST",
            patientName,
            appointmentType,
            appointmentDate.format(DATE_FORMATTER),
            appointmentDate.toLocalTime().toString().substring(0, 5),
            location,
            therapistName
        );
        
        log.info("Sending appointment reminder email to: {}", to);
        return emailProvider.send(to, subject, body);
    }

    /**
     * Send new message notification email.
     * Implements ww.34: Notify staff about new messages from patients.
     * 
     * @param to Staff email address
     * @param staffName Staff member name
     * @param senderName Message sender name
     * @param messagePreview Message preview text
     * @param threadUrl Direct link to conversation thread
     * @return true if sent successfully
     */
    public boolean sendNewMessageNotification(String to, String staffName, String senderName,
                                              String messagePreview, String threadUrl) {
        String subject = "NOWA WIADOMOŚĆ od: " + senderName;
        
        String body = String.format(
            "Szanowny/a %s,\n\n" +
            "Otrzymano nową wiadomość od: %s\n\n" +
            "Treść: %s\n\n" +
            "Aby przeczytać pełną wiadomość, kliknij w poniższy link:\n" +
            "%s\n\n" +
            "Pozdrawiamy,\n" +
            "System KPTEST",
            staffName,
            senderName,
            truncate(messagePreview, 100),
            threadUrl
        );
        
        log.info("Sending new message notification email to: {}", to);
        return emailProvider.send(to, subject, body);
    }

    /**
     * Send project assignment notification email.
     * Implements ww.25: Notify patient about project assignment.
     * 
     * @param to Patient email address
     * @param patientName Patient name
     * @param projectName Project name
     * @param coordinatorName Coordinator name
     * @return true if sent successfully
     */
    public boolean sendProjectAssignmentNotification(String to, String patientName, 
                                                      String projectName, String coordinatorName) {
        String subject = "Przypisanie do projektu terapeutycznego: " + projectName;
        
        String body = String.format(
            "Szanowny/a %s,\n\n" +
            "Zostaliśmy przypisany/a do nowego projektu terapeutycznego:\n\n" +
            "Nazwa projektu: %s\n" +
            "Koordynator: %s\n\n" +
            "Zaloguj się do aplikacji mobilnej, aby zobaczyć szczegóły projektu i dostępne materiały edukacyjne.\n\n" +
            "Pozdrawiamy,\n" +
            "Zespół KPTEST",
            patientName,
            projectName,
            coordinatorName
        );
        
        log.info("Sending project assignment email to: {}", to);
        return emailProvider.send(to, subject, body);
    }

    /**
     * Send password reset email.
     * 
     * @param to User email address
     * @param userName User name
     * @param resetLink Password reset link with token
     * @return true if sent successfully
     */
    public boolean sendPasswordResetEmail(String to, String userName, String resetLink) {
        String subject = "Reset hasła - KPTEST";
        
        String body = String.format(
            "Szanowny/a %s,\n\n" +
            "Otrzymaliśmy prośbę o zresetowanie hasła do Twojego konta.\n\n" +
            "Kliknij w poniższy link, aby ustawić nowe hasło:\n" +
            "%s\n\n" +
            "Link jest ważny przez 1 godzinę.\n\n" +
            "Jeśli nie zlecałeś/aś resetu hasła, zignoruj tę wiadomość.\n\n" +
            "Pozdrawiamy,\n" +
            "System KPTEST",
            userName,
            resetLink
        );
        
        log.info("Sending password reset email to: {}", to);
        return emailProvider.send(to, subject, body);
    }

    /**
     * Send low adherence alert to staff.
     * Implements ww.52: Identify patients with low adherence.
     * 
     * @param to Staff email address
     * @param staffName Staff member name
     * @param patientName Patient name
     * @param complianceRate Current compliance rate percentage
     * @param threshold Threshold that triggered alert
     * @return true if sent successfully
     */
    public boolean sendLowAdherenceAlert(String to, String staffName, String patientName,
                                         double complianceRate, double threshold) {
        String subject = "ALERT: Niska adherencja pacjenta - " + patientName;
        
        String body = String.format(
            "Szanowny/a %s,\n\n" +
            "Wykryto niską adherencję pacjenta:\n\n" +
            "Pacjent: %s\n" +
            "Aktualny compliance: %.1f%%\n" +
            "Próg alertu: %.1f%%\n\n" +
            "Zalecana interwencja:\n" +
            "- Kontakt telefoniczny z pacjentem\n" +
            "- Weryfikacja przyczyn niskiej adherencji\n" +
            "- Dostosowanie planu terapeutycznego w razie potrzeby\n\n" +
            "Pozdrawiamy,\n" +
            "System KPTEST",
            staffName,
            patientName,
            complianceRate,
            threshold
        );
        
        log.info("Sending low adherence alert email to: {}", to);
        return emailProvider.send(to, subject, body);
    }

    /**
     * Send new material notification email.
     * Implements ww.34: Notify patients about new materials.
     * 
     * @param to Patient email address
     * @param patientName Patient name
     * @param materialTitle Material title
     * @param projectName Project name
     * @return true if sent successfully
     */
    public boolean sendNewMaterialNotification(String to, String patientName, 
                                                String materialTitle, String projectName) {
        String subject = "NOWY MATERIAŁ edukacyjny: " + materialTitle;
        
        String body = String.format(
            "Szanowny/a %s,\n\n" +
            "Dodano nowy materiał edukacyjny w ramach projektu:\n\n" +
            "Projekt: %s\n" +
            "Tytuł: %s\n\n" +
            "Zaloguj się do aplikacji mobilnej, aby przeczytać materiał.\n\n" +
            "Pozdrawiamy,\n" +
            "Zespół KPTEST",
            patientName,
            projectName,
            materialTitle
        );
        
        log.info("Sending new material notification email to: {}", to);
        return emailProvider.send(to, subject, body);
    }

    /**
     * Send bulk email to multiple recipients.
     * 
     * @param to List of recipient email addresses
     * @param subject Email subject
     * @param body Email body content
     * @return Number of successfully sent emails
     */
    public int sendBulk(List<String> to, String subject, String body) {
        return emailProvider.sendBulk(to, subject, body);
    }

    /**
     * Send email with HTML template.
     * 
     * @param to Recipient email address
     * @param subject Email subject
     * @param htmlContent HTML content
     * @return true if sent successfully
     */
    public boolean sendHtml(String to, String subject, String htmlContent) {
        log.info("Sending HTML email to: {}", to);
        return emailProvider.sendHtml(to, subject, htmlContent);
    }

    /**
     * Send email with template and variables.
     * 
     * @param to Recipient email address
     * @param templateName Template identifier
     * @param variables Template variables
     * @return true if sent successfully
     */
    public boolean sendTemplate(String to, String templateName, Map<String, Object> variables) {
        log.info("Sending template email to: {}, template: {}", to, templateName);
        return emailProvider.sendTemplate(to, templateName, variables);
    }

    /**
     * Check if email service is available.
     * 
     * @return true if email provider is configured and ready
     */
    public boolean isAvailable() {
        return emailProvider.isAvailable();
    }

    /**
     * Get email provider name for diagnostics.
     * 
     * @return Provider name
     */
    public String getProviderName() {
        return emailProvider.getProviderName();
    }

    /**
     * Truncate string to max length with ellipsis.
     */
    private String truncate(String text, int maxLength) {
        if (text == null) {
            return "";
        }
        return text.length() <= maxLength ? text : text.substring(0, maxLength) + "...";
    }
}
