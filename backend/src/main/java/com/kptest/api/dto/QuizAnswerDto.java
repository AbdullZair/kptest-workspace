package com.kptest.api.dto;

import com.fasterxml.jackson.annotation.JsonProperty;
import com.kptest.domain.quiz.QuizAnswer;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

import java.time.Instant;
import java.util.UUID;

/**
 * DTO for QuizAnswer entity.
 */
public record QuizAnswerDto(
    @JsonProperty("id")
    UUID id,

    @JsonProperty("question_id")
    UUID questionId,

    @JsonProperty("order_index")
    @NotNull(message = "Order index is required")
    Integer orderIndex,

    @JsonProperty("answer")
    @NotBlank(message = "Answer text is required")
    String answer,

    @JsonProperty("correct")
    @NotNull(message = "Correct flag is required")
    Boolean correct,

    @JsonProperty("explanation")
    String explanation,

    @JsonProperty("created_at")
    Instant createdAt,

    @JsonProperty("updated_at")
    Instant updatedAt
) {

    public static QuizAnswerDto fromAnswer(QuizAnswer answer) {
        return new QuizAnswerDto(
            answer.getId(),
            answer.getQuestion() != null ? answer.getQuestion().getId() : null,
            answer.getOrderIndex(),
            answer.getAnswer(),
            answer.getCorrect(),
            answer.getExplanation(),
            answer.getCreatedAt(),
            answer.getUpdatedAt()
        );
    }

    /**
     * Builder for QuizAnswerDto.
     */
    public static class Builder {
        private UUID id;
        private UUID questionId;
        private Integer orderIndex;
        private String answer;
        private Boolean correct;
        private String explanation;
        private Instant createdAt;
        private Instant updatedAt;

        public Builder id(UUID id) { this.id = id; return this; }
        public Builder questionId(UUID questionId) { this.questionId = questionId; return this; }
        public Builder orderIndex(Integer orderIndex) { this.orderIndex = orderIndex; return this; }
        public Builder answer(String answer) { this.answer = answer; return this; }
        public Builder correct(Boolean correct) { this.correct = correct; return this; }
        public Builder explanation(String explanation) { this.explanation = explanation; return this; }
        public Builder createdAt(Instant createdAt) { this.createdAt = createdAt; return this; }
        public Builder updatedAt(Instant updatedAt) { this.updatedAt = updatedAt; return this; }

        public QuizAnswerDto build() {
            return new QuizAnswerDto(
                id, questionId, orderIndex, answer, correct, explanation, createdAt, updatedAt
            );
        }
    }

    public static Builder builder() {
        return new Builder();
    }
}
