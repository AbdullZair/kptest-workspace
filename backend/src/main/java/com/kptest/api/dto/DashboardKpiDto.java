package com.kptest.api.dto;

import com.fasterxml.jackson.annotation.JsonProperty;

import java.util.List;
import java.util.Map;

/**
 * DTO for dashboard KPIs.
 */
public record DashboardKpiDto(
    @JsonProperty("total_projects")
    Integer totalProjects,

    @JsonProperty("active_projects")
    Integer activeProjects,

    @JsonProperty("total_patients")
    Integer totalPatients,

    @JsonProperty("active_patients")
    Integer activePatients,

    @JsonProperty("total_staff")
    Integer totalStaff,

    @JsonProperty("average_compliance")
    Double averageCompliance,

    @JsonProperty("overall_session_attendance")
    Double overallSessionAttendance,

    @JsonProperty("materials_completion_rate")
    Double materialsCompletionRate,

    @JsonProperty("pending_messages")
    Integer pendingMessages,

    @JsonProperty("upcoming_sessions")
    Integer upcomingSessions,

    @JsonProperty("projects_at_risk")
    Integer projectsAtRisk,

    @JsonProperty("compliance_trend")
    List<ComplianceTrendEntry> complianceTrend,

    @JsonProperty("project_status_summary")
    Map<String, Integer> projectStatusSummary,

    @JsonProperty("patient_stage_summary")
    Map<String, Integer> patientStageSummary,

    @JsonProperty("recent_alerts")
    List<AlertEntry> recentAlerts
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
     * Alert entry.
     */
    public record AlertEntry(
        @JsonProperty("type")
        String type,

        @JsonProperty("severity")
        String severity,

        @JsonProperty("message")
        String message,

        @JsonProperty("created_at")
        String createdAt,

        @JsonProperty("entity_id")
        String entityId
    ) {}

    public static Builder builder() {
        return new Builder();
    }

    public static class Builder {
        private Integer totalProjects;
        private Integer activeProjects;
        private Integer totalPatients;
        private Integer activePatients;
        private Integer totalStaff;
        private Double averageCompliance;
        private Double overallSessionAttendance;
        private Double materialsCompletionRate;
        private Integer pendingMessages;
        private Integer upcomingSessions;
        private Integer projectsAtRisk;
        private List<ComplianceTrendEntry> complianceTrend;
        private Map<String, Integer> projectStatusSummary;
        private Map<String, Integer> patientStageSummary;
        private List<AlertEntry> recentAlerts;

        public Builder totalProjects(Integer totalProjects) {
            this.totalProjects = totalProjects;
            return this;
        }

        public Builder activeProjects(Integer activeProjects) {
            this.activeProjects = activeProjects;
            return this;
        }

        public Builder totalPatients(Integer totalPatients) {
            this.totalPatients = totalPatients;
            return this;
        }

        public Builder activePatients(Integer activePatients) {
            this.activePatients = activePatients;
            return this;
        }

        public Builder totalStaff(Integer totalStaff) {
            this.totalStaff = totalStaff;
            return this;
        }

        public Builder averageCompliance(Double averageCompliance) {
            this.averageCompliance = averageCompliance;
            return this;
        }

        public Builder overallSessionAttendance(Double overallSessionAttendance) {
            this.overallSessionAttendance = overallSessionAttendance;
            return this;
        }

        public Builder materialsCompletionRate(Double materialsCompletionRate) {
            this.materialsCompletionRate = materialsCompletionRate;
            return this;
        }

        public Builder pendingMessages(Integer pendingMessages) {
            this.pendingMessages = pendingMessages;
            return this;
        }

        public Builder upcomingSessions(Integer upcomingSessions) {
            this.upcomingSessions = upcomingSessions;
            return this;
        }

        public Builder projectsAtRisk(Integer projectsAtRisk) {
            this.projectsAtRisk = projectsAtRisk;
            return this;
        }

        public Builder complianceTrend(List<ComplianceTrendEntry> complianceTrend) {
            this.complianceTrend = complianceTrend;
            return this;
        }

        public Builder projectStatusSummary(Map<String, Integer> projectStatusSummary) {
            this.projectStatusSummary = projectStatusSummary;
            return this;
        }

        public Builder patientStageSummary(Map<String, Integer> patientStageSummary) {
            this.patientStageSummary = patientStageSummary;
            return this;
        }

        public Builder recentAlerts(List<AlertEntry> recentAlerts) {
            this.recentAlerts = recentAlerts;
            return this;
        }

        public DashboardKpiDto build() {
            return new DashboardKpiDto(
                totalProjects,
                activeProjects,
                totalPatients,
                activePatients,
                totalStaff,
                averageCompliance,
                overallSessionAttendance,
                materialsCompletionRate,
                pendingMessages,
                upcomingSessions,
                projectsAtRisk,
                complianceTrend,
                projectStatusSummary,
                patientStageSummary,
                recentAlerts
            );
        }
    }
}
