package com.kptest.api.dto;

import com.fasterxml.jackson.annotation.JsonProperty;
import com.kptest.domain.quiz.QuizAttempt;

import java.time.Instant;
import java.util.List;
import java.util.UUID;

/**
 * DTO for QuizAttempt entity.
 */
public record QuizAttemptDto(
    @JsonProperty("id")
    UUID id,

    @JsonProperty("quiz_id")
    UUID quizId,

    @JsonProperty("quiz_title")
    String quizTitle,

    @JsonProperty("patient_id")
    UUID patientId,

    @JsonProperty("patient_name")
    String patientName,

    @JsonProperty("started_at")
    Instant startedAt,

    @JsonProperty("completed_at")
    Instant completedAt,

    @JsonProperty("score")
    Integer score,

    @JsonProperty("max_score")
    Integer maxScore,

    @JsonProperty("percentage")
    Double percentage,

    @JsonProperty("passed")
    Boolean passed,

    @JsonProperty("time_spent_seconds")
    Integer timeSpentSeconds,

    @JsonProperty("answer_selections")
    List<QuizAnswerSelectionDto> answerSelections,

    @JsonProperty("created_at")
    Instant createdAt,

    @JsonProperty("updated_at")
    Instant updatedAt
) {

    public static QuizAttemptDto fromAttempt(QuizAttempt attempt, boolean includeDetails) {
        List<QuizAnswerSelectionDto> selections = includeDetails
            ? attempt.getAnswerSelections().stream()
                .map(QuizAnswerSelectionDto::fromSelection)
                .toList()
            : null;

        return new QuizAttemptDto(
            attempt.getId(),
            attempt.getQuiz().getId(),
            attempt.getQuiz().getTitle(),
            attempt.getPatient().getId(),
            attempt.getPatient().getFirstName() + " " + attempt.getPatient().getLastName(),
            attempt.getStartedAt(),
            attempt.getCompletedAt(),
            attempt.getScore(),
            attempt.getMaxScore(),
            attempt.getPercentage(),
            attempt.getPassed(),
            attempt.getTimeSpentSeconds(),
            selections,
            attempt.getCreatedAt(),
            attempt.getUpdatedAt()
        );
    }

    public static QuizAttemptDto fromAttemptSummary(QuizAttempt attempt) {
        return new QuizAttemptDto(
            attempt.getId(),
            attempt.getQuiz().getId(),
            attempt.getQuiz().getTitle(),
            attempt.getPatient().getId(),
            attempt.getPatient().getFirstName() + " " + attempt.getPatient().getLastName(),
            attempt.getStartedAt(),
            attempt.getCompletedAt(),
            attempt.getScore(),
            attempt.getMaxScore(),
            attempt.getPercentage(),
            attempt.getPassed(),
            attempt.getTimeSpentSeconds(),
            null,
            attempt.getCreatedAt(),
            attempt.getUpdatedAt()
        );
    }

    /**
     * Builder for QuizAttemptDto.
     */
    public static class Builder {
        private UUID id;
        private UUID quizId;
        private String quizTitle;
        private UUID patientId;
        private String patientName;
        private Instant startedAt;
        private Instant completedAt;
        private Integer score;
        private Integer maxScore;
        private Double percentage;
        private Boolean passed;
        private Integer timeSpentSeconds;
        private List<QuizAnswerSelectionDto> answerSelections;
        private Instant createdAt;
        private Instant updatedAt;

        public Builder id(UUID id) { this.id = id; return this; }
        public Builder quizId(UUID quizId) { this.quizId = quizId; return this; }
        public Builder quizTitle(String quizTitle) { this.quizTitle = quizTitle; return this; }
        public Builder patientId(UUID patientId) { this.patientId = patientId; return this; }
        public Builder patientName(String patientName) { this.patientName = patientName; return this; }
        public Builder startedAt(Instant startedAt) { this.startedAt = startedAt; return this; }
        public Builder completedAt(Instant completedAt) { this.completedAt = completedAt; return this; }
        public Builder score(Integer score) { this.score = score; return this; }
        public Builder maxScore(Integer maxScore) { this.maxScore = maxScore; return this; }
        public Builder percentage(Double percentage) { this.percentage = percentage; return this; }
        public Builder passed(Boolean passed) { this.passed = passed; return this; }
        public Builder timeSpentSeconds(Integer timeSpentSeconds) { this.timeSpentSeconds = timeSpentSeconds; return this; }
        public Builder answerSelections(List<QuizAnswerSelectionDto> answerSelections) { this.answerSelections = answerSelections; return this; }
        public Builder createdAt(Instant createdAt) { this.createdAt = createdAt; return this; }
        public Builder updatedAt(Instant updatedAt) { this.updatedAt = updatedAt; return this; }

        public QuizAttemptDto build() {
            return new QuizAttemptDto(
                id, quizId, quizTitle, patientId, patientName, startedAt, completedAt,
                score, maxScore, percentage, passed, timeSpentSeconds, answerSelections, createdAt, updatedAt
            );
        }
    }

    public static Builder builder() {
        return new Builder();
    }
}
