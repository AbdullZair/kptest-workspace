package com.kptest.api.dto;

import com.fasterxml.jackson.annotation.JsonProperty;

import java.time.Instant;
import java.util.UUID;

/**
 * Response DTO for patient anonymization operation.
 * 
 * @param patientId ID of the anonymized patient
 * @param anonymizedAt Timestamp when anonymization was performed
 * @param auditLogId ID of the audit log entry created for this operation
 */
public record AnonymizationResponse(
    @JsonProperty("patient_id")
    UUID patientId,

    @JsonProperty("anonymized_at")
    Instant anonymizedAt,

    @JsonProperty("audit_log_id")
    UUID auditLogId
) {
    public static AnonymizationResponse of(UUID patientId, Instant anonymizedAt, UUID auditLogId) {
        return new AnonymizationResponse(patientId, anonymizedAt, auditLogId);
    }
}
