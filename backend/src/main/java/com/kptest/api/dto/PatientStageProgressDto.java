package com.kptest.api.dto;

import com.fasterxml.jackson.annotation.JsonProperty;
import com.kptest.domain.project.PatientStageProgress;

import java.time.Instant;
import java.util.UUID;

/**
 * DTO for PatientStageProgress.
 */
public record PatientStageProgressDto(
    @JsonProperty("id")
    UUID id,

    @JsonProperty("patient_project_id")
    UUID patientProjectId,

    @JsonProperty("stage_id")
    UUID stageId,

    @JsonProperty("stage_name")
    String stageName,

    @JsonProperty("started_at")
    Instant startedAt,

    @JsonProperty("completed_at")
    Instant completedAt,

    @JsonProperty("unlocked_at")
    Instant unlockedAt,

    @JsonProperty("status")
    PatientStageProgress.StageStatus status,

    @JsonProperty("completed_by")
    UUID completedBy,

    @JsonProperty("completion_reason")
    String completionReason,

    @JsonProperty("created_at")
    Instant createdAt,

    @JsonProperty("updated_at")
    Instant updatedAt
) {

    public static PatientStageProgressDto fromProgress(PatientStageProgress progress) {
        return new PatientStageProgressDto(
            progress.getId(),
            progress.getPatientProject().getId(),
            progress.getStage().getId(),
            progress.getStage().getName(),
            progress.getStartedAt(),
            progress.getCompletedAt(),
            progress.getUnlockedAt(),
            progress.getStatus(),
            progress.getCompletedBy(),
            progress.getCompletionReason(),
            progress.getCreatedAt(),
            progress.getUpdatedAt()
        );
    }

    /**
     * Builder for PatientStageProgressDto.
     */
    public static class Builder {
        private UUID id;
        private UUID patientProjectId;
        private UUID stageId;
        private String stageName;
        private Instant startedAt;
        private Instant completedAt;
        private Instant unlockedAt;
        private PatientStageProgress.StageStatus status;
        private UUID completedBy;
        private String completionReason;
        private Instant createdAt;
        private Instant updatedAt;

        public Builder id(UUID id) { this.id = id; return this; }
        public Builder patientProjectId(UUID patientProjectId) { this.patientProjectId = patientProjectId; return this; }
        public Builder stageId(UUID stageId) { this.stageId = stageId; return this; }
        public Builder stageName(String stageName) { this.stageName = stageName; return this; }
        public Builder startedAt(Instant startedAt) { this.startedAt = startedAt; return this; }
        public Builder completedAt(Instant completedAt) { this.completedAt = completedAt; return this; }
        public Builder unlockedAt(Instant unlockedAt) { this.unlockedAt = unlockedAt; return this; }
        public Builder status(PatientStageProgress.StageStatus status) { this.status = status; return this; }
        public Builder completedBy(UUID completedBy) { this.completedBy = completedBy; return this; }
        public Builder completionReason(String completionReason) { this.completionReason = completionReason; return this; }
        public Builder createdAt(Instant createdAt) { this.createdAt = createdAt; return this; }
        public Builder updatedAt(Instant updatedAt) { this.updatedAt = updatedAt; return this; }

        public PatientStageProgressDto build() {
            return new PatientStageProgressDto(
                id, patientProjectId, stageId, stageName, startedAt, completedAt,
                unlockedAt, status, completedBy, completionReason, createdAt, updatedAt
            );
        }
    }

    public static Builder builder() {
        return new Builder();
    }
}
