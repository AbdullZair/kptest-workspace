package com.kptest.api.dto;

import com.fasterxml.jackson.annotation.JsonProperty;

import java.util.List;
import java.util.Map;
import java.util.UUID;

/**
 * DTO for patient statistics report.
 */
public record PatientStatsDto(
    @JsonProperty("patient_id")
    UUID patientId,

    @JsonProperty("patient_name")
    String patientName,

    @JsonProperty("pesel")
    String pesel,

    @JsonProperty("total_projects")
    Integer totalProjects,

    @JsonProperty("active_projects")
    Integer activeProjects,

    @JsonProperty("completed_projects")
    Integer completedProjects,

    @JsonProperty("overall_compliance")
    Double overallCompliance,

    @JsonProperty("total_sessions")
    Integer totalSessions,

    @JsonProperty("attended_sessions")
    Integer attendedSessions,

    @JsonProperty("missed_sessions")
    Integer missedSessions,

    @JsonProperty("session_attendance_rate")
    Double sessionAttendanceRate,

    @JsonProperty("materials_completed")
    Integer materialsCompleted,

    @JsonProperty("materials_in_progress")
    Integer materialsInProgress,

    @JsonProperty("messages_sent")
    Integer messagesSent,

    @JsonProperty("messages_received")
    Integer messagesReceived,

    @JsonProperty("project_stats")
    List<ProjectStatEntry> projectStats,

    @JsonProperty("compliance_history")
    List<ComplianceHistoryEntry> complianceHistory
) {

    /**
     * Project stat entry.
     */
    public record ProjectStatEntry(
        @JsonProperty("project_id")
        UUID projectId,

        @JsonProperty("project_name")
        String projectName,

        @JsonProperty("status")
        String status,

        @JsonProperty("compliance_score")
        Double complianceScore,

        @JsonProperty("current_stage")
        String currentStage,

        @JsonProperty("enrollment_date")
        String enrollmentDate
    ) {}

    /**
     * Compliance history entry.
     */
    public record ComplianceHistoryEntry(
        @JsonProperty("date")
        String date,

        @JsonProperty("compliance_score")
        Double complianceScore
    ) {}

    public static Builder builder() {
        return new Builder();
    }

    public static class Builder {
        private UUID patientId;
        private String patientName;
        private String pesel;
        private Integer totalProjects;
        private Integer activeProjects;
        private Integer completedProjects;
        private Double overallCompliance;
        private Integer totalSessions;
        private Integer attendedSessions;
        private Integer missedSessions;
        private Double sessionAttendanceRate;
        private Integer materialsCompleted;
        private Integer materialsInProgress;
        private Integer messagesSent;
        private Integer messagesReceived;
        private List<ProjectStatEntry> projectStats;
        private List<ComplianceHistoryEntry> complianceHistory;

        public Builder patientId(UUID patientId) {
            this.patientId = patientId;
            return this;
        }

        public Builder patientName(String patientName) {
            this.patientName = patientName;
            return this;
        }

        public Builder pesel(String pesel) {
            this.pesel = pesel;
            return this;
        }

        public Builder totalProjects(Integer totalProjects) {
            this.totalProjects = totalProjects;
            return this;
        }

        public Builder activeProjects(Integer activeProjects) {
            this.activeProjects = activeProjects;
            return this;
        }

        public Builder completedProjects(Integer completedProjects) {
            this.completedProjects = completedProjects;
            return this;
        }

        public Builder overallCompliance(Double overallCompliance) {
            this.overallCompliance = overallCompliance;
            return this;
        }

        public Builder totalSessions(Integer totalSessions) {
            this.totalSessions = totalSessions;
            return this;
        }

        public Builder attendedSessions(Integer attendedSessions) {
            this.attendedSessions = attendedSessions;
            return this;
        }

        public Builder missedSessions(Integer missedSessions) {
            this.missedSessions = missedSessions;
            return this;
        }

        public Builder sessionAttendanceRate(Double sessionAttendanceRate) {
            this.sessionAttendanceRate = sessionAttendanceRate;
            return this;
        }

        public Builder materialsCompleted(Integer materialsCompleted) {
            this.materialsCompleted = materialsCompleted;
            return this;
        }

        public Builder materialsInProgress(Integer materialsInProgress) {
            this.materialsInProgress = materialsInProgress;
            return this;
        }

        public Builder messagesSent(Integer messagesSent) {
            this.messagesSent = messagesSent;
            return this;
        }

        public Builder messagesReceived(Integer messagesReceived) {
            this.messagesReceived = messagesReceived;
            return this;
        }

        public Builder projectStats(List<ProjectStatEntry> projectStats) {
            this.projectStats = projectStats;
            return this;
        }

        public Builder complianceHistory(List<ComplianceHistoryEntry> complianceHistory) {
            this.complianceHistory = complianceHistory;
            return this;
        }

        public PatientStatsDto build() {
            return new PatientStatsDto(
                patientId,
                patientName,
                pesel,
                totalProjects,
                activeProjects,
                completedProjects,
                overallCompliance,
                totalSessions,
                attendedSessions,
                missedSessions,
                sessionAttendanceRate,
                materialsCompleted,
                materialsInProgress,
                messagesSent,
                messagesReceived,
                projectStats,
                complianceHistory
            );
        }
    }
}
