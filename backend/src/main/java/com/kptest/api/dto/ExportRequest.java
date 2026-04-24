package com.kptest.api.dto;

import com.fasterxml.jackson.annotation.JsonProperty;
import com.kptest.domain.report.ReportType;

import java.time.LocalDate;
import java.util.List;
import java.util.UUID;

/**
 * DTO for export request.
 */
public record ExportRequest(
    @JsonProperty("report_type")
    ReportType reportType,

    @JsonProperty("project_id")
    UUID projectId,

    @JsonProperty("patient_id")
    UUID patientId,

    @JsonProperty("date_from")
    LocalDate dateFrom,

    @JsonProperty("date_to")
    LocalDate dateTo,

    @JsonProperty("format")
    String format,

    @JsonProperty("include_charts")
    Boolean includeCharts,

    @JsonProperty("sections")
    List<String> sections
) {
    public ExportRequest {
        if (format == null) {
            format = "PDF";
        }
        if (includeCharts == null) {
            includeCharts = true;
        }
    }

    public static Builder builder() {
        return new Builder();
    }

    public static class Builder {
        private ReportType reportType;
        private UUID projectId;
        private UUID patientId;
        private LocalDate dateFrom;
        private LocalDate dateTo;
        private String format = "PDF";
        private Boolean includeCharts = true;
        private List<String> sections;

        public Builder reportType(ReportType reportType) {
            this.reportType = reportType;
            return this;
        }

        public Builder projectId(UUID projectId) {
            this.projectId = projectId;
            return this;
        }

        public Builder patientId(UUID patientId) {
            this.patientId = patientId;
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

        public Builder format(String format) {
            this.format = format;
            return this;
        }

        public Builder includeCharts(Boolean includeCharts) {
            this.includeCharts = includeCharts;
            return this;
        }

        public Builder sections(List<String> sections) {
            this.sections = sections;
            return this;
        }

        public ExportRequest build() {
            return new ExportRequest(
                reportType,
                projectId,
                patientId,
                dateFrom,
                dateTo,
                format,
                includeCharts,
                sections
            );
        }
    }
}
