package com.kptest.api.dto;

import com.fasterxml.jackson.annotation.JsonProperty;
import com.kptest.domain.quiz.QuizAnswer;
import com.kptest.domain.quiz.QuizQuestion;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

import java.time.Instant;
import java.util.List;
import java.util.UUID;

/**
 * DTO for QuizQuestion entity.
 */
public record QuizQuestionDto(
    @JsonProperty("id")
    UUID id,

    @JsonProperty("quiz_id")
    UUID quizId,

    @JsonProperty("order_index")
    @NotNull(message = "Order index is required")
    Integer orderIndex,

    @JsonProperty("question")
    @NotBlank(message = "Question text is required")
    String question,

    @JsonProperty("type")
    @NotNull(message = "Question type is required")
    QuizQuestion.QuestionType type,

    @JsonProperty("points")
    @NotNull(message = "Points are required")
    Integer points,

    @JsonProperty("explanation")
    String explanation,

    @JsonProperty("answers")
    List<QuizAnswerDto> answers,

    @JsonProperty("created_at")
    Instant createdAt,

    @JsonProperty("updated_at")
    Instant updatedAt
) {

    public static QuizQuestionDto fromQuestion(QuizQuestion question) {
        List<QuizAnswerDto> answerDtos = question.getAnswers().stream()
            .map(QuizAnswerDto::fromAnswer)
            .toList();

        return new QuizQuestionDto(
            question.getId(),
            question.getQuiz() != null ? question.getQuiz().getId() : null,
            question.getOrderIndex(),
            question.getQuestion(),
            question.getType(),
            question.getPoints(),
            question.getExplanation(),
            answerDtos,
            question.getCreatedAt(),
            question.getUpdatedAt()
        );
    }

    public static QuizQuestionDto fromQuestionWithoutAnswers(QuizQuestion question) {
        // Return question without answers (for taking quiz - answers hidden)
        return new QuizQuestionDto(
            question.getId(),
            question.getQuiz() != null ? question.getQuiz().getId() : null,
            question.getOrderIndex(),
            question.getQuestion(),
            question.getType(),
            question.getPoints(),
            question.getExplanation(),
            null, // No answers exposed
            question.getCreatedAt(),
            question.getUpdatedAt()
        );
    }

    /**
     * Builder for QuizQuestionDto.
     */
    public static class Builder {
        private UUID id;
        private UUID quizId;
        private Integer orderIndex;
        private String question;
        private QuizQuestion.QuestionType type;
        private Integer points;
        private String explanation;
        private List<QuizAnswerDto> answers;
        private Instant createdAt;
        private Instant updatedAt;

        public Builder id(UUID id) { this.id = id; return this; }
        public Builder quizId(UUID quizId) { this.quizId = quizId; return this; }
        public Builder orderIndex(Integer orderIndex) { this.orderIndex = orderIndex; return this; }
        public Builder question(String question) { this.question = question; return this; }
        public Builder type(QuizQuestion.QuestionType type) { this.type = type; return this; }
        public Builder points(Integer points) { this.points = points; return this; }
        public Builder explanation(String explanation) { this.explanation = explanation; return this; }
        public Builder answers(List<QuizAnswerDto> answers) { this.answers = answers; return this; }
        public Builder createdAt(Instant createdAt) { this.createdAt = createdAt; return this; }
        public Builder updatedAt(Instant updatedAt) { this.updatedAt = updatedAt; return this; }

        public QuizQuestionDto build() {
            return new QuizQuestionDto(
                id, quizId, orderIndex, question, type, points, explanation, answers, createdAt, updatedAt
            );
        }
    }

    public static Builder builder() {
        return new Builder();
    }
}
