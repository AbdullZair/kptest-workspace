package com.kptest.validation;

import jakarta.validation.ConstraintValidator;
import jakarta.validation.ConstraintValidatorContext;

/**
 * Validator for @ValidPassword annotation.
 * Checks password meets requirements:
 * - Minimum 12 characters
 * - At least one uppercase letter
 * - At least one lowercase letter
 * - At least one digit
 * - At least one special character
 */
public class ValidPasswordValidator implements ConstraintValidator<ValidPassword, String> {

    // Password pattern: min 12 chars, at least one uppercase, one lowercase, one digit, one special character
    private static final String PASSWORD_PATTERN = 
        "^(?=.*[a-z])(?=.*[A-Z])(?=.*\\d)(?=.*[@$!%*?&#])[A-Za-z\\d@$!%*?&#]{12,}$";

    @Override
    public boolean isValid(String password, ConstraintValidatorContext context) {
        // null values are handled by @NotBlank annotation
        if (password == null || password.isBlank()) {
            return false;
        }

        return password.matches(PASSWORD_PATTERN);
    }
}
