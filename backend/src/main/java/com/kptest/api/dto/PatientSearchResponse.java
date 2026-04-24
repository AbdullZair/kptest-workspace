package com.kptest.api.dto;

import com.fasterxml.jackson.annotation.JsonProperty;
import com.kptest.domain.patient.Patient;

import java.util.List;

/**
 * Patient search response with pagination.
 */
public record PatientSearchResponse(
    @JsonProperty("data")
    List<PatientDto> data,

    @JsonProperty("total")
    long total,

    @JsonProperty("page")
    int page,

    @JsonProperty("size")
    int size,

    @JsonProperty("total_pages")
    int totalPages,

    @JsonProperty("has_next")
    boolean hasNext,

    @JsonProperty("has_previous")
    boolean hasPrevious
) {

    public static PatientSearchResponse fromPage(
        List<PatientDto> patientDtos,
        long total,
        int page,
        int size
    ) {
        int totalPages = (int) Math.ceil((double) total / size);

        return new PatientSearchResponse(
            patientDtos,
            total,
            page,
            size,
            totalPages,
            page < totalPages - 1,
            page > 0
        );
    }
}
