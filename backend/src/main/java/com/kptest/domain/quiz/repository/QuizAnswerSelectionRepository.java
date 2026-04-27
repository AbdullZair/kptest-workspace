package com.kptest.domain.quiz.repository;

import com.kptest.domain.quiz.QuizAnswerSelection;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.UUID;

/**
 * Repository for QuizAnswerSelection entity.
 */
@Repository
public interface QuizAnswerSelectionRepository extends JpaRepository<QuizAnswerSelection, UUID> {

    /**
     * Find all answer selections for a quiz attempt.
     */
    List<QuizAnswerSelection> findByAttemptId(UUID attemptId);

    /**
     * Delete all answer selections for a quiz attempt.
     */
    void deleteByAttemptId(UUID attemptId);

    /**
     * Delete all answer selections for a patient (via attempts).
     */
    void deleteByAttemptPatientId(UUID patientId);
}
