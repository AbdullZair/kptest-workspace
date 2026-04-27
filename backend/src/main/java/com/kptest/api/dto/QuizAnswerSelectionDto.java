package com.kptest.api.dto;

import com.fasterxml.jackson.annotation.JsonProperty;
import com.kptest.domain.quiz.QuizAnswerSelection;

import java.time.Instant;
import java.util.List;
import java.util.UUID;

/**
 * DTO for QuizAnswerSelection entity.
 */
public record QuizAnswerSelectionDto(
    @JsonProperty("id")
    UUID id,

    @JsonProperty("question_id")
    UUID questionId,

    @JsonProperty("question_text")
    String questionText,

    @JsonProperty("selected_answer_ids")
    List<UUID> selectedAnswerIds,

    @JsonProperty("is_correct")
    Boolean isCorrect,

    @JsonProperty("points_earned")
    Integer pointsEarned,

    @JsonProperty("correct_answers")
    List<QuizAnswerDto> correctAnswers,

    @JsonProperty("created_at")
    Instant createdAt
) {

    public static QuizAnswerSelectionDto fromSelection(QuizAnswerSelection selection) {
        List<QuizAnswerDto> correctAnswers = selection.getQuestion().getCorrectAnswers().stream()
            .map(QuizAnswerDto::fromAnswer)
            .toList();

        return new QuizAnswerSelectionDto(
            selection.getId(),
            selection.getQuestion().getId(),
            selection.getQuestion().getQuestion(),
            selection.getSelectedAnswerIds(),
            selection.getIsCorrect(),
            selection.getPointsEarned(),
            correctAnswers,
            selection.getCreatedAt()
        );
    }

    /**
     * Builder for QuizAnswerSelectionDto.
     */
    public static class Builder {
        private UUID id;
        private UUID questionId;
        private String questionText;
        private List<UUID> selectedAnswerIds;
        private Boolean isCorrect;
        private Integer pointsEarned;
        private List<QuizAnswerDto> correctAnswers;
        private Instant createdAt;

        public Builder id(UUID id) { this.id = id; return this; }
        public Builder questionId(UUID questionId) { this.questionId = questionId; return this; }
        public Builder questionText(String questionText) { this.questionText = questionText; return this; }
        public Builder selectedAnswerIds(List<UUID> selectedAnswerIds) { this.selectedAnswerIds = selectedAnswerIds; return this; }
        public Builder isCorrect(Boolean isCorrect) { this.isCorrect = isCorrect; return this; }
        public Builder pointsEarned(Integer pointsEarned) { this.pointsEarned = pointsEarned; return this; }
        public Builder correctAnswers(List<QuizAnswerDto> correctAnswers) { this.correctAnswers = correctAnswers; return this; }
        public Builder createdAt(Instant createdAt) { this.createdAt = createdAt; return this; }

        public QuizAnswerSelectionDto build() {
            return new QuizAnswerSelectionDto(
                id, questionId, questionText, selectedAnswerIds, isCorrect, pointsEarned, correctAnswers, createdAt
            );
        }
    }

    public static Builder builder() {
        return new Builder();
    }
}
