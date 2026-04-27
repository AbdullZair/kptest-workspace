package com.kptest.application.service;

import com.kptest.api.dto.QuizAttemptDto;
import com.kptest.api.dto.QuizDto;
import com.kptest.api.dto.SubmitQuizRequest;
import com.kptest.domain.patient.Patient;
import com.kptest.domain.patient.PatientRepository;
import com.kptest.domain.project.Project;
import com.kptest.domain.project.ProjectRepository;
import com.kptest.domain.quiz.*;
import com.kptest.domain.quiz.repository.QuizAttemptRepository;
import com.kptest.domain.quiz.repository.QuizRepository;
import com.kptest.exception.ResourceNotFoundException;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.UUID;

/**
 * Service for managing quizzes and quiz attempts.
 */
@Slf4j
@Service
@RequiredArgsConstructor
@Transactional
public class QuizService {

    private final QuizRepository quizRepository;
    private final QuizAttemptRepository quizAttemptRepository;
    private final PatientRepository patientRepository;
    private final ProjectRepository projectRepository;

    // ==================== Quiz CRUD ====================

    /**
     * Get all quizzes for a project.
     */
    @Transactional(readOnly = true)
    public List<QuizDto> getQuizzesByProject(UUID projectId) {
        log.debug("Finding quizzes for project: {}", projectId);

        List<Quiz> quizzes = quizRepository.findByProjectId(projectId);

        return quizzes.stream()
            .map(QuizDto::fromQuiz)
            .toList();
    }

    /**
     * Get all active quizzes for a project.
     */
    @Transactional(readOnly = true)
    public List<QuizDto> getActiveQuizzesByProject(UUID projectId) {
        log.debug("Finding active quizzes for project: {}", projectId);

        List<Quiz> quizzes = quizRepository.findByProjectIdAndActive(projectId, true);

        return quizzes.stream()
            .map(QuizDto::fromQuiz)
            .toList();
    }

    /**
     * Get quiz by ID.
     */
    @Transactional(readOnly = true)
    public QuizDto getQuizById(UUID id) {
        log.debug("Finding quiz by ID: {}", id);

        Quiz quiz = quizRepository.findById(id)
            .orElseThrow(() -> new ResourceNotFoundException("Quiz not found with id: " + id));

        return QuizDto.fromQuiz(quiz);
    }

    /**
     * Get quiz for taking (without exposing correct answers).
     */
    @Transactional(readOnly = true)
    public QuizDto getQuizForTaking(UUID id) {
        log.debug("Finding quiz for taking: {}", id);

        Quiz quiz = quizRepository.findById(id)
            .orElseThrow(() -> new ResourceNotFoundException("Quiz not found with id: " + id));

        if (!quiz.getActive()) {
            throw new IllegalStateException("Quiz is not active");
        }

        return QuizDto.fromQuizWithoutAnswers(quiz);
    }

    /**
     * Create a new quiz.
     */
    public QuizDto createQuiz(QuizDto quizDto) {
        log.info("Creating quiz with title: {}", quizDto.title());

        Project project = projectRepository.findById(quizDto.projectId())
            .orElseThrow(() -> new ResourceNotFoundException("Project not found with id: " + quizDto.projectId()));

        Quiz quiz = Quiz.create(
            quizDto.title(),
            quizDto.description(),
            project,
            quizDto.passThreshold(),
            quizDto.createdBy()
        );

        if (quizDto.timeLimitSeconds() != null) {
            quiz.setTimeLimitSeconds(quizDto.timeLimitSeconds());
        }

        Quiz savedQuiz = quizRepository.save(quiz);
        log.info("Created quiz with ID: {}", savedQuiz.getId());

        return QuizDto.fromQuiz(savedQuiz);
    }

    /**
     * Update an existing quiz.
     */
    public QuizDto updateQuiz(UUID id, QuizDto quizDto) {
        log.info("Updating quiz with ID: {}", id);

        Quiz quiz = quizRepository.findById(id)
            .orElseThrow(() -> new ResourceNotFoundException("Quiz not found with id: " + id));

        if (quizDto.title() != null) {
            quiz.setTitle(quizDto.title());
        }
        if (quizDto.description() != null) {
            quiz.setDescription(quizDto.description());
        }
        if (quizDto.passThreshold() != null) {
            quiz.setPassThreshold(quizDto.passThreshold());
        }
        if (quizDto.timeLimitSeconds() != null) {
            quiz.setTimeLimitSeconds(quizDto.timeLimitSeconds());
        }
        if (quizDto.active() != null) {
            if (quizDto.active()) {
                quiz.activate();
            } else {
                quiz.deactivate();
            }
        }

        Quiz updatedQuiz = quizRepository.save(quiz);
        log.info("Updated quiz with ID: {}", updatedQuiz.getId());

        return QuizDto.fromQuiz(updatedQuiz);
    }

    /**
     * Delete a quiz.
     */
    public void deleteQuiz(UUID id) {
        log.info("Deleting quiz with ID: {}", id);

        Quiz quiz = quizRepository.findById(id)
            .orElseThrow(() -> new ResourceNotFoundException("Quiz not found with id: " + id));

        quizRepository.delete(quiz);
        log.info("Deleted quiz with ID: {}", id);
    }

    /**
     * Activate a quiz.
     */
    public QuizDto activateQuiz(UUID id) {
        log.info("Activating quiz with ID: {}", id);

        Quiz quiz = quizRepository.findById(id)
            .orElseThrow(() -> new ResourceNotFoundException("Quiz not found with id: " + id));

        quiz.activate();
        quizRepository.save(quiz);

        return QuizDto.fromQuiz(quiz);
    }

    /**
     * Deactivate a quiz.
     */
    public QuizDto deactivateQuiz(UUID id) {
        log.info("Deactivating quiz with ID: {}", id);

        Quiz quiz = quizRepository.findById(id)
            .orElseThrow(() -> new ResourceNotFoundException("Quiz not found with id: " + id));

        quiz.deactivate();
        quizRepository.save(quiz);

        return QuizDto.fromQuiz(quiz);
    }

    // ==================== Quiz Attempts ====================

    /**
     * Start a new quiz attempt.
     */
    public QuizAttemptDto startAttempt(UUID quizId, UUID patientId, UUID userId) {
        log.info("Starting quiz attempt for quiz: {}, patient: {}", quizId, patientId);

        Quiz quiz = quizRepository.findById(quizId)
            .orElseThrow(() -> new ResourceNotFoundException("Quiz not found with id: " + quizId));

        Patient patient = patientRepository.findById(patientId)
            .orElseThrow(() -> new ResourceNotFoundException("Patient not found with id: " + patientId));

        if (!quiz.getActive()) {
            throw new IllegalStateException("Quiz is not active");
        }

        QuizAttempt attempt = QuizAttempt.start(quiz, patient, userId);
        QuizAttempt savedAttempt = quizAttemptRepository.save(attempt);

        log.info("Started quiz attempt with ID: {}", savedAttempt.getId());

        return QuizAttemptDto.fromAttemptSummary(savedAttempt);
    }

    /**
     * Submit quiz answers and complete the attempt.
     */
    public QuizAttemptDto submitAnswers(SubmitQuizRequest request, UUID userId) {
        log.info("Submitting quiz answers for attempt: quiz={}, patient={}", request.quizId(), request.patientId());

        Quiz quiz = quizRepository.findById(request.quizId())
            .orElseThrow(() -> new ResourceNotFoundException("Quiz not found with id: " + request.quizId()));

        Patient patient = patientRepository.findById(request.patientId())
            .orElseThrow(() -> new ResourceNotFoundException("Patient not found with id: " + request.patientId()));

        // Find the latest incomplete attempt
        QuizAttempt attempt = quizAttemptRepository.findFirstByQuizIdAndPatientIdOrderByCompletedAtDesc(
                request.quizId(), request.patientId())
            .orElseThrow(() -> new IllegalStateException("No active quiz attempt found"));

        if (attempt.isCompleted()) {
            throw new IllegalStateException("Quiz attempt is already completed");
        }

        // Process each question answer
        for (SubmitQuizRequest.QuestionAnswerRequest answerRequest : request.answers()) {
            QuizQuestion question = quiz.getQuestions().stream()
                .filter(q -> q.getId().equals(answerRequest.questionId()))
                .findFirst()
                .orElseThrow(() -> new ResourceNotFoundException(
                    "Question not found with id: " + answerRequest.questionId()));

            QuizAnswerSelection selection = QuizAnswerSelection.create(
                attempt,
                question,
                answerRequest.selectedAnswerIds()
            );

            attempt.addAnswerSelection(selection);
        }

        // Complete the attempt
        attempt.complete();
        quizAttemptRepository.save(attempt);

        log.info("Completed quiz attempt with ID: {}, score: {}, passed: {}",
            attempt.getId(), attempt.getScore(), attempt.getPassed());

        return QuizAttemptDto.fromAttempt(attempt, true);
    }

    /**
     * Get all attempts for a patient.
     */
    @Transactional(readOnly = true)
    public List<QuizAttemptDto> getAttemptsByPatient(UUID patientId) {
        log.debug("Finding attempts for patient: {}", patientId);

        List<QuizAttempt> attempts = quizAttemptRepository.findByPatientId(patientId);

        return attempts.stream()
            .map(a -> QuizAttemptDto.fromAttemptSummary(a))
            .toList();
    }

    /**
     * Get all attempts for a quiz.
     */
    @Transactional(readOnly = true)
    public List<QuizAttemptDto> getAttemptsByQuiz(UUID quizId) {
        log.debug("Finding attempts for quiz: {}", quizId);

        List<QuizAttempt> attempts = quizAttemptRepository.findByQuizId(quizId);

        return attempts.stream()
            .map(a -> QuizAttemptDto.fromAttemptSummary(a))
            .toList();
    }

    /**
     * Get attempt by ID.
     */
    @Transactional(readOnly = true)
    public QuizAttemptDto getAttemptById(UUID id, boolean includeDetails) {
        log.debug("Finding attempt by ID: {}", id);

        QuizAttempt attempt = quizAttemptRepository.findById(id)
            .orElseThrow(() -> new ResourceNotFoundException("Quiz attempt not found with id: " + id));

        return QuizAttemptDto.fromAttempt(attempt, includeDetails);
    }

    /**
     * Get latest attempt for a quiz and patient.
     */
    @Transactional(readOnly = true)
    public QuizAttemptDto getLatestAttempt(UUID quizId, UUID patientId) {
        log.debug("Finding latest attempt for quiz: {}, patient: {}", quizId, patientId);

        QuizAttempt attempt = quizAttemptRepository.findFirstByQuizIdAndPatientIdOrderByCompletedAtDesc(
                quizId, patientId)
            .orElseThrow(() -> new ResourceNotFoundException("No quiz attempt found"));

        return QuizAttemptDto.fromAttempt(attempt, true);
    }

    /**
     * Get quiz statistics.
     */
    @Transactional(readOnly = true)
    public QuizStatsDto getQuizStats(UUID quizId) {
        log.debug("Calculating stats for quiz: {}", quizId);

        long totalAttempts = quizAttemptRepository.countByQuizId(quizId);
        double averageScore = quizAttemptRepository.findAveragePercentageByQuizId(quizId);

        return new QuizStatsDto(totalAttempts, averageScore != null ? averageScore : 0.0);
    }

    /**
     * DTO for quiz statistics.
     */
    public record QuizStatsDto(
        long totalAttempts,
        double averageScore
    ) {}
}
