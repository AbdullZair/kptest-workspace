package com.kptest.domain.quiz.repository;

import com.kptest.domain.quiz.QuizAttempt;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

/**
 * Repository interface for QuizAttempt entity.
 */
@Repository
public interface QuizAttemptRepository extends JpaRepository<QuizAttempt, UUID> {

    /**
     * Find all attempts for a quiz.
     */
    List<QuizAttempt> findByQuizId(UUID quizId);

    /**
     * Find all attempts for a patient.
     */
    List<QuizAttempt> findByPatientId(UUID patientId);

    /**
     * Find all attempts for a quiz and patient.
     */
    List<QuizAttempt> findByQuizIdAndPatientId(UUID quizId, UUID patientId);

    /**
     * Find the latest attempt for a quiz and patient.
     */
    Optional<QuizAttempt> findFirstByQuizIdAndPatientIdOrderByCompletedAtDesc(
        UUID quizId,
        UUID patientId
    );

    /**
     * Count attempts by quiz.
     */
    long countByQuizId(UUID quizId);

    /**
     * Count attempts by patient.
     */
    long countByPatientId(UUID patientId);

    /**
     * Count passed attempts by patient.
     */
    long countByPatientIdAndPassed(UUID patientId, Boolean passed);

    /**
     * Find all completed attempts for a patient.
     */
    List<QuizAttempt> findByPatientIdAndCompletedAtIsNotNull(UUID patientId);

    /**
     * Find all passed attempts for a patient.
     */
    List<QuizAttempt> findByPatientIdAndPassed(UUID patientId, Boolean passed);

    /**
     * Get attempts with pagination for a patient.
     */
    Page<QuizAttempt> findByPatientId(UUID patientId, Pageable pageable);

    /**
     * Get average score for a quiz.
     */
    @Query("SELECT AVG(a.percentage) FROM QuizAttempt a WHERE a.quiz.id = :quizId AND a.completedAt IS NOT NULL")
    Double findAveragePercentageByQuizId(@Param("quizId") UUID quizId);
}
