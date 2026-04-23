package com.kptest.api.dto;

import com.fasterxml.jackson.annotation.JsonProperty;
import com.kptest.domain.project.ProjectStatus;
import com.kptest.domain.project.TherapyStage;

import java.util.List;
import java.util.Map;
import java.util.UUID;

/**
 * DTO for project statistics response.
 */
public record ProjectStatisticsResponse(
    @JsonProperty("project_id")
    UUID projectId,

    @JsonProperty("project_name")
    String projectName,

    @JsonProperty("status")
    ProjectStatus status,

    @JsonProperty("total_patients")
    Long totalPatients,

    @JsonProperty("active_patients")
    Long activePatients,

    @JsonProperty("completed_patients")
    Long completedPatients,

    @JsonProperty("removed_patients")
    Long removedPatients,

    @JsonProperty("team_members")
    Long teamMembers,

    @JsonProperty("average_compliance_score")
    Double averageComplianceScore,

    @JsonProperty("compliance_distribution")
    Map<String, Long> complianceDistribution,

    @JsonProperty("stage_distribution")
    Map<TherapyStage, Long> stageDistribution,

    @JsonProperty("recent_activity")
    List<ActivityEntry> recentActivity
) {

    /**
     * Activity entry for recent activity list.
     */
    public record ActivityEntry(
        @JsonProperty("type")
        String type,

        @JsonProperty("description")
        String description,

        @JsonProperty("timestamp")
        String timestamp,

        @JsonProperty("user_name")
        String userName
    ) {}

    public static ProjectStatisticsResponse.Builder builder() {
        return new ProjectStatisticsResponse.Builder();
    }

    public static class Builder {
        private UUID projectId;
        private String projectName;
        private ProjectStatus status;
        private Long totalPatients = 0L;
        private Long activePatients = 0L;
        private Long completedPatients = 0L;
        private Long removedPatients = 0L;
        private Long teamMembers = 0L;
        private Double averageComplianceScore;
        private Map<String, Long> complianceDistribution;
        private Map<TherapyStage, Long> stageDistribution;
        private List<ActivityEntry> recentActivity;

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

        public Builder totalPatients(Long totalPatients) {
            this.totalPatients = totalPatients;
            return this;
        }

        public Builder activePatients(Long activePatients) {
            this.activePatients = activePatients;
            return this;
        }

        public Builder completedPatients(Long completedPatients) {
            this.completedPatients = completedPatients;
            return this;
        }

        public Builder removedPatients(Long removedPatients) {
            this.removedPatients = removedPatients;
            return this;
        }

        public Builder teamMembers(Long teamMembers) {
            this.teamMembers = teamMembers;
            return this;
        }

        public Builder averageComplianceScore(Double averageComplianceScore) {
            this.averageComplianceScore = averageComplianceScore;
            return this;
        }

        public Builder complianceDistribution(Map<String, Long> complianceDistribution) {
            this.complianceDistribution = complianceDistribution;
            return this;
        }

        public Builder stageDistribution(Map<TherapyStage, Long> stageDistribution) {
            this.stageDistribution = stageDistribution;
            return this;
        }

        public Builder recentActivity(List<ActivityEntry> recentActivity) {
            this.recentActivity = recentActivity;
            return this;
        }

        public ProjectStatisticsResponse build() {
            return new ProjectStatisticsResponse(
                projectId,
                projectName,
                status,
                totalPatients,
                activePatients,
                completedPatients,
                removedPatients,
                teamMembers,
                averageComplianceScore,
                complianceDistribution,
                stageDistribution,
                recentActivity
            );
        }
    }
}
