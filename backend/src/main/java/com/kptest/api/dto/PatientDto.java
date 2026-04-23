package com.kptest.api.dto;

import com.fasterxml.jackson.annotation.JsonProperty;
import com.kptest.domain.patient.Patient;
import com.kptest.domain.user.VerificationStatus;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;

import java.time.Instant;
import java.time.LocalDate;
import java.util.UUID;

/**
 * Patient DTO for creating and updating patients.
 */
public record PatientDto(
    @JsonProperty("id")
    UUID id,

    @JsonProperty("pesel")
    @NotBlank(message = "PESEL is required")
    @Pattern(regexp = "^\\d{11}$", message = "PESEL must be 11 digits")
    String pesel,

    @JsonProperty("first_name")
    @NotBlank(message = "First name is required")
    @Size(max = 100, message = "First name must be less than 100 characters")
    String firstName,

    @JsonProperty("last_name")
    @NotBlank(message = "Last name is required")
    @Size(max = 100, message = "Last name must be less than 100 characters")
    String lastName,

    @JsonProperty("date_of_birth")
    LocalDate dateOfBirth,

    @JsonProperty("gender")
    Patient.Gender gender,

    @JsonProperty("email")
    @Pattern(regexp = "^[A-Za-z0-9+_.-]+@(.+)$", message = "Invalid email format")
    String email,

    @JsonProperty("phone")
    @Pattern(regexp = "^\\+?[0-9\\s-]{9,15}$", message = "Invalid phone number format")
    String phone,

    @JsonProperty("address_street")
    @Size(max = 255, message = "Street must be less than 255 characters")
    String addressStreet,

    @JsonProperty("address_city")
    @Size(max = 100, message = "City must be less than 100 characters")
    String addressCity,

    @JsonProperty("address_postal_code")
    @Size(max = 20, message = "Postal code must be less than 20 characters")
    String addressPostalCode,

    @JsonProperty("his_patient_id")
    String hisPatientId,

    @JsonProperty("verification_status")
    VerificationStatus verificationStatus,

    @JsonProperty("created_at")
    Instant createdAt,

    @JsonProperty("updated_at")
    Instant updatedAt
) {

    public static PatientDto fromPatient(Patient patient) {
        return new PatientDto(
            patient.getId(),
            patient.getPesel(),
            patient.getFirstName(),
            patient.getLastName(),
            patient.getDateOfBirth(),
            patient.getGender(),
            patient.getUser() != null ? patient.getUser().getEmail() : null,
            patient.getUser() != null ? patient.getUser().getPhone() : null,
            patient.getAddressStreet(),
            patient.getAddressCity(),
            patient.getAddressPostalCode(),
            patient.getHisPatientId(),
            patient.getVerificationStatus(),
            patient.getCreatedAt(),
            patient.getUpdatedAt()
        );
    }
}
