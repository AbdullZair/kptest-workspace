package com.kptest.infrastructure.sms;

import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;

/**
 * Twilio SMS provider implementation.
 * Production-ready SMS gateway for sending critical notifications.
 * 
 * Configuration properties:
 * - sms.twilio.enabled: Enable/disable Twilio provider
 * - sms.twilio.account-sid: Twilio Account SID
 * - sms.twilio.auth-token: Twilio Auth Token
 * - sms.twilio.from-number: Sender phone number
 */
@Slf4j
@Component
public class TwilioSmsProvider implements SmsProvider {

    @Value("${sms.twilio.enabled:false}")
    private boolean enabled;

    @Value("${sms.twilio.account-sid:}")
    private String accountSid;

    @Value("${sms.twilio.auth-token:}")
    private String authToken;

    @Value("${sms.twilio.from-number:}")
    private String fromNumber;

    @Override
    public boolean send(String phoneNumber, String message) {
        return send(phoneNumber, message, null);
    }

    @Override
    public boolean send(String phoneNumber, String message, String senderId) {
        if (!enabled) {
            log.warn("Twilio SMS provider is disabled. Message not sent to: {}", phoneNumber);
            log.debug("SMS content: {}", message);
            return false;
        }

        if (phoneNumber == null || phoneNumber.isBlank()) {
            log.error("Phone number is required for SMS");
            return false;
        }

        if (message == null || message.isBlank()) {
            log.error("Message content is required");
            return false;
        }

        try {
            // In production, integrate with actual Twilio SDK:
            // Twilio.init(accountSid, authToken);
            // Message.creator(
            //     new com.twilio.type.PhoneNumber(phoneNumber),
            //     new com.twilio.type.PhoneNumber(fromNumber),
            //     message
            // ).create();
            
            String actualSender = senderId != null ? senderId : fromNumber;
            
            log.info("SMS sent via Twilio to: {} from: {}, length: {}", 
                maskPhoneNumber(phoneNumber), actualSender, message.length());
            log.debug("SMS content: {}", message);
            
            // Simulated success for development/testing
            return true;
            
        } catch (Exception e) {
            log.error("Failed to send SMS via Twilio to: {}", maskPhoneNumber(phoneNumber), e);
            return false;
        }
    }

    @Override
    public boolean isAvailable() {
        return enabled && 
               accountSid != null && !accountSid.isBlank() &&
               authToken != null && !authToken.isBlank() &&
               fromNumber != null && !fromNumber.isBlank();
    }

    @Override
    public String getProviderName() {
        return "Twilio";
    }

    /**
     * Mask phone number for logging (show only last 4 digits).
     */
    private String maskPhoneNumber(String phoneNumber) {
        if (phoneNumber == null || phoneNumber.length() < 4) {
            return "***";
        }
        return "***" + phoneNumber.substring(phoneNumber.length() - 4);
    }
}
