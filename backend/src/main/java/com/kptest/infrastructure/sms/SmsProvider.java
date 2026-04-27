package com.kptest.infrastructure.sms;

/**
 * Interface for SMS provider implementations.
 * Allows switching between different SMS gateways (Twilio, SMSAPI, etc.)
 */
public interface SmsProvider {
    
    /**
     * Send SMS message to a phone number.
     * 
     * @param phoneNumber Recipient phone number in international format (e.g., +48123456789)
     * @param message Message content (max 160 characters for single SMS)
     * @return true if sent successfully, false otherwise
     */
    boolean send(String phoneNumber, String message);
    
    /**
     * Send SMS with sender ID.
     * 
     * @param phoneNumber Recipient phone number
     * @param message Message content
     * @param senderId Sender ID (alphanumeric or phone number)
     * @return true if sent successfully, false otherwise
     */
    boolean send(String phoneNumber, String message, String senderId);
    
    /**
     * Check if provider is available and configured.
     * 
     * @return true if provider is ready to send messages
     */
    boolean isAvailable();
    
    /**
     * Get provider name for logging purposes.
     * 
     * @return Provider name
     */
    String getProviderName();
}
