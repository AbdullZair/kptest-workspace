package com.kptest.api.dto;

import com.fasterxml.jackson.annotation.JsonProperty;
import jakarta.validation.constraints.NotEmpty;
import jakarta.validation.constraints.Size;

import java.util.List;
import java.util.UUID;

/**
 * Request DTO for bulk patient operations (US-K-05).
 *
 * <p>Backs three operations under {@code POST /patients/bulk/{operation}}:
 * <ul>
 *   <li>{@code assign-to-project} — requires {@link #targetProjectId}</li>
 *   <li>{@code update-status} — requires {@link #newStatus}
 *       (one of {@code ACTIVE|BLOCKED|DEACTIVATED})</li>
 *   <li>{@code anonymize} — requires only {@link #patientIds}</li>
 * </ul>
 * </p>
 *
 * @param patientIds list of patient UUIDs (1..100, non-empty)
 * @param targetProjectId target project for {@code assign-to-project} (nullable otherwise)
 * @param newStatus desired account status for {@code update-status} (nullable otherwise)
 */
public record BulkPatientRequest(
    @JsonProperty("patient_ids")
    @NotEmpty(message = "patient_ids must not be empty")
    @Size(max = 100, message = "Maximum 100 patients per bulk operation")
    List<UUID> patientIds,

    @JsonProperty("target_project_id")
    UUID targetProjectId,

    @JsonProperty("new_status")
    String newStatus
) {
}
