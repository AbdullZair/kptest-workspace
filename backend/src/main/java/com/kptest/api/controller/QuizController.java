package com.kptest.api.controller;

import com.kptest.api.dto.QuizAttemptDto;
import com.kptest.api.dto.QuizDto;
import com.kptest.api.dto.SubmitQuizRequest;
import com.kptest.application.service.QuizService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

import java.net.URI;
import java.util.List;
import java.util.Map;
import java.util.UUID;

/**
 * REST Controller for Quiz management.
 */
@Slf4j
@RestController
@RequestMapping("/api/v1/quizzes")
@RequiredArgsConstructor
@Tag(name = "Quizzes", description = "Educational quiz management endpoints")
public class QuizController {

    private final QuizService quizService;

    /**
     * Get all quizzes for a project.
     */
    @GetMapping
    @PreAuthorize("hasAnyRole('ADMIN', 'DOCTOR', 'NURSE', 'RECEPTIONIST')")
    @Operation(summary = "Get quizzes by project", description = "Returns all quizzes for a project")
    public ResponseEntity<List<QuizDto>> getQuizzesByProject(
        @Parameter(description = "Project ID")
        @RequestParam UUID projectId
    ) {
        log.info("GET /api/v1/quizzes - projectId={}", projectId);

        List<QuizDto> quizzes = quizService.getQuizzesByProject(projectId);

        return ResponseEntity.ok(quizzes);
    }

    /**
     * Get active quizzes for a project.
     */
    @GetMapping("/active")
    @PreAuthorize("hasAnyRole('ADMIN', 'DOCTOR', 'NURSE', 'RECEPTIONIST', 'PATIENT')")
    @Operation(summary = "Get active quizzes", description = "Returns all active quizzes for a project")
    public ResponseEntity<List<QuizDto>> getActiveQuizzesByProject(
        @Parameter(description = "Project ID")
        @RequestParam UUID projectId
    ) {
        log.info("GET /api/v1/quizzes/active - projectId={}", projectId);

        List<QuizDto> quizzes = quizService.getActiveQuizzesByProject(projectId);

        return ResponseEntity.ok(quizzes);
    }

    /**
     * Get quiz by ID.
     */
    @GetMapping("/{id}")
    @PreAuthorize("hasAnyRole('ADMIN', 'DOCTOR', 'NURSE', 'RECEPTIONIST')")
    @Operation(summary = "Get quiz by ID", description = "Returns detailed information about a quiz")
    public ResponseEntity<QuizDto> getQuizById(
        @Parameter(description = "Quiz ID")
        @PathVariable UUID id
    ) {
        log.info("GET /api/v1/quizzes/{}", id);

        QuizDto quiz = quizService.getQuizById(id);

        return ResponseEntity.ok(quiz);
    }

    /**
     * Get quiz for taking (without correct answers exposed).
     */
    @GetMapping("/{id}/take")
    @PreAuthorize("hasAnyRole('PATIENT')")
    @Operation(summary = "Get quiz for taking", description = "Returns quiz for patient to take (answers hidden)")
    public ResponseEntity<QuizDto> getQuizForTaking(
        @Parameter(description = "Quiz ID")
        @PathVariable UUID id
    ) {
        log.info("GET /api/v1/quizzes/{}/take", id);

        QuizDto quiz = quizService.getQuizForTaking(id);

        return ResponseEntity.ok(quiz);
    }

    /**
     * Create a new quiz.
     */
    @PostMapping
    @PreAuthorize("hasAnyRole('ADMIN', 'DOCTOR', 'NURSE')")
    @Operation(summary = "Create quiz", description = "Creates a new educational quiz")
    public ResponseEntity<QuizDto> createQuiz(
        @Parameter(description = "Quiz data")
        @Valid @RequestBody QuizDto quizDto
    ) {
        log.info("POST /api/v1/quizzes - title: {}", quizDto.title());

        QuizDto createdQuiz = quizService.createQuiz(quizDto);

        return ResponseEntity
            .created(URI.create("/api/v1/quizzes/" + createdQuiz.id()))
            .body(createdQuiz);
    }

    /**
     * Update an existing quiz.
     */
    @PutMapping("/{id}")
    @PreAuthorize("hasAnyRole('ADMIN', 'DOCTOR', 'NURSE')")
    @Operation(summary = "Update quiz", description = "Updates an existing quiz")
    public ResponseEntity<QuizDto> updateQuiz(
        @Parameter(description = "Quiz ID")
        @PathVariable UUID id,

        @Parameter(description = "Updated quiz data")
        @Valid @RequestBody QuizDto quizDto
    ) {
        log.info("PUT /api/v1/quizzes/{}", id);

        QuizDto updatedQuiz = quizService.updateQuiz(id, quizDto);

        return ResponseEntity.ok(updatedQuiz);
    }

    /**
     * Delete a quiz.
     */
    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    @Operation(summary = "Delete quiz", description = "Deletes a quiz")
    public ResponseEntity<Map<String, String>> deleteQuiz(
        @Parameter(description = "Quiz ID")
        @PathVariable UUID id
    ) {
        log.info("DELETE /api/v1/quizzes/{}", id);

        quizService.deleteQuiz(id);

        return ResponseEntity.ok(Map.of(
            "message", "Quiz deleted successfully",
            "id", id.toString()
        ));
    }

    /**
     * Activate a quiz.
     */
    @PostMapping("/{id}/activate")
    @PreAuthorize("hasAnyRole('ADMIN', 'DOCTOR', 'NURSE')")
    @Operation(summary = "Activate quiz", description = "Activates a quiz for patients")
    public ResponseEntity<QuizDto> activateQuiz(
        @Parameter(description = "Quiz ID")
        @PathVariable UUID id
    ) {
        log.info("POST /api/v1/quizzes/{}/activate", id);

        QuizDto quiz = quizService.activateQuiz(id);

        return ResponseEntity.ok(quiz);
    }

    /**
     * Deactivate a quiz.
     */
    @PostMapping("/{id}/deactivate")
    @PreAuthorize("hasAnyRole('ADMIN', 'DOCTOR', 'NURSE')")
    @Operation(summary = "Deactivate quiz", description = "Deactivates a quiz")
    public ResponseEntity<QuizDto> deactivateQuiz(
        @Parameter(description = "Quiz ID")
        @PathVariable UUID id
    ) {
        log.info("POST /api/v1/quizzes/{}/deactivate", id);

        QuizDto quiz = quizService.deactivateQuiz(id);

        return ResponseEntity.ok(quiz);
    }

    // ==================== Quiz Attempts ====================

    /**
     * Start a new quiz attempt.
     */
    @PostMapping("/{id}/attempts")
    @PreAuthorize("hasAnyRole('PATIENT')")
    @Operation(summary = "Start quiz attempt", description = "Starts a new quiz attempt for a patient")
    public ResponseEntity<QuizAttemptDto> startAttempt(
        @Parameter(description = "Quiz ID")
        @PathVariable UUID id,

        @Parameter(description = "Patient ID")
        @RequestParam UUID patientId
    ) {
        log.info("POST /api/v1/quizzes/{}/attempts - patientId={}", id, patientId);

        UUID userId = getCurrentUserId();

        QuizAttemptDto attempt = quizService.startAttempt(id, patientId, userId);

        return ResponseEntity
            .created(URI.create("/api/v1/quizzes/attempts/" + attempt.id()))
            .body(attempt);
    }

    /**
     * Submit quiz answers.
     */
    @PostMapping("/attempts/submit")
    @PreAuthorize("hasAnyRole('PATIENT')")
    @Operation(summary = "Submit quiz answers", description = "Submits answers and completes a quiz attempt")
    public ResponseEntity<QuizAttemptDto> submitAnswers(
        @Parameter(description = "Quiz answers")
        @Valid @RequestBody SubmitQuizRequest request
    ) {
        log.info("POST /api/v1/quizzes/attempts/submit - quizId={}", request.quizId());

        UUID userId = getCurrentUserId();

        QuizAttemptDto result = quizService.submitAnswers(request, userId);

        return ResponseEntity.ok(result);
    }

    /**
     * Get attempts for a patient.
     */
    @GetMapping("/attempts/patient/{patientId}")
    @PreAuthorize("hasAnyRole('ADMIN', 'DOCTOR', 'NURSE', 'PATIENT')")
    @Operation(summary = "Get patient attempts", description = "Returns all quiz attempts for a patient")
    public ResponseEntity<List<QuizAttemptDto>> getAttemptsByPatient(
        @Parameter(description = "Patient ID")
        @PathVariable UUID patientId
    ) {
        log.info("GET /api/v1/quizzes/attempts/patient/{}", patientId);

        List<QuizAttemptDto> attempts = quizService.getAttemptsByPatient(patientId);

        return ResponseEntity.ok(attempts);
    }

    /**
     * Get attempts for a quiz.
     */
    @GetMapping("/{quizId}/attempts")
    @PreAuthorize("hasAnyRole('ADMIN', 'DOCTOR', 'NURSE')")
    @Operation(summary = "Get quiz attempts", description = "Returns all attempts for a quiz")
    public ResponseEntity<List<QuizAttemptDto>> getAttemptsByQuiz(
        @Parameter(description = "Quiz ID")
        @PathVariable UUID quizId
    ) {
        log.info("GET /api/v1/quizzes/{}/attempts", quizId);

        List<QuizAttemptDto> attempts = quizService.getAttemptsByQuiz(quizId);

        return ResponseEntity.ok(attempts);
    }

    /**
     * Get attempt by ID.
     */
    @GetMapping("/attempts/{id}")
    @PreAuthorize("hasAnyRole('ADMIN', 'DOCTOR', 'NURSE', 'PATIENT')")
    @Operation(summary = "Get attempt details", description = "Returns detailed information about a quiz attempt")
    public ResponseEntity<QuizAttemptDto> getAttemptById(
        @Parameter(description = "Attempt ID")
        @PathVariable UUID id,

        @Parameter(description = "Include detailed answer information")
        @RequestParam(defaultValue = "true") boolean includeDetails
    ) {
        log.info("GET /api/v1/quizzes/attempts/{}", id);

        QuizAttemptDto attempt = quizService.getAttemptById(id, includeDetails);

        return ResponseEntity.ok(attempt);
    }

    /**
     * Get quiz statistics.
     */
    @GetMapping("/{id}/stats")
    @PreAuthorize("hasAnyRole('ADMIN', 'DOCTOR', 'NURSE')")
    @Operation(summary = "Get quiz statistics", description = "Returns statistics for a quiz")
    public ResponseEntity<QuizService.QuizStatsDto> getQuizStats(
        @Parameter(description = "Quiz ID")
        @PathVariable UUID id
    ) {
        log.info("GET /api/v1/quizzes/{}/stats", id);

        QuizService.QuizStatsDto stats = quizService.getQuizStats(id);

        return ResponseEntity.ok(stats);
    }

    /**
     * Get current user ID from security context.
     *
     * @throws IllegalStateException if no authenticated user is present or principal is not a UUID
     */
    private UUID getCurrentUserId() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        if (authentication == null || !authentication.isAuthenticated() || authentication.getName() == null) {
            log.warn("No authenticated user in SecurityContext");
            throw new IllegalStateException("No authenticated user in SecurityContext");
        }
        String userId = authentication.getName();
        try {
            return UUID.fromString(userId);
        } catch (IllegalArgumentException e) {
            log.warn("Failed to parse user ID from security context: {}", userId);
            throw new IllegalStateException("Invalid user ID in security context: " + userId, e);
        }
    }
}
