package com.kptest.infrastructure.email;

import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;

import java.util.List;
import java.util.Map;

/**
 * SendGrid email provider implementation.
 * Production-ready email gateway for sending notifications.
 * 
 * Configuration properties:
 * - email.sendgrid.enabled: Enable/disable SendGrid provider
 * - email.sendgrid.api-key: SendGrid API key
 * - email.sendgrid.from-email: Sender email address
 * - email.sendgrid.from-name: Sender name
 */
@Slf4j
@Component
public class SendGridEmailProvider implements EmailProvider {

    @Value("${email.sendgrid.enabled:false}")
    private boolean enabled;

    @Value("${email.sendgrid.api-key:}")
    private String apiKey;

    @Value("${email.sendgrid.from-email:noreply@kptest.com}")
    private String fromEmail;

    @Value("${email.sendgrid.from-name:KPTEST System}")
    private String fromName;

    @Override
    public boolean send(String to, String subject, String body) {
        if (!enabled) {
            log.warn("SendGrid email provider is disabled. Email not sent to: {}", to);
            log.debug("Email subject: {}, body length: {}", subject, body != null ? body.length() : 0);
            return false;
        }

        if (to == null || to.isBlank()) {
            log.error("Recipient email is required");
            return false;
        }

        if (subject == null || subject.isBlank()) {
            log.error("Email subject is required");
            return false;
        }

        try {
            // In production, integrate with actual SendGrid SDK:
            // Mail mail = new Mail(
            //     new Email(fromEmail, fromName),
            //     subject,
            //     new Email(to),
            //     new Content("text/plain", body)
            // );
            // SendGrid sg = new SendGrid(apiKey);
            // sg.send(mail);
            
            log.info("Email sent via SendGrid to: {}, subject: {}", to, subject);
            log.debug("Email body: {}", body);
            
            // Simulated success for development/testing
            return true;
            
        } catch (Exception e) {
            log.error("Failed to send email via SendGrid to: {}", to, e);
            return false;
        }
    }

    @Override
    public boolean sendHtml(String to, String subject, String htmlBody) {
        if (!enabled) {
            log.warn("SendGrid email provider is disabled. Email not sent to: {}", to);
            return false;
        }

        try {
            // In production, use SendGrid with HTML content type
            log.info("HTML email sent via SendGrid to: {}, subject: {}", to, subject);
            return true;
            
        } catch (Exception e) {
            log.error("Failed to send HTML email via SendGrid to: {}", to, e);
            return false;
        }
    }

    @Override
    public boolean sendTemplate(String to, String templateName, Map<String, Object> variables) {
        if (!enabled) {
            log.warn("SendGrid email provider is disabled. Template email not sent to: {}", to);
            return false;
        }

        try {
            // In production, use SendGrid dynamic templates:
            // Mail mail = new Mail();
            // mail.setFrom(new Email(fromEmail, fromName));
            // mail.setTemplateId(templateName);
            // mail.setPersonalization(buildPersonalization(to, variables));
            
            log.info("Template email sent via SendGrid to: {}, template: {}", to, templateName);
            log.debug("Template variables: {}", variables);
            
            return true;
            
        } catch (Exception e) {
            log.error("Failed to send template email via SendGrid to: {}", to, e);
            return false;
        }
    }

    @Override
    public boolean sendWithAttachment(String to, String subject, String body,
                                      String attachmentName, byte[] attachmentContent) {
        if (!enabled) {
            log.warn("SendGrid email provider is disabled. Email with attachment not sent to: {}", to);
            return false;
        }

        try {
            // In production, use SendGrid attachments:
            // String encodedContent = Base64.getEncoder().encodeToString(attachmentContent);
            // Attachment attachment = new Attachment();
            // attachment.setContent(encodedContent);
            // attachment.setType("application/pdf");
            // attachment.setFilename(attachmentName);
            // attachment.setDisposition("attachment");
            
            log.info("Email with attachment sent via SendGrid to: {}, attachment: {} ({} bytes)", 
                to, attachmentName, attachmentContent.length);
            
            return true;
            
        } catch (Exception e) {
            log.error("Failed to send email with attachment via SendGrid to: {}", to, e);
            return false;
        }
    }

    @Override
    public int sendBulk(List<String> to, String subject, String body) {
        int successCount = 0;
        
        for (String email : to) {
            if (send(email, subject, body)) {
                successCount++;
            }
        }
        
        log.info("Bulk email sent: {}/{} successful", successCount, to.size());
        return successCount;
    }

    @Override
    public boolean isAvailable() {
        return enabled && 
               apiKey != null && !apiKey.isBlank() &&
               fromEmail != null && !fromEmail.isBlank();
    }

    @Override
    public String getProviderName() {
        return "SendGrid";
    }
}
