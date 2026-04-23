package com.kptest.api.dto;

import com.fasterxml.jackson.annotation.JsonProperty;
import com.kptest.domain.patient.Patient;
import com.kptest.domain.user.User;

import java.time.Instant;

/**
 * User profile response.
 */
public record UserProfileResponse(
    @JsonProperty("user_id")
    String userId,
    
    String email,
    
    String phone,
    
    String role,
    
    String status,
    
    @JsonProperty("first_name")
    String firstName,
    
    @JsonProperty("last_name")
    String lastName,
    
    String pesel,
    
    @JsonProperty("date_of_birth")
    String dateOfBirth,
    
    @JsonProperty("created_at")
    Instant createdAt,
    
    @JsonProperty("two_factor_enabled")
    boolean twoFactorEnabled
) {
    
    public static UserProfileResponse fromUser(User user, Patient patient) {
        return new UserProfileResponse(
            user.getId().toString(),
            user.getEmail(),
            user.getPhone(),
            user.getRole().name(),
            user.getStatus().name(),
            patient != null ? patient.getFirstName() : null,
            patient != null ? patient.getLastName() : null,
            patient != null ? patient.getPesel() : null,
            patient != null ? patient.getDateOfBirth() != null ? 
                patient.getDateOfBirth().toString() : null : null,
            user.getCreatedAt(),
            user.isTwoFactorEnabled()
        );
    }
}
