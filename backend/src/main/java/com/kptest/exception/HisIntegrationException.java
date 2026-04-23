package com.kptest.exception;

/**
 * Thrown when HIS integration fails.
 */
public class HisIntegrationException extends DomainException {
    
    public HisIntegrationException(String message) {
        super("HIS_INTEGRATION_ERROR", message);
    }
    
    public HisIntegrationException(String message, Throwable cause) {
        super("HIS_INTEGRATION_ERROR", message, cause);
    }
}
