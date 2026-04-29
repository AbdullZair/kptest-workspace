package com.kptest.api.dto;

import com.fasterxml.jackson.annotation.JsonInclude;
import com.fasterxml.jackson.annotation.JsonProperty;
import com.kptest.domain.patient.Patient;
import com.kptest.domain.user.VerificationStatus;

import java.time.Instant;
import java.util.UUID;

/**
 * Response returned after a verification decision (approve or reject)
 * is applied to a patient (US-NH-01).
 */
public record VerificationDecisionResponse(
    @JsonProperty("patient_id")
    UUID patientId,

    @JsonProperty("verification_status")
    VerificationStatus verificationStatus,

    @JsonProperty("verification_method")
    @JsonInclude(JsonInclude.Include.NON_NULL)
    String verificationMethod,

    @JsonProperty("verified_at")
    @JsonInclude(JsonInclude.Include.NON_NULL)
    Instant verifiedAt,

    @JsonProperty("verified_by")
    @JsonInclude(JsonInclude.Include.NON_NULL)
    UUID verifiedBy,

    @JsonProperty("audit_log_id")
    @JsonInclude(JsonInclude.Include.NON_NULL)
    UUID auditLogId,

    @JsonProperty("message")
    String message
) {

    public static VerificationDecisionResponse fromPatient(Patient patient, UUID auditLogId, String message) {
        return new VerificationDecisionResponse(
            patient.getId(),
            patient.getVerificationStatus(),
            patient.getVerificationMethod(),
            patient.getVerifiedAt(),
            patient.getVerifiedBy(),
            auditLogId,
            message
        );
    }
}
