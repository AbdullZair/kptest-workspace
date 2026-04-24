package com.kptest.api.dto;

import com.fasterxml.jackson.annotation.JsonProperty;

import java.util.List;
import java.util.Map;
import java.util.UUID;

/**
 * DTO for material statistics report.
 */
public record MaterialStatsDto(
    @JsonProperty("project_id")
    UUID projectId,

    @JsonProperty("project_name")
    String projectName,

    @JsonProperty("total_materials")
    Integer totalMaterials,

    @JsonProperty("materials_assigned")
    Integer materialsAssigned,

    @JsonProperty("materials_completed")
    Integer materialsCompleted,

    @JsonProperty("materials_in_progress")
    Integer materialsInProgress,

    @JsonProperty("materials_not_started")
    Integer materialsNotStarted,

    @JsonProperty("completion_rate")
    Double completionRate,

    @JsonProperty("average_completion_time_days")
    Double averageCompletionTimeDays,

    @JsonProperty("materials_by_category")
    Map<String, Integer> materialsByCategory,

    @JsonProperty("materials_list")
    List<MaterialEntry> materialsList,

    @JsonProperty("patient_progress")
    List<PatientMaterialProgress> patientProgress
) {

    /**
     * Material entry.
     */
    public record MaterialEntry(
        @JsonProperty("material_id")
        UUID materialId,

        @JsonProperty("title")
        String title,

        @JsonProperty("category")
        String category,

        @JsonProperty("assigned_count")
        Integer assignedCount,

        @JsonProperty("completed_count")
        Integer completedCount,

        @JsonProperty("completion_rate")
        Double completionRate
    ) {}

    /**
     * Patient material progress.
     */
    public record PatientMaterialProgress(
        @JsonProperty("patient_id")
        UUID patientId,

        @JsonProperty("patient_name")
        String patientName,

        @JsonProperty("materials_assigned")
        Integer materialsAssigned,

        @JsonProperty("materials_completed")
        Integer materialsCompleted,

        @JsonProperty("progress_percentage")
        Double progressPercentage
    ) {}

    public static Builder builder() {
        return new Builder();
    }

    public static class Builder {
        private UUID projectId;
        private String projectName;
        private Integer totalMaterials;
        private Integer materialsAssigned;
        private Integer materialsCompleted;
        private Integer materialsInProgress;
        private Integer materialsNotStarted;
        private Double completionRate;
        private Double averageCompletionTimeDays;
        private Map<String, Integer> materialsByCategory;
        private List<MaterialEntry> materialsList;
        private List<PatientMaterialProgress> patientProgress;

        public Builder projectId(UUID projectId) {
            this.projectId = projectId;
            return this;
        }

        public Builder projectName(String projectName) {
            this.projectName = projectName;
            return this;
        }

        public Builder totalMaterials(Integer totalMaterials) {
            this.totalMaterials = totalMaterials;
            return this;
        }

        public Builder materialsAssigned(Integer materialsAssigned) {
            this.materialsAssigned = materialsAssigned;
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

        public Builder materialsNotStarted(Integer materialsNotStarted) {
            this.materialsNotStarted = materialsNotStarted;
            return this;
        }

        public Builder completionRate(Double completionRate) {
            this.completionRate = completionRate;
            return this;
        }

        public Builder averageCompletionTimeDays(Double averageCompletionTimeDays) {
            this.averageCompletionTimeDays = averageCompletionTimeDays;
            return this;
        }

        public Builder materialsByCategory(Map<String, Integer> materialsByCategory) {
            this.materialsByCategory = materialsByCategory;
            return this;
        }

        public Builder materialsList(List<MaterialEntry> materialsList) {
            this.materialsList = materialsList;
            return this;
        }

        public Builder patientProgress(List<PatientMaterialProgress> patientProgress) {
            this.patientProgress = patientProgress;
            return this;
        }

        public MaterialStatsDto build() {
            return new MaterialStatsDto(
                projectId,
                projectName,
                totalMaterials,
                materialsAssigned,
                materialsCompleted,
                materialsInProgress,
                materialsNotStarted,
                completionRate,
                averageCompletionTimeDays,
                materialsByCategory,
                materialsList,
                patientProgress
            );
        }
    }
}
