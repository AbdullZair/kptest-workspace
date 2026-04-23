package com.kptest.exception;

/**
 * Thrown when a business rule validation fails.
 */
public class BusinessRuleException extends DomainException {

    public BusinessRuleException(String rule) {
        super("BUSINESS_RULE_VIOLATION", "Business rule violation: %s".formatted(rule));
    }

    public BusinessRuleException(String message, Throwable cause) {
        super("BUSINESS_RULE_VIOLATION", message, cause);
    }
}
