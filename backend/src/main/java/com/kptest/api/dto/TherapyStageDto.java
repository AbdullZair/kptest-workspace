package com.kptest.api.dto;

import com.fasterxml.jackson.annotation.JsonProperty;
import com.kptest.domain.project.TherapyStageEntity;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

import java.time.Instant;
import java.util.List;
import java.util.UUID;

/**
 * DTO for TherapyStageEntity.
 */
public record TherapyStageDto(
    @JsonProperty("id")
    UUID id,

    @JsonProperty("name")
    @NotBlank(message = "Stage name is required")
    String name,

    @JsonProperty("description")
    String description,

    @JsonProperty("project_id")
    @NotNull(message = "Project ID is required")
    UUID projectId,

    @JsonProperty("order_index")
    @NotNull(message = "Order index is required")
    Integer orderIndex,

    @JsonProperty("unlock_mode")
    @NotNull(message = "Unlock mode is required")
    TherapyStageEntity.UnlockMode unlockMode,

    @JsonProperty("required_quiz_id")
    UUID requiredQuizId,

    @JsonProperty("required_quiz_title")
    String requiredQuizTitle,

    @JsonProperty("is_active")
    Boolean active,

    @JsonProperty("created_by")
    UUID createdBy,

    @JsonProperty("created_at")
    Instant createdAt,

    @JsonProperty("updated_at")
    Instant updatedAt
) {

    public static TherapyStageDto fromStage(TherapyStageEntity stage) {
        UUID requiredQuizId = stage.getRequiredQuiz() != null ? stage.getRequiredQuiz().getQuizId() : null;
        String requiredQuizTitle = stage.getRequiredQuiz() != null ? stage.getRequiredQuiz().getQuizTitle() : null;

        return new TherapyStageDto(
            stage.getId(),
            stage.getName(),
            stage.getDescription(),
            stage.getProject().getId(),
            stage.getOrderIndex(),
            stage.getUnlockMode(),
            requiredQuizId,
            requiredQuizTitle,
            stage.getActive(),
            stage.getCreatedBy(),
            stage.getCreatedAt(),
            stage.getUpdatedAt()
        );
    }

    /**
     * Builder for TherapyStageDto.
     */
    public static class Builder {
        private UUID id;
        private String name;
        private String description;
        private UUID projectId;
        private Integer orderIndex;
        private TherapyStageEntity.UnlockMode unlockMode;
        private UUID requiredQuizId;
        private String requiredQuizTitle;
        private Boolean active;
        private UUID createdBy;
        private Instant createdAt;
        private Instant updatedAt;

        public Builder id(UUID id) { this.id = id; return this; }
        public Builder name(String name) { this.name = name; return this; }
        public Builder description(String description) { this.description = description; return this; }
        public Builder projectId(UUID projectId) { this.projectId = projectId; return this; }
        public Builder orderIndex(Integer orderIndex) { this.orderIndex = orderIndex; return this; }
        public Builder unlockMode(TherapyStageEntity.UnlockMode unlockMode) { this.unlockMode = unlockMode; return this; }
        public Builder requiredQuizId(UUID requiredQuizId) { this.requiredQuizId = requiredQuizId; return this; }
        public Builder requiredQuizTitle(String requiredQuizTitle) { this.requiredQuizTitle = requiredQuizTitle; return this; }
        public Builder active(Boolean active) { this.active = active; return this; }
        public Builder createdBy(UUID createdBy) { this.createdBy = createdBy; return this; }
        public Builder createdAt(Instant createdAt) { this.createdAt = createdAt; return this; }
        public Builder updatedAt(Instant updatedAt) { this.updatedAt = updatedAt; return this; }

        public TherapyStageDto build() {
            return new TherapyStageDto(
                id, name, description, projectId, orderIndex, unlockMode,
                requiredQuizId, requiredQuizTitle, active, createdBy, createdAt, updatedAt
            );
        }
    }

    public static Builder builder() {
        return new Builder();
    }
}
