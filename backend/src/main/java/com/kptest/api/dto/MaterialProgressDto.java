package com.kptest.api.dto;

import com.fasterxml.jackson.annotation.JsonProperty;
import com.kptest.domain.material.MaterialProgress;
import com.kptest.domain.material.MaterialProgress.MaterialStatus;

import java.time.Instant;
import java.util.UUID;

/**
 * MaterialProgress DTO for tracking patient progress.
 */
public record MaterialProgressDto(
    @JsonProperty("id")
    UUID id,

    @JsonProperty("material_id")
    UUID materialId,

    @JsonProperty("patient_id")
    UUID patientId,

    @JsonProperty("status")
    MaterialStatus status,

    @JsonProperty("started_at")
    Instant startedAt,

    @JsonProperty("completed_at")
    Instant completedAt,

    @JsonProperty("time_spent_seconds")
    Integer timeSpentSeconds,

    @JsonProperty("quiz_score")
    Integer quizScore,

    @JsonProperty("created_at")
    Instant createdAt,

    @JsonProperty("updated_at")
    Instant updatedAt
) {

    public static MaterialProgressDto fromProgress(MaterialProgress progress) {
        return new MaterialProgressDto(
            progress.getId(),
            progress.getMaterialId(),
            progress.getPatientId(),
            progress.getStatus(),
            progress.getStartedAt(),
            progress.getCompletedAt(),
            progress.getTimeSpentSeconds(),
            progress.getQuizScore(),
            progress.getCreatedAt(),
            progress.getUpdatedAt()
        );
    }

    /**
     * Builder for MaterialProgressDto.
     */
    public static class Builder {
        private UUID id;
        private UUID materialId;
        private UUID patientId;
        private MaterialStatus status;
        private Instant startedAt;
        private Instant completedAt;
        private Integer timeSpentSeconds;
        private Integer quizScore;
        private Instant createdAt;
        private Instant updatedAt;

        public Builder id(UUID id) {
            this.id = id;
            return this;
        }

        public Builder materialId(UUID materialId) {
            this.materialId = materialId;
            return this;
        }

        public Builder patientId(UUID patientId) {
            this.patientId = patientId;
            return this;
        }

        public Builder status(MaterialStatus status) {
            this.status = status;
            return this;
        }

        public Builder startedAt(Instant startedAt) {
            this.startedAt = startedAt;
            return this;
        }

        public Builder completedAt(Instant completedAt) {
            this.completedAt = completedAt;
            return this;
        }

        public Builder timeSpentSeconds(Integer timeSpentSeconds) {
            this.timeSpentSeconds = timeSpentSeconds;
            return this;
        }

        public Builder quizScore(Integer quizScore) {
            this.quizScore = quizScore;
            return this;
        }

        public Builder createdAt(Instant createdAt) {
            this.createdAt = createdAt;
            return this;
        }

        public Builder updatedAt(Instant updatedAt) {
            this.updatedAt = updatedAt;
            return this;
        }

        public MaterialProgressDto build() {
            return new MaterialProgressDto(
                id, materialId, patientId, status, startedAt, completedAt,
                timeSpentSeconds, quizScore, createdAt, updatedAt
            );
        }
    }

    public static Builder builder() {
        return new Builder();
    }
}
