package com.kptest.api.dto;

import com.fasterxml.jackson.annotation.JsonProperty;
import jakarta.validation.constraints.NotEmpty;
import jakarta.validation.constraints.NotNull;

import java.util.List;
import java.util.UUID;

/**
 * Request DTO for submitting quiz answers.
 */
public record SubmitQuizRequest(
    @JsonProperty("quiz_id")
    @NotNull(message = "Quiz ID is required")
    UUID quizId,

    @JsonProperty("patient_id")
    @NotNull(message = "Patient ID is required")
    UUID patientId,

    @JsonProperty("answers")
    @NotEmpty(message = "At least one answer is required")
    List<QuestionAnswerRequest> answers
) {
    public record QuestionAnswerRequest(
        @JsonProperty("question_id")
        @NotNull(message = "Question ID is required")
        UUID questionId,

        @JsonProperty("selected_answer_ids")
        @NotEmpty(message = "At least one answer must be selected")
        List<UUID> selectedAnswerIds
    ) {}
}
