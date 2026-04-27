package com.kptest.domain.quiz;

import com.kptest.domain.patient.Patient;
import jakarta.persistence.*;
import lombok.*;
import org.springframework.data.annotation.CreatedDate;
import org.springframework.data.annotation.LastModifiedDate;
import org.springframework.data.jpa.domain.support.AuditingEntityListener;

import java.time.Duration;
import java.time.Instant;
import java.util.ArrayList;
import java.util.List;
import java.util.UUID;

/**
 * Quiz attempt entity representing a patient's attempt at completing a quiz.
 */
@Entity
@Table(name = "quiz_attempts")
@EntityListeners(AuditingEntityListener.class)
@Getter
@Setter
@NoArgsConstructor(access = AccessLevel.PROTECTED)
@EqualsAndHashCode(of = "id")
public class QuizAttempt {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "quiz_id", nullable = false)
    private Quiz quiz;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "patient_id", nullable = false)
    private Patient patient;

    @Column(name = "started_at", nullable = false)
    private Instant startedAt;

    @Column(name = "completed_at")
    private Instant completedAt;

    @Column(name = "score", nullable = false)
    private Integer score;

    @Column(name = "max_score", nullable = false)
    private Integer maxScore;

    @Column(name = "percentage", nullable = false)
    private Double percentage;

    @Column(name = "passed", nullable = false)
    private Boolean passed;

    @Column(name = "time_spent_seconds")
    private Integer timeSpentSeconds;

    @Column(name = "created_by", nullable = false)
    private UUID createdBy;

    @OneToMany(mappedBy = "attempt", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<QuizAnswerSelection> answerSelections = new ArrayList<>();

    @Column(name = "created_at", nullable = false, updatable = false)
    @CreatedDate
    private Instant createdAt;

    @Column(name = "updated_at", nullable = false)
    @LastModifiedDate
    private Instant updatedAt;

    /**
     * Factory method for starting a new quiz attempt.
     */
    public static QuizAttempt start(Quiz quiz, Patient patient, UUID createdBy) {
        QuizAttempt attempt = new QuizAttempt();
        attempt.quiz = quiz;
        attempt.patient = patient;
        attempt.startedAt = Instant.now();
        attempt.score = 0;
        attempt.maxScore = quiz.getMaxScore();
        attempt.percentage = 0.0;
        attempt.passed = false;
        attempt.createdBy = createdBy;
        return attempt;
    }

    /**
     * Complete the attempt and calculate results.
     */
    public void complete() {
        this.completedAt = Instant.now();
        this.timeSpentSeconds = (int) Duration.between(this.startedAt, this.completedAt).getSeconds();

        // Calculate score based on answer selections
        int totalScore = 0;
        for (QuizAnswerSelection selection : this.answerSelections) {
            if (selection.getIsCorrect()) {
                totalScore += selection.getQuestion().getPoints();
            }
        }

        this.score = totalScore;
        this.percentage = maxScore > 0 ? (double) score / maxScore * 100 : 0.0;
        this.passed = this.percentage >= quiz.getPassThreshold();
    }

    /**
     * Add an answer selection to this attempt.
     */
    public void addAnswerSelection(QuizAnswerSelection selection) {
        this.answerSelections.add(selection);
        selection.setAttempt(this);
    }

    /**
     * Check if attempt is completed.
     */
    public boolean isCompleted() {
        return this.completedAt != null;
    }
}
