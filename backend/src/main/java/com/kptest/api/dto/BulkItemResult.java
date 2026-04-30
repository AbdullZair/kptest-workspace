package com.kptest.api.dto;

import com.fasterxml.jackson.annotation.JsonProperty;

import java.util.UUID;

/**
 * Per-item result of a bulk patient operation (US-K-05).
 *
 * @param patientId patient UUID the operation was attempted on
 * @param status either {@code "OK"} or {@code "ERROR"}
 * @param error short error message when status is {@code "ERROR"}, otherwise {@code null}
 */
public record BulkItemResult(
    @JsonProperty("patient_id")
    UUID patientId,

    String status,

    String error
) {
    public static BulkItemResult ok(UUID patientId) {
        return new BulkItemResult(patientId, "OK", null);
    }

    public static BulkItemResult error(UUID patientId, String error) {
        return new BulkItemResult(patientId, "ERROR", error);
    }
}
