package com.kptest.api.dto;

import com.fasterxml.jackson.annotation.JsonProperty;
import com.kptest.domain.material.EducationalMaterial;
import com.kptest.domain.material.EducationalMaterial.DifficultyLevel;
import com.kptest.domain.material.EducationalMaterial.MaterialType;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

import java.time.Instant;
import java.util.List;
import java.util.UUID;

/**
 * EducationalMaterial DTO for creating and updating materials.
 */
public record EducationalMaterialDto(
    @JsonProperty("id")
    UUID id,

    @JsonProperty("project_id")
    @NotNull(message = "Project ID is required")
    UUID projectId,

    @JsonProperty("title")
    @NotBlank(message = "Title is required")
    @Size(max = 255, message = "Title must be less than 255 characters")
    String title,

    @JsonProperty("content")
    @NotBlank(message = "Content is required")
    String content,

    @JsonProperty("type")
    @NotNull(message = "Type is required")
    MaterialType type,

    @JsonProperty("file_url")
    @Size(max = 500, message = "File URL must be less than 500 characters")
    String fileUrl,

    @JsonProperty("external_url")
    @Size(max = 500, message = "External URL must be less than 500 characters")
    String externalUrl,

    @JsonProperty("category")
    @Size(max = 100, message = "Category must be less than 100 characters")
    String category,

    @JsonProperty("difficulty")
    @NotNull(message = "Difficulty is required")
    DifficultyLevel difficulty,

    @JsonProperty("assigned_to_patients")
    List<UUID> assignedToPatients,

    @JsonProperty("assigned_to_stages")
    List<UUID> assignedToStages,

    @JsonProperty("view_count")
    Integer viewCount,

    @JsonProperty("completion_count")
    Integer completionCount,

    @JsonProperty("published")
    Boolean published,

    @JsonProperty("created_by")
    UUID createdBy,

    @JsonProperty("published_at")
    Instant publishedAt,

    @JsonProperty("created_at")
    Instant createdAt,

    @JsonProperty("updated_at")
    Instant updatedAt
) {

    public static EducationalMaterialDto fromMaterial(EducationalMaterial material) {
        return new EducationalMaterialDto(
            material.getId(),
            material.getProjectId(),
            material.getTitle(),
            material.getContent(),
            material.getType(),
            material.getFileUrl(),
            material.getExternalUrl(),
            material.getCategory(),
            material.getDifficulty(),
            material.getAssignedToPatients(),
            material.getAssignedToStages(),
            material.getViewCount(),
            material.getCompletionCount(),
            material.getPublished(),
            material.getCreatedBy(),
            material.getPublishedAt(),
            material.getCreatedAt(),
            material.getUpdatedAt()
        );
    }

    /**
     * Builder for EducationalMaterialDto.
     */
    public static class Builder {
        private UUID id;
        private UUID projectId;
        private String title;
        private String content;
        private MaterialType type;
        private String fileUrl;
        private String externalUrl;
        private String category;
        private DifficultyLevel difficulty;
        private List<UUID> assignedToPatients;
        private List<UUID> assignedToStages;
        private Integer viewCount;
        private Integer completionCount;
        private Boolean published;
        private UUID createdBy;
        private Instant publishedAt;
        private Instant createdAt;
        private Instant updatedAt;

        public Builder id(UUID id) {
            this.id = id;
            return this;
        }

        public Builder projectId(UUID projectId) {
            this.projectId = projectId;
            return this;
        }

        public Builder title(String title) {
            this.title = title;
            return this;
        }

        public Builder content(String content) {
            this.content = content;
            return this;
        }

        public Builder type(MaterialType type) {
            this.type = type;
            return this;
        }

        public Builder fileUrl(String fileUrl) {
            this.fileUrl = fileUrl;
            return this;
        }

        public Builder externalUrl(String externalUrl) {
            this.externalUrl = externalUrl;
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

        public Builder assignedToPatients(List<UUID> assignedToPatients) {
            this.assignedToPatients = assignedToPatients;
            return this;
        }

        public Builder assignedToStages(List<UUID> assignedToStages) {
            this.assignedToStages = assignedToStages;
            return this;
        }

        public Builder viewCount(Integer viewCount) {
            this.viewCount = viewCount;
            return this;
        }

        public Builder completionCount(Integer completionCount) {
            this.completionCount = completionCount;
            return this;
        }

        public Builder published(Boolean published) {
            this.published = published;
            return this;
        }

        public Builder createdBy(UUID createdBy) {
            this.createdBy = createdBy;
            return this;
        }

        public Builder publishedAt(Instant publishedAt) {
            this.publishedAt = publishedAt;
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

        public EducationalMaterialDto build() {
            return new EducationalMaterialDto(
                id, projectId, title, content, type, fileUrl, externalUrl,
                category, difficulty, assignedToPatients, assignedToStages,
                viewCount, completionCount, published, createdBy, publishedAt,
                createdAt, updatedAt
            );
        }
    }

    public static Builder builder() {
        return new Builder();
    }
}
