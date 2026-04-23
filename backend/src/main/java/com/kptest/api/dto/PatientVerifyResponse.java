package com.kptest.api.dto;

import com.fasterxml.jackson.annotation.JsonProperty;

/**
 * Patient verification response from HIS.
 */
public record PatientVerifyResponse(
    @JsonProperty("verified")
    boolean verified,

    @JsonProperty("his_patient_id")
    String hisPatientId,

    @JsonProperty("pesel")
    String pesel,

    @JsonProperty("first_name")
    String firstName,

    @JsonProperty("last_name")
    String lastName,

    @JsonProperty("date_of_birth")
    String dateOfBirth,

    @JsonProperty("message")
    String message
) {

    public static PatientVerifyResponse success(
        String hisPatientId,
        String pesel,
        String firstName,
        String lastName,
        String dateOfBirth
    ) {
        return new PatientVerifyResponse(
            true,
            hisPatientId,
            pesel,
            firstName,
            lastName,
            dateOfBirth,
            "Patient verified successfully in HIS"
        );
    }

    public static PatientVerifyResponse notFound(String pesel) {
        return new PatientVerifyResponse(
            false,
            null,
            pesel,
            null,
            null,
            null,
            "Patient not found in HIS"
        );
    }

    public static PatientVerifyResponse error(String message) {
        return new PatientVerifyResponse(
            false,
            null,
            null,
            null,
            null,
            null,
            message
        );
    }
}
