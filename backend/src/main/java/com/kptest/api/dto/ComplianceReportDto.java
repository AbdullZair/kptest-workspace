package com.kptest.api.dto;

import com.fasterxml.jackson.annotation.JsonProperty;

import java.util.List;
import java.util.Map;
import java.util.UUID;

/**
 * DTO for compliance report.
 */
public record ComplianceReportDto(
    @JsonProperty("project_id")
    UUID projectId,

    @JsonProperty("project_name")
    String projectName,

    @JsonProperty("date_from")
    String dateFrom,

    @JsonProperty("date_to")
    String dateTo,

    @JsonProperty("overall_compliance")
    Double overallCompliance,

    @JsonProperty("compliance_threshold")
    Integer complianceThreshold,

    @JsonProperty("is_compliant")
    Boolean isCompliant,

    @JsonProperty("total_tasks")
    Integer totalTasks,

    @JsonProperty("completed_tasks")
    Integer completedTasks,

    @JsonProperty("overdue_tasks")
    Integer overdueTasks,

    @JsonProperty("compliance_by_stage")
    Map<String, Double> complianceByStage,

    @JsonProperty("compliance_trend")
    List<ComplianceTrendEntry> complianceTrend,

    @JsonProperty("non_compliant_items")
    List<NonCompliantItem> nonCompliantItems
) {

    /**
     * Compliance trend entry.
     */
    public record ComplianceTrendEntry(
        @JsonProperty("date")
        String date,

        @JsonProperty("compliance_score")
        Double complianceScore
    ) {}

    /**
     * Non-compliant item details.
     */
    public record NonCompliantItem(
        @JsonProperty("item_id")
        UUID itemId,

        @JsonProperty("item_type")
        String itemType,

        @JsonProperty("description")
        String description,

        @JsonProperty("due_date")
        String dueDate,

        @JsonProperty("days_overdue")
        Integer daysOverdue,

        @JsonProperty("assigned_to")
        String assignedTo
    ) {}

    public static Builder builder() {
        return new Builder();
    }

    public static class Builder {
        private UUID projectId;
        private String projectName;
        private String dateFrom;
        private String dateTo;
        private Double overallCompliance;
        private Integer complianceThreshold;
        private Boolean isCompliant;
        private Integer totalTasks;
        private Integer completedTasks;
        private Integer overdueTasks;
        private Map<String, Double> complianceByStage;
        private List<ComplianceTrendEntry> complianceTrend;
        private List<NonCompliantItem> nonCompliantItems;

        public Builder projectId(UUID projectId) {
            this.projectId = projectId;
            return this;
        }

        public Builder projectName(String projectName) {
            this.projectName = projectName;
            return this;
        }

        public Builder dateFrom(String dateFrom) {
            this.dateFrom = dateFrom;
            return this;
        }

        public Builder dateTo(String dateTo) {
            this.dateTo = dateTo;
            return this;
        }

        public Builder overallCompliance(Double overallCompliance) {
            this.overallCompliance = overallCompliance;
            return this;
        }

        public Builder complianceThreshold(Integer complianceThreshold) {
            this.complianceThreshold = complianceThreshold;
            return this;
        }

        public Builder isCompliant(Boolean isCompliant) {
            this.isCompliant = isCompliant;
            return this;
        }

        public Builder totalTasks(Integer totalTasks) {
            this.totalTasks = totalTasks;
            return this;
        }

        public Builder completedTasks(Integer completedTasks) {
            this.completedTasks = completedTasks;
            return this;
        }

        public Builder overdueTasks(Integer overdueTasks) {
            this.overdueTasks = overdueTasks;
            return this;
        }

        public Builder complianceByStage(Map<String, Double> complianceByStage) {
            this.complianceByStage = complianceByStage;
            return this;
        }

        public Builder complianceTrend(List<ComplianceTrendEntry> complianceTrend) {
            this.complianceTrend = complianceTrend;
            return this;
        }

        public Builder nonCompliantItems(List<NonCompliantItem> nonCompliantItems) {
            this.nonCompliantItems = nonCompliantItems;
            return this;
        }

        public ComplianceReportDto build() {
            return new ComplianceReportDto(
                projectId,
                projectName,
                dateFrom,
                dateTo,
                overallCompliance,
                complianceThreshold,
                isCompliant,
                totalTasks,
                completedTasks,
                overdueTasks,
                complianceByStage,
                complianceTrend,
                nonCompliantItems
            );
        }
    }
}
