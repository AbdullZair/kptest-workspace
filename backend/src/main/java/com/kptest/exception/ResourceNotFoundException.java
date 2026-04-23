package com.kptest.exception;

/**
 * Thrown when a requested resource is not found.
 */
public class ResourceNotFoundException extends DomainException {
    
    public ResourceNotFoundException(String resourceType, String identifier) {
        super("RESOURCE_NOT_FOUND", "%s not found with identifier: %s".formatted(resourceType, identifier));
    }
    
    public ResourceNotFoundException(String message) {
        super("RESOURCE_NOT_FOUND", message);
    }
}
