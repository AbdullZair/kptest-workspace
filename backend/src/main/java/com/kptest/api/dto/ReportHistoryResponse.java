package com.kptest.api.dto;

import com.fasterxml.jackson.annotation.JsonProperty;
import com.kptest.domain.report.ReportType;

import java.time.Instant;
import java.time.LocalDate;
import java.util.UUID;

/**
 * DTO for report history response.
 */
public record ReportHistoryResponse(
    @JsonProperty("id")
    UUID id,

    @JsonProperty("type")
    ReportType type,

    @JsonProperty("project_id")
    UUID projectId,

    @JsonProperty("project_name")
    String projectName,

    @JsonProperty("patient_id")
    UUID patientId,

    @JsonProperty("patient_name")
    String patientName,

    @JsonProperty("date_from")
    LocalDate dateFrom,

    @JsonProperty("date_to")
    LocalDate dateTo,

    @JsonProperty("generated_at")
    Instant generatedAt,

    @JsonProperty("generated_by")
    UUID generatedBy,

    @JsonProperty("generated_by_name")
    String generatedByName
) {
    public static Builder builder() {
        return new Builder();
    }

    public static class Builder {
        private UUID id;
        private ReportType type;
        private UUID projectId;
        private String projectName;
        private UUID patientId;
        private String patientName;
        private LocalDate dateFrom;
        private LocalDate dateTo;
        private Instant generatedAt;
        private UUID generatedBy;
        private String generatedByName;

        public Builder id(UUID id) {
            this.id = id;
            return this;
        }

        public Builder type(ReportType type) {
            this.type = type;
            return this;
        }

        public Builder projectId(UUID projectId) {
            this.projectId = projectId;
            return this;
        }

        public Builder projectName(String projectName) {
            this.projectName = projectName;
            return this;
        }

        public Builder patientId(UUID patientId) {
            this.patientId = patientId;
            return this;
        }

        public Builder patientName(String patientName) {
            this.patientName = patientName;
            return this;
        }

        public Builder dateFrom(LocalDate dateFrom) {
            this.dateFrom = dateFrom;
            return this;
        }

        public Builder dateTo(LocalDate dateTo) {
            this.dateTo = dateTo;
            return this;
        }

        public Builder generatedAt(Instant generatedAt) {
            this.generatedAt = generatedAt;
            return this;
        }

        public Builder generatedBy(UUID generatedBy) {
            this.generatedBy = generatedBy;
            return this;
        }

        public Builder generatedByName(String generatedByName) {
            this.generatedByName = generatedByName;
            return this;
        }

        public ReportHistoryResponse build() {
            return new ReportHistoryResponse(
                id,
                type,
                projectId,
                projectName,
                patientId,
                patientName,
                dateFrom,
                dateTo,
                generatedAt,
                generatedBy,
                generatedByName
            );
        }
    }
}
