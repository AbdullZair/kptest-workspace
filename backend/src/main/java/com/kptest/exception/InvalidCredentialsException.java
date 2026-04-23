package com.kptest.exception;

/**
 * Thrown when authentication credentials are invalid.
 */
public class InvalidCredentialsException extends DomainException {
    
    public InvalidCredentialsException() {
        super("INVALID_CREDENTIALS", "Invalid email/phone or password");
    }
    
    public InvalidCredentialsException(String message) {
        super("INVALID_CREDENTIALS", message);
    }
}
