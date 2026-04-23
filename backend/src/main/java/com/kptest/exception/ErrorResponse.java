package com.kptest.exception;

import com.fasterxml.jackson.annotation.JsonInclude;
import com.fasterxml.jackson.annotation.JsonProperty;
import org.springframework.http.HttpStatus;

import java.time.Instant;
import java.util.Collections;
import java.util.List;

/**
 * Standard error response structure.
 */
@JsonInclude(JsonInclude.Include.NON_NULL)
public record ErrorResponse(
    @JsonProperty("error_code")
    String errorCode,
    
    String message,
    
    HttpStatus status,
    
    List<FieldError> details,
    
    @JsonProperty("timestamp")
    Instant timestamp,
    
    @JsonProperty("path")
    String path
) {
    
    public record FieldError(
        String field,
        String message,
        @JsonProperty("rejected_value")
        Object rejectedValue
    ) {}
    
    public static ErrorResponse of(String errorCode, String message, HttpStatus status, String path) {
        return new ErrorResponse(errorCode, message, status, null, Instant.now(), path);
    }
    
    public static ErrorResponse of(String errorCode, String message, HttpStatus status, 
                                   List<FieldError> details, String path) {
        return new ErrorResponse(errorCode, message, status, details, Instant.now(), path);
    }
    
    public static ErrorResponse validationError(List<FieldError> details, String path) {
        return new ErrorResponse("VALIDATION_ERROR", "Validation failed", HttpStatus.BAD_REQUEST, 
                                details, Instant.now(), path);
    }
    
    public static ErrorResponse notFound(String message, String path) {
        return new ErrorResponse("RESOURCE_NOT_FOUND", message, HttpStatus.NOT_FOUND, 
                                Collections.emptyList(), Instant.now(), path);
    }
    
    public static ErrorResponse unauthorized(String message, String path) {
        return new ErrorResponse("UNAUTHORIZED", message, HttpStatus.UNAUTHORIZED, 
                                Collections.emptyList(), Instant.now(), path);
    }
    
    public static ErrorResponse internalError(String message, String path) {
        return new ErrorResponse("INTERNAL_ERROR", message, HttpStatus.INTERNAL_SERVER_ERROR, 
                                Collections.emptyList(), Instant.now(), path);
    }
}
