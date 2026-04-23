package com.kptest.api.dto;

import com.fasterxml.jackson.annotation.JsonProperty;

/**
 * Request DTO for completing a therapy event.
 */
public record CompleteEventRequest(
    @JsonProperty("patient_notes")
    String patientNotes
) {}
