package com.kptest.api.dto;

import com.fasterxml.jackson.annotation.JsonProperty;
import com.kptest.domain.quiz.Quiz;
import com.kptest.domain.quiz.QuizQuestion;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

import java.time.Instant;
import java.util.List;
import java.util.UUID;

/**
 * DTO for Quiz entity.
 */
public record QuizDto(
    @JsonProperty("id")
    UUID id,

    @JsonProperty("title")
    @NotBlank(message = "Title is required")
    @Size(max = 255, message = "Title must be less than 255 characters")
    String title,

    @JsonProperty("description")
    String description,

    @JsonProperty("project_id")
    @NotNull(message = "Project ID is required")
    UUID projectId,

    @JsonProperty("pass_threshold")
    @NotNull(message = "Pass threshold is required")
    Integer passThreshold,

    @JsonProperty("time_limit_seconds")
    Integer timeLimitSeconds,

    @JsonProperty("active")
    Boolean active,

    @JsonProperty("created_by")
    UUID createdBy,

    @JsonProperty("questions")
    List<QuizQuestionDto> questions,

    @JsonProperty("max_score")
    Integer maxScore,

    @JsonProperty("created_at")
    Instant createdAt,

    @JsonProperty("updated_at")
    Instant updatedAt
) {

    public static QuizDto fromQuiz(Quiz quiz) {
        List<QuizQuestionDto> questionDtos = quiz.getQuestions().stream()
            .map(QuizQuestionDto::fromQuestion)
            .toList();

        return new QuizDto(
            quiz.getId(),
            quiz.getTitle(),
            quiz.getDescription(),
            quiz.getProject().getId(),
            quiz.getPassThreshold(),
            quiz.getTimeLimitSeconds(),
            quiz.getActive(),
            quiz.getCreatedBy(),
            questionDtos,
            quiz.getMaxScore(),
            quiz.getCreatedAt(),
            quiz.getUpdatedAt()
        );
    }

    public static QuizDto fromQuizWithoutAnswers(Quiz quiz) {
        List<QuizQuestionDto> questionDtos = quiz.getQuestions().stream()
            .map(QuizQuestionDto::fromQuestionWithoutAnswers)
            .toList();

        return new QuizDto(
            quiz.getId(),
            quiz.getTitle(),
            quiz.getDescription(),
            quiz.getProject().getId(),
            quiz.getPassThreshold(),
            quiz.getTimeLimitSeconds(),
            quiz.getActive(),
            quiz.getCreatedBy(),
            questionDtos,
            quiz.getMaxScore(),
            quiz.getCreatedAt(),
            quiz.getUpdatedAt()
        );
    }

    /**
     * Builder for QuizDto.
     */
    public static class Builder {
        private UUID id;
        private String title;
        private String description;
        private UUID projectId;
        private Integer passThreshold;
        private Integer timeLimitSeconds;
        private Boolean active;
        private UUID createdBy;
        private List<QuizQuestionDto> questions;
        private Integer maxScore;
        private Instant createdAt;
        private Instant updatedAt;

        public Builder id(UUID id) { this.id = id; return this; }
        public Builder title(String title) { this.title = title; return this; }
        public Builder description(String description) { this.description = description; return this; }
        public Builder projectId(UUID projectId) { this.projectId = projectId; return this; }
        public Builder passThreshold(Integer passThreshold) { this.passThreshold = passThreshold; return this; }
        public Builder timeLimitSeconds(Integer timeLimitSeconds) { this.timeLimitSeconds = timeLimitSeconds; return this; }
        public Builder active(Boolean active) { this.active = active; return this; }
        public Builder createdBy(UUID createdBy) { this.createdBy = createdBy; return this; }
        public Builder questions(List<QuizQuestionDto> questions) { this.questions = questions; return this; }
        public Builder maxScore(Integer maxScore) { this.maxScore = maxScore; return this; }
        public Builder createdAt(Instant createdAt) { this.createdAt = createdAt; return this; }
        public Builder updatedAt(Instant updatedAt) { this.updatedAt = updatedAt; return this; }

        public QuizDto build() {
            return new QuizDto(
                id, title, description, projectId, passThreshold, timeLimitSeconds,
                active, createdBy, questions, maxScore, createdAt, updatedAt
            );
        }
    }

    public static Builder builder() {
        return new Builder();
    }
}
