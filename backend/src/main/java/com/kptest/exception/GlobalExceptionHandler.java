package com.kptest.exception;

import jakarta.validation.ConstraintViolationException;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.authentication.LockedException;
import org.springframework.validation.FieldError;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;
import org.springframework.web.servlet.resource.NoResourceFoundException;

import java.util.Collections;
import java.util.List;

/**
 * Global exception handler for all REST controllers.
 */
@Slf4j
@RestControllerAdvice
public class GlobalExceptionHandler {

    @ExceptionHandler(MethodArgumentNotValidException.class)
    public ResponseEntity<ErrorResponse> handleValidationExceptions(
            MethodArgumentNotValidException ex,
            org.springframework.web.context.request.WebRequest request) {

        List<ErrorResponse.FieldError> fieldErrors = ex.getBindingResult()
            .getFieldErrors()
            .stream()
            .map(error -> new ErrorResponse.FieldError(
                error.getField(),
                error.getDefaultMessage() != null ? error.getDefaultMessage() : "Invalid value",
                error.getRejectedValue()
            ))
            .toList();

        ErrorResponse response = ErrorResponse.validationError(
            fieldErrors,
            request.getDescription(false).replace("uri=", "")
        );

        log.warn("Validation failed: {} errors", fieldErrors.size());

        return ResponseEntity.badRequest().body(response);
    }

    @ExceptionHandler(ConstraintViolationException.class)
    public ResponseEntity<ErrorResponse> handleConstraintViolation(
            ConstraintViolationException ex,
            org.springframework.web.context.request.WebRequest request) {

        var violations = ex.getConstraintViolations();
        List<ErrorResponse.FieldError> fieldErrors = violations == null
            ? Collections.emptyList()
            : violations.stream()
                .map(violation -> new ErrorResponse.FieldError(
                    violation.getPropertyPath().toString(),
                    violation.getMessage(),
                    violation.getInvalidValue()
                ))
                .toList();

        ErrorResponse response = ErrorResponse.validationError(
            fieldErrors,
            request.getDescription(false).replace("uri=", "")
        );

        log.warn("Constraint violation: {} errors", fieldErrors.size());

        return ResponseEntity.badRequest().body(response);
    }

    @ExceptionHandler(ResourceNotFoundException.class)
    public ResponseEntity<ErrorResponse> handleResourceNotFound(
            ResourceNotFoundException ex,
            org.springframework.web.context.request.WebRequest request) {

        ErrorResponse response = ErrorResponse.notFound(
            ex.getMessage(),
            request.getDescription(false).replace("uri=", "")
        );

        log.warn("Resource not found: {}", ex.getMessage());

        return ResponseEntity.status(HttpStatus.NOT_FOUND).body(response);
    }

    @ExceptionHandler(DuplicateResourceException.class)
    public ResponseEntity<ErrorResponse> handleDuplicateResource(
            DuplicateResourceException ex,
            org.springframework.web.context.request.WebRequest request) {

        ErrorResponse response = ErrorResponse.of(
            ex.getErrorCode(),
            ex.getMessage(),
            HttpStatus.CONFLICT,
            request.getDescription(false).replace("uri=", "")
        );

        log.warn("Duplicate resource: {}", ex.getMessage());

        return ResponseEntity.status(HttpStatus.CONFLICT).body(response);
    }

    @ExceptionHandler(BusinessRuleException.class)
    public ResponseEntity<ErrorResponse> handleBusinessRuleViolation(
            BusinessRuleException ex,
            org.springframework.web.context.request.WebRequest request) {

        ErrorResponse response = ErrorResponse.of(
            ex.getErrorCode(),
            ex.getMessage(),
            HttpStatus.BAD_REQUEST,
            request.getDescription(false).replace("uri=", "")
        );

        log.warn("Business rule violation: {}", ex.getMessage());

        return ResponseEntity.badRequest().body(response);
    }

    @ExceptionHandler(InvalidCredentialsException.class)
    public ResponseEntity<ErrorResponse> handleInvalidCredentials(
            InvalidCredentialsException ex,
            org.springframework.web.context.request.WebRequest request) {

        ErrorResponse response = ErrorResponse.unauthorized(
            ex.getMessage(),
            request.getDescription(false).replace("uri=", "")
        );

        log.warn("Invalid credentials attempt");

        return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(response);
    }

    @ExceptionHandler(BadCredentialsException.class)
    public ResponseEntity<ErrorResponse> handleBadCredentials(
            BadCredentialsException ex,
            org.springframework.web.context.request.WebRequest request) {

        ErrorResponse response = ErrorResponse.unauthorized(
            "Invalid email/phone or password",
            request.getDescription(false).replace("uri=", "")
        );

        log.debug("Bad credentials: {}", ex.getMessage());

        return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(response);
    }

    @ExceptionHandler(LockedException.class)
    public ResponseEntity<ErrorResponse> handleLockedAccount(
            LockedException ex,
            org.springframework.web.context.request.WebRequest request) {

        ErrorResponse response = ErrorResponse.of(
            "ACCOUNT_LOCKED",
            "Account is temporarily locked. Please try again later.",
            HttpStatus.LOCKED,
            request.getDescription(false).replace("uri=", "")
        );

        log.warn("Locked account access attempt");

        return ResponseEntity.status(HttpStatus.LOCKED).body(response);
    }

    @ExceptionHandler(AccountLockedException.class)
    public ResponseEntity<ErrorResponse> handleAccountLocked(
            AccountLockedException ex,
            org.springframework.web.context.request.WebRequest request) {

        ErrorResponse response = ErrorResponse.of(
            ex.getErrorCode(),
            ex.getMessage(),
            HttpStatus.LOCKED,
            request.getDescription(false).replace("uri=", "")
        );

        log.warn("Locked account: {}", ex.getMessage());

        return ResponseEntity.status(HttpStatus.LOCKED).body(response);
    }

    @ExceptionHandler(Invalid2faException.class)
    public ResponseEntity<ErrorResponse> handleInvalid2fa(
            Invalid2faException ex,
            org.springframework.web.context.request.WebRequest request) {

        ErrorResponse response = ErrorResponse.unauthorized(
            ex.getMessage(),
            request.getDescription(false).replace("uri=", "")
        );

        log.warn("Invalid 2FA code");

        return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(response);
    }

    @ExceptionHandler(AccessDeniedException.class)
    public ResponseEntity<ErrorResponse> handleAccessDenied(
            AccessDeniedException ex,
            org.springframework.web.context.request.WebRequest request) {

        ErrorResponse response = ErrorResponse.of(
            "ACCESS_DENIED",
            "You don't have permission to access this resource",
            HttpStatus.FORBIDDEN,
            request.getDescription(false).replace("uri=", "")
        );

        log.warn("Access denied: {}", ex.getMessage());

        return ResponseEntity.status(HttpStatus.FORBIDDEN).body(response);
    }

    @ExceptionHandler(HisIntegrationException.class)
    public ResponseEntity<ErrorResponse> handleHisIntegrationError(
            HisIntegrationException ex,
            org.springframework.web.context.request.WebRequest request) {

        ErrorResponse response = ErrorResponse.of(
            ex.getErrorCode(),
            ex.getMessage(),
            HttpStatus.SERVICE_UNAVAILABLE,
            request.getDescription(false).replace("uri=", "")
        );

        log.error("HIS integration error: {}", ex.getMessage(), ex);

        return ResponseEntity.status(HttpStatus.SERVICE_UNAVAILABLE).body(response);
    }

    @ExceptionHandler(org.springframework.http.converter.HttpMessageNotReadableException.class)
    public ResponseEntity<ErrorResponse> handleMessageNotReadable(
            org.springframework.http.converter.HttpMessageNotReadableException ex,
            org.springframework.web.context.request.WebRequest request) {

        ErrorResponse response = ErrorResponse.of(
            "VALIDATION_ERROR",
            "Malformed request body: " + ex.getMostSpecificCause().getMessage(),
            HttpStatus.BAD_REQUEST,
            request.getDescription(false).replace("uri=", "")
        );

        log.warn("Malformed request body: {}", ex.getMessage());

        return ResponseEntity.badRequest().body(response);
    }

    @ExceptionHandler(NoResourceFoundException.class)
    public ResponseEntity<ErrorResponse> handleNoResourceFound(
            NoResourceFoundException ex,
            org.springframework.web.context.request.WebRequest request) {

        ErrorResponse response = ErrorResponse.notFound(
            "Resource not found: " + ex.getMessage(),
            request.getDescription(false).replace("uri=", "")
        );

        log.debug("No resource found: {}", ex.getMessage());

        return ResponseEntity.status(HttpStatus.NOT_FOUND).body(response);
    }

    @ExceptionHandler(IllegalArgumentException.class)
    public ResponseEntity<ErrorResponse> handleIllegalArgument(
            IllegalArgumentException ex,
            org.springframework.web.context.request.WebRequest request) {

        ErrorResponse response = ErrorResponse.of(
            "VALIDATION_ERROR",
            ex.getMessage() != null ? ex.getMessage() : "Invalid argument",
            HttpStatus.BAD_REQUEST,
            request.getDescription(false).replace("uri=", "")
        );

        log.warn("Illegal argument: {}", ex.getMessage());

        return ResponseEntity.badRequest().body(response);
    }

    @ExceptionHandler(Exception.class)
    public ResponseEntity<ErrorResponse> handleGenericException(
            Exception ex) {

        ErrorResponse response = ErrorResponse.internalError(
            "An unexpected error occurred",
            "internal-error"
        );

        log.error("Unexpected error", ex);

        return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(response);
    }
}
