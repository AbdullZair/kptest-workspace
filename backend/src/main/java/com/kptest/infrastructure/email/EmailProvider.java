package com.kptest.infrastructure.email;

import java.util.Map;

/**
 * Interface for email provider implementations.
 * Allows switching between different email gateways (SendGrid, AWS SES, etc.)
 */
public interface EmailProvider {
    
    /**
     * Send email message.
     * 
     * @param to Recipient email address
     * @param subject Email subject
     * @param body Email body content (plain text)
     * @return true if sent successfully, false otherwise
     */
    boolean send(String to, String subject, String body);
    
    /**
     * Send HTML email message.
     * 
     * @param to Recipient email address
     * @param subject Email subject
     * @param htmlBody Email body content (HTML)
     * @return true if sent successfully, false otherwise
     */
    boolean sendHtml(String to, String subject, String htmlBody);
    
    /**
     * Send email with template and variables.
     * 
     * @param to Recipient email address
     * @param templateName Template identifier
     * @param variables Template variables
     * @return true if sent successfully, false otherwise
     */
    boolean sendTemplate(String to, String templateName, Map<String, Object> variables);
    
    /**
     * Send email with attachment.
     * 
     * @param to Recipient email address
     * @param subject Email subject
     * @param body Email body content
     * @param attachmentName Attachment file name
     * @param attachmentContent Attachment file content as byte array
     * @return true if sent successfully, false otherwise
     */
    boolean sendWithAttachment(String to, String subject, String body, 
                               String attachmentName, byte[] attachmentContent);
    
    /**
     * Send email to multiple recipients.
     * 
     * @param to List of recipient email addresses
     * @param subject Email subject
     * @param body Email body content
     * @return Number of successfully sent emails
     */
    int sendBulk(java.util.List<String> to, String subject, String body);
    
    /**
     * Check if provider is available and configured.
     * 
     * @return true if provider is ready to send emails
     */
    boolean isAvailable();
    
    /**
     * Get provider name for logging purposes.
     * 
     * @return Provider name
     */
    String getProviderName();
}
