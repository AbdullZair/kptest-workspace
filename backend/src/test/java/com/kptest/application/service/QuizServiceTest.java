package com.kptest.application.service;

import com.kptest.api.dto.QuizDto;
import com.kptest.domain.patient.Patient;
import com.kptest.domain.patient.PatientRepository;
import com.kptest.domain.project.Project;
import com.kptest.domain.project.ProjectRepository;
import com.kptest.domain.quiz.Quiz;
import com.kptest.domain.quiz.QuizAttempt;
import com.kptest.domain.quiz.QuizQuestion;
import com.kptest.domain.quiz.repository.QuizAttemptRepository;
import com.kptest.domain.quiz.repository.QuizRepository;
import com.kptest.exception.ResourceNotFoundException;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

import static org.assertj.core.api.Assertions.*;
import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.*;

/**
 * Unit tests for QuizService
 */
@ExtendWith(MockitoExtension.class)
class QuizServiceTest {

    @Mock
    private QuizRepository quizRepository;

    @Mock
    private QuizAttemptRepository quizAttemptRepository;

    @Mock
    private PatientRepository patientRepository;

    @Mock
    private ProjectRepository projectRepository;

    @InjectMocks
    private QuizService quizService;

    private UUID quizId;
    private UUID projectId;
    private UUID patientId;
    private UUID userId;
    private Project project;
    private Patient patient;

    @BeforeEach
    void setUp() {
        quizId = UUID.randomUUID();
        projectId = UUID.randomUUID();
        patientId = UUID.randomUUID();
        userId = UUID.randomUUID();

        project = new Project();
        project.setId(projectId);
        project.setName("Test Project");

        patient = new Patient();
        patient.setId(patientId);
        patient.setFirstName("John");
        patient.setLastName("Doe");
    }

    @Test
    @DisplayName("Should get quizzes by project")
    void getQuizzesByProject_ShouldReturnQuizzes() {
        // Given
        Quiz quiz = createTestQuiz();
        when(quizRepository.findByProjectId(projectId)).thenReturn(List.of(quiz));

        // When
        List<QuizDto> result = quizService.getQuizzesByProject(projectId);

        // Then
        assertThat(result).hasSize(1);
        assertThat(result.get(0).id()).isEqualTo(quizId);
        verify(quizRepository).findByProjectId(projectId);
    }

    @Test
    @DisplayName("Should get active quizzes by project")
    void getActiveQuizzesByProject_ShouldReturnActiveQuizzes() {
        // Given
        Quiz quiz = createTestQuiz();
        quiz.setActive(true);
        when(quizRepository.findByProjectIdAndActive(projectId, true)).thenReturn(List.of(quiz));

        // When
        List<QuizDto> result = quizService.getActiveQuizzesByProject(projectId);

        // Then
        assertThat(result).hasSize(1);
        assertThat(result.get(0).active()).isTrue();
        verify(quizRepository).findByProjectIdAndActive(projectId, true);
    }

    @Test
    @DisplayName("Should get quiz by ID")
    void getQuizById_ShouldReturnQuiz() {
        // Given
        Quiz quiz = createTestQuiz();
        when(quizRepository.findById(quizId)).thenReturn(Optional.of(quiz));

        // When
        QuizDto result = quizService.getQuizById(quizId);

        // Then
        assertThat(result.id()).isEqualTo(quizId);
        assertThat(result.title()).isEqualTo("Test Quiz");
        verify(quizRepository).findById(quizId);
    }

    @Test
    @DisplayName("Should throw exception when quiz not found")
    void getQuizById_ShouldThrowException_WhenNotFound() {
        // Given
        when(quizRepository.findById(quizId)).thenReturn(Optional.empty());

        // When & Then
        assertThatThrownBy(() -> quizService.getQuizById(quizId))
            .isInstanceOf(ResourceNotFoundException.class)
            .hasMessageContaining("Quiz not found");
    }

    @Test
    @DisplayName("Should create quiz")
    void createQuiz_ShouldReturnCreatedQuiz() {
        // Given
        QuizDto quizDto = new QuizDto(
            null, "Test Quiz", "Description", projectId, 70, null, false,
            userId, null, 100, null, null
        );
        when(projectRepository.findById(projectId)).thenReturn(Optional.of(project));
        when(quizRepository.save(any(Quiz.class))).thenAnswer(i -> i.getArguments()[0]);

        // When
        QuizDto result = quizService.createQuiz(quizDto);

        // Then
        assertThat(result.title()).isEqualTo("Test Quiz");
        assertThat(result.projectId()).isEqualTo(projectId);
        verify(quizRepository).save(any(Quiz.class));
    }

    @Test
    @DisplayName("Should update quiz")
    void updateQuiz_ShouldReturnUpdatedQuiz() {
        // Given
        Quiz quiz = createTestQuiz();
        when(quizRepository.findById(quizId)).thenReturn(Optional.of(quiz));
        when(quizRepository.save(any(Quiz.class))).thenAnswer(i -> i.getArguments()[0]);

        QuizDto updateDto = new QuizDto(
            null, "Updated Quiz", null, null, 80, null, null,
            null, null, null, null, null
        );

        // When
        QuizDto result = quizService.updateQuiz(quizId, updateDto);

        // Then
        assertThat(result.title()).isEqualTo("Updated Quiz");
        assertThat(result.passThreshold()).isEqualTo(80);
        verify(quizRepository).save(quiz);
    }

    @Test
    @DisplayName("Should delete quiz")
    void deleteQuiz_ShouldDeleteQuiz() {
        // Given
        Quiz quiz = createTestQuiz();
        when(quizRepository.findById(quizId)).thenReturn(Optional.of(quiz));

        // When
        quizService.deleteQuiz(quizId);

        // Then
        verify(quizRepository).delete(quiz);
    }

    @Test
    @DisplayName("Should activate quiz")
    void activateQuiz_ShouldActivateQuiz() {
        // Given
        Quiz quiz = createTestQuiz();
        quiz.setActive(false);
        when(quizRepository.findById(quizId)).thenReturn(Optional.of(quiz));
        when(quizRepository.save(any(Quiz.class))).thenAnswer(i -> i.getArguments()[0]);

        // When
        QuizDto result = quizService.activateQuiz(quizId);

        // Then
        assertThat(result.active()).isTrue();
        verify(quizRepository).save(quiz);
    }

    @Test
    @DisplayName("Should start quiz attempt")
    void startAttempt_ShouldReturnAttempt() {
        // Given
        Quiz quiz = createTestQuiz();
        when(quizRepository.findById(quizId)).thenReturn(Optional.of(quiz));
        when(patientRepository.findById(patientId)).thenReturn(Optional.of(patient));
        when(quizAttemptRepository.save(any(QuizAttempt.class))).thenAnswer(i -> i.getArguments()[0]);

        // When
        var result = quizService.startAttempt(quizId, patientId, userId);

        // Then
        assertThat(result.quizId()).isEqualTo(quizId);
        assertThat(result.patientId()).isEqualTo(patientId);
        verify(quizAttemptRepository).save(any(QuizAttempt.class));
    }

    @Test
    @DisplayName("Should throw exception when starting attempt for inactive quiz")
    void startAttempt_ShouldThrowException_WhenQuizInactive() {
        // Given
        Quiz quiz = createTestQuiz();
        quiz.setActive(false);
        when(quizRepository.findById(quizId)).thenReturn(Optional.of(quiz));

        // When & Then
        assertThatThrownBy(() -> quizService.startAttempt(quizId, patientId, userId))
            .isInstanceOf(IllegalStateException.class)
            .hasMessageContaining("Quiz is not active");
    }

    @Test
    @DisplayName("Should get attempts by patient")
    void getAttemptsByPatient_ShouldReturnAttempts() {
        // Given
        QuizAttempt attempt = createTestAttempt();
        when(quizAttemptRepository.findByPatientId(patientId)).thenReturn(List.of(attempt));

        // When
        var result = quizService.getAttemptsByPatient(patientId);

        // Then
        assertThat(result).hasSize(1);
        verify(quizAttemptRepository).findByPatientId(patientId);
    }

    @Test
    @DisplayName("Should get quiz stats")
    void getQuizStats_ShouldReturnStats() {
        // Given
        when(quizAttemptRepository.countByQuizId(quizId)).thenReturn(10L);
        when(quizAttemptRepository.findAveragePercentageByQuizId(quizId)).thenReturn(75.5);

        // When
        var result = quizService.getQuizStats(quizId);

        // Then
        assertThat(result.totalAttempts()).isEqualTo(10);
        assertThat(result.averageScore()).isEqualTo(75.5);
    }

    private Quiz createTestQuiz() {
        Quiz quiz = new Quiz();
        quiz.setId(quizId);
        quiz.setTitle("Test Quiz");
        quiz.setDescription("Test Description");
        quiz.setProject(project);
        quiz.setPassThreshold(70);
        quiz.setCreatedBy(userId);
        quiz.setActive(true);

        // Add a test question
        QuizQuestion question = QuizQuestion.create(quiz, 0, "Test question?",
            QuizQuestion.QuestionType.SINGLE_CHOICE, 10);
        quiz.addQuestion(question);

        return quiz;
    }

    private QuizAttempt createTestAttempt() {
        Quiz quiz = createTestQuiz();
        QuizAttempt attempt = QuizAttempt.start(quiz, patient, userId);
        attempt.setId(UUID.randomUUID());
        return attempt;
    }
}
