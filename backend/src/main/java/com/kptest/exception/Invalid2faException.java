package com.kptest.exception;

/**
 * Thrown when 2FA verification fails.
 */
public class Invalid2faException extends DomainException {
    
    public Invalid2faException() {
        super("INVALID_2FA_CODE", "Invalid 2FA verification code");
    }
    
    public Invalid2faException(String message) {
        super("INVALID_2FA_CODE", message);
    }
}
