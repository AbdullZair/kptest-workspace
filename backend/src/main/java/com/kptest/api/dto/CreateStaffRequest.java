package com.kptest.api.dto;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;

/**
 * Request payload for creating a new staff user via the admin panel (US-A-01).
 *
 * <p>The role pattern is constrained server-side to staff-only roles —
 * PATIENT accounts must be created via the patient registration flow.</p>
 */
public record CreateStaffRequest(
    @NotBlank(message = "Email is required")
    @Email(message = "Email must be a valid address")
    String email,

    @NotBlank(message = "Password is required")
    @Size(min = 10, message = "Password must be at least 10 characters long")
    String password,

    @NotBlank(message = "First name is required")
    String firstName,

    @NotBlank(message = "Last name is required")
    String lastName,

    String phone,

    @NotNull(message = "Role is required")
    @Pattern(
        regexp = "^(ADMIN|DOCTOR|COORDINATOR|NURSE|THERAPIST)$",
        message = "Role must be one of: ADMIN, DOCTOR, COORDINATOR, NURSE, THERAPIST"
    )
    String role
) {
}
