package com.kptest.exception;

/**
 * Thrown when a resource with the same unique property already exists.
 */
public class DuplicateResourceException extends DomainException {
    
    public DuplicateResourceException(String resourceType, String field, String value) {
        super("DUPLICATE_RESOURCE", "%s with %s '%s' already exists".formatted(resourceType, field, value));
    }
    
    public DuplicateResourceException(String message) {
        super("DUPLICATE_RESOURCE", message);
    }
}
