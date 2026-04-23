package com.kptest.api.dto;

import com.fasterxml.jackson.annotation.JsonProperty;
import com.kptest.domain.material.EducationalMaterial.DifficultyLevel;
import com.kptest.domain.material.EducationalMaterial.MaterialType;

import java.util.UUID;

/**
 * Material search request with filtering.
 */
public record MaterialFilters(
    @JsonProperty("project_id")
    UUID projectId,

    @JsonProperty("category")
    String category,

    @JsonProperty("difficulty")
    DifficultyLevel difficulty,

    @JsonProperty("type")
    MaterialType type,

    @JsonProperty("published")
    Boolean published,

    @JsonProperty("patient_id")
    UUID patientId,

    @JsonProperty("stage_id")
    UUID stageId,

    @JsonProperty("query")
    String query
) {

    /**
     * Builder for MaterialFilters.
     */
    public static class Builder {
        private UUID projectId;
        private String category;
        private DifficultyLevel difficulty;
        private MaterialType type;
        private Boolean published;
        private UUID patientId;
        private UUID stageId;
        private String query;

        public Builder projectId(UUID projectId) {
            this.projectId = projectId;
            return this;
        }

        public Builder category(String category) {
            this.category = category;
            return this;
        }

        public Builder difficulty(DifficultyLevel difficulty) {
            this.difficulty = difficulty;
            return this;
        }

        public Builder type(MaterialType type) {
            this.type = type;
            return this;
        }

        public Builder published(Boolean published) {
            this.published = published;
            return this;
        }

        public Builder patientId(UUID patientId) {
            this.patientId = patientId;
            return this;
        }

        public Builder stageId(UUID stageId) {
            this.stageId = stageId;
            return this;
        }

        public Builder query(String query) {
            this.query = query;
            return this;
        }

        public MaterialFilters build() {
            return new MaterialFilters(
                projectId, category, difficulty, type, published,
                patientId, stageId, query
            );
        }
    }

    public static Builder builder() {
        return new Builder();
    }
}
