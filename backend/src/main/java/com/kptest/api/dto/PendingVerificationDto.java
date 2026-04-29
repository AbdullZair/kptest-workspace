package com.kptest.api.dto;

import com.fasterxml.jackson.annotation.JsonProperty;
import com.kptest.api.dto.HisDemographicsDto;
import com.kptest.domain.patient.Patient;
import com.kptest.domain.user.VerificationStatus;

import java.time.Instant;
import java.util.UUID;

/**
 * DTO representing a patient awaiting staff verification (US-NH-01).
 *
 * <p>The PESEL is masked - only the last 4 digits are visible to limit
 * exposure of sensitive data in admin panel listings.</p>
 */
public record PendingVerificationDto(
    @JsonProperty("patient_id")
    UUID patientId,

    @JsonProperty("first_name")
    String firstName,

    @JsonProperty("last_name")
    String lastName,

    @JsonProperty("pesel_masked")
    String peselMasked,

    @JsonProperty("email")
    String email,

    @JsonProperty("phone")
    String phone,

    @JsonProperty("verification_status")
    VerificationStatus verificationStatus,

    @JsonProperty("his_patient_id")
    String hisPatientId,

    @JsonProperty("created_at")
    Instant createdAt
) {

    /**
     * Build a {@link PendingVerificationDto} from a Patient entity, masking the PESEL.
     */
    public static PendingVerificationDto fromPatient(Patient patient) {
        return new PendingVerificationDto(
            patient.getId(),
            patient.getFirstName(),
            patient.getLastName(),
            HisDemographicsDto.maskPesel(patient.getPesel()),
            patient.getUser() != null ? patient.getUser().getEmail() : null,
            patient.getUser() != null ? patient.getUser().getPhone() : null,
            patient.getVerificationStatus(),
            patient.getHisPatientId(),
            patient.getCreatedAt()
        );
    }
}
