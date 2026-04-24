package com.kptest.api.dto;

import com.fasterxml.jackson.annotation.JsonProperty;
import com.kptest.domain.project.ProjectStatus;
import com.kptest.domain.project.TherapyStage;

import java.util.List;
import java.util.Map;
import java.util.UUID;

/**
 * DTO for project statistics report.
 */
public record ProjectStatsDto(
    @JsonProperty("project_id")
    UUID projectId,

    @JsonProperty("project_name")
    String projectName,

    @JsonProperty("status")
    ProjectStatus status,

    @JsonProperty("start_date")
    String startDate,

    @JsonProperty("end_date")
    String endDate,

    @JsonProperty("total_patients")
    Integer totalPatients,

    @JsonProperty("active_patients")
    Integer activePatients,

    @JsonProperty("completed_patients")
    Integer completedPatients,

    @JsonProperty("removed_patients")
    Integer removedPatients,

    @JsonProperty("average_compliance")
    Double averageCompliance,

    @JsonProperty("compliance_threshold")
    Integer complianceThreshold,

    @JsonProperty("is_compliant")
    Boolean isCompliant,

    @JsonProperty("team_size")
    Integer teamSize,

    @JsonProperty("stage_distribution")
    Map<TherapyStage, Integer> stageDistribution,

    @JsonProperty("compliance_by_patient")
    List<PatientComplianceEntry> complianceByPatient,

    @JsonProperty("recent_events")
    List<RecentEventEntry> recentEvents
) {

    /**
     * Patient compliance entry.
     */
    public record PatientComplianceEntry(
        @JsonProperty("patient_id")
        UUID patientId,

        @JsonProperty("patient_name")
        String patientName,

        @JsonProperty("compliance_score")
        Double complianceScore,

        @JsonProperty("current_stage")
        TherapyStage currentStage
    ) {}

    /**
     * Recent event entry.
     */
    public record RecentEventEntry(
        @JsonProperty("event_id")
        UUID eventId,

        @JsonProperty("event_type")
        String eventType,

        @JsonProperty("description")
        String description,

        @JsonProperty("scheduled_date")
        String scheduledDate,

        @JsonProperty("status")
        String status
    ) {}

    public static Builder builder() {
        return new Builder();
    }

    public static class Builder {
        private UUID projectId;
        private String projectName;
        private ProjectStatus status;
        private String startDate;
        private String endDate;
        private Integer totalPatients;
        private Integer activePatients;
        private Integer completedPatients;
        private Integer removedPatients;
        private Double averageCompliance;
        private Integer complianceThreshold;
        private Boolean isCompliant;
        private Integer teamSize;
        private Map<TherapyStage, Integer> stageDistribution;
        private List<PatientComplianceEntry> complianceByPatient;
        private List<RecentEventEntry> recentEvents;

        public Builder projectId(UUID projectId) {
            this.projectId = projectId;
            return this;
        }

        public Builder projectName(String projectName) {
            this.projectName = projectName;
            return this;
        }

        public Builder status(ProjectStatus status) {
            this.status = status;
            return this;
        }

        public Builder startDate(String startDate) {
            this.startDate = startDate;
            return this;
        }

        public Builder endDate(String endDate) {
            this.endDate = endDate;
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

        public Builder completedPatients(Integer completedPatients) {
            this.completedPatients = completedPatients;
            return this;
        }

        public Builder removedPatients(Integer removedPatients) {
            this.removedPatients = removedPatients;
            return this;
        }

        public Builder averageCompliance(Double averageCompliance) {
            this.averageCompliance = averageCompliance;
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

        public Builder teamSize(Integer teamSize) {
            this.teamSize = teamSize;
            return this;
        }

        public Builder stageDistribution(Map<TherapyStage, Integer> stageDistribution) {
            this.stageDistribution = stageDistribution;
            return this;
        }

        public Builder complianceByPatient(List<PatientComplianceEntry> complianceByPatient) {
            this.complianceByPatient = complianceByPatient;
            return this;
        }

        public Builder recentEvents(List<RecentEventEntry> recentEvents) {
            this.recentEvents = recentEvents;
            return this;
        }

        public ProjectStatsDto build() {
            return new ProjectStatsDto(
                projectId,
                projectName,
                status,
                startDate,
                endDate,
                totalPatients,
                activePatients,
                completedPatients,
                removedPatients,
                averageCompliance,
                complianceThreshold,
                isCompliant,
                teamSize,
                stageDistribution,
                complianceByPatient,
                recentEvents
            );
        }
    }
}
