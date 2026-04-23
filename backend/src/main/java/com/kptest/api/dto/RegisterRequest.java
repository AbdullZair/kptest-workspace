package com.kptest.api.dto;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;

/**
 * Registration request for new patients.
 */
public record RegisterRequest(
    @NotBlank(message = "Email or phone is required")
    String identifier,
    
    @NotBlank(message = "Password is required")
    @Size(min = 10, message = "Password must be at least 10 characters")
    @Pattern(
        regexp = "^(?=.*[a-z])(?=.*[A-Z])(?=.*\\d)(?=.*[@$!%*?&])[A-Za-z\\d@$!%*?&]+$",
        message = "Password must contain uppercase, lowercase, digit, and special character"
    )
    String password,
    
    @NotBlank(message = "PESEL is required")
    @Size(min = 11, max = 11, message = "PESEL must be 11 digits")
    @Pattern(regexp = "^\\d{11}$", message = "PESEL must contain only digits")
    String pesel,
    
    @NotBlank(message = "First name is required")
    @Size(max = 100, message = "First name must not exceed 100 characters")
    String firstName,
    
    @NotBlank(message = "Last name is required")
    @Size(max = 100, message = "Last name must not exceed 100 characters")
    String lastName,
    
    @Email(message = "Invalid email format")
    String email,
    
    @Pattern(regexp = "^\\+?[1-9]\\d{1,14}$", message = "Invalid phone number format")
    String phone,
    
    @NotBlank(message = "Terms acceptance is required")
    String termsAccepted
) {}
