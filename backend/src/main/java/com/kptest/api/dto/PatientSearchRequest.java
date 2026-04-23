package com.kptest.api.dto;

import com.fasterxml.jackson.annotation.JsonProperty;
import com.kptest.domain.patient.Patient;
import com.kptest.domain.user.VerificationStatus;
import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.Pattern;

import java.util.Set;

/**
 * Patient search request with filtering and pagination.
 */
public record PatientSearchRequest(
    @JsonProperty("pesel")
    @Pattern(regexp = "^\\d{11}$", message = "PESEL must be 11 digits")
    String pesel,

    @JsonProperty("name")
    String name,

    @JsonProperty("his_patient_id")
    String hisPatientId,

    @JsonProperty("status")
    Set<String> status,

    @JsonProperty("verification_status")
    Set<VerificationStatus> verificationStatus,

    @JsonProperty("project")
    String project,

    @JsonProperty("page")
    @Min(value = 0, message = "Page must be greater than or equal to 0")
    Integer page,

    @JsonProperty("size")
    @Min(value = 1, message = "Size must be greater than or equal to 1")
    @Max(value = 100, message = "Size must be less than or equal to 100")
    Integer size,

    @JsonProperty("sort")
    String sort,

    @JsonProperty("sort_order")
    @Pattern(regexp = "^(asc|desc)$", message = "Sort order must be 'asc' or 'desc'")
    String sortOrder
) {

    public PatientSearchRequest {
        // Default values
        if (page == null) page = 0;
        if (size == null) size = 20;
        if (sortOrder == null) sortOrder = "asc";
    }

    /**
     * Builder for PatientSearchRequest.
     */
    public static class Builder {
        private String pesel;
        private String name;
        private String hisPatientId;
        private Set<String> status;
        private Set<VerificationStatus> verificationStatus;
        private String project;
        private Integer page = 0;
        private Integer size = 20;
        private String sort = "last_name";
        private String sortOrder = "asc";

        public Builder pesel(String pesel) {
            this.pesel = pesel;
            return this;
        }

        public Builder name(String name) {
            this.name = name;
            return this;
        }

        public Builder hisPatientId(String hisPatientId) {
            this.hisPatientId = hisPatientId;
            return this;
        }

        public Builder status(Set<String> status) {
            this.status = status;
            return this;
        }

        public Builder verificationStatus(Set<VerificationStatus> verificationStatus) {
            this.verificationStatus = verificationStatus;
            return this;
        }

        public Builder project(String project) {
            this.project = project;
            return this;
        }

        public Builder page(Integer page) {
            this.page = page;
            return this;
        }

        public Builder size(Integer size) {
            this.size = size;
            return this;
        }

        public Builder sort(String sort) {
            this.sort = sort;
            return this;
        }

        public Builder sortOrder(String sortOrder) {
            this.sortOrder = sortOrder;
            return this;
        }

        public PatientSearchRequest build() {
            return new PatientSearchRequest(
                pesel, name, hisPatientId, status, verificationStatus,
                project, page, size, sort, sortOrder
            );
        }
    }

    public static Builder builder() {
        return new Builder();
    }
}
