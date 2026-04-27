package com.kptest.domain.quiz;

import jakarta.persistence.*;
import lombok.*;
import org.springframework.data.annotation.CreatedDate;
import org.springframework.data.annotation.LastModifiedDate;
import org.springframework.data.jpa.domain.support.AuditingEntityListener;

import java.time.Instant;
import java.util.ArrayList;
import java.util.List;
import java.util.UUID;

/**
 * Quiz answer selection entity representing selected answers for a question in an attempt.
 */
@Entity
@Table(name = "quiz_answer_selections")
@EntityListeners(AuditingEntityListener.class)
@Getter
@Setter
@NoArgsConstructor(access = AccessLevel.PROTECTED)
@EqualsAndHashCode(of = "id")
public class QuizAnswerSelection {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "attempt_id", nullable = false)
    private QuizAttempt attempt;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "question_id", nullable = false)
    private QuizQuestion question;

    @ElementCollection
    @CollectionTable(name = "quiz_selected_answers", joinColumns = @JoinColumn(name = "selection_id"))
    @Column(name = "answer_id")
    private List<UUID> selectedAnswerIds = new ArrayList<>();

    @Column(name = "is_correct", nullable = false)
    private Boolean isCorrect;

    @Column(name = "points_earned", nullable = false)
    private Integer pointsEarned;

    @Column(name = "created_at", nullable = false, updatable = false)
    @CreatedDate
    private Instant createdAt;

    /**
     * Factory method for creating an answer selection.
     */
    public static QuizAnswerSelection create(
        QuizAttempt attempt,
        QuizQuestion question,
        List<UUID> selectedAnswerIds
    ) {
        QuizAnswerSelection selection = new QuizAnswerSelection();
        selection.attempt = attempt;
        selection.question = question;
        selection.selectedAnswerIds = selectedAnswerIds;
        selection.isCorrect = question.isAnswerCorrect(selectedAnswerIds);
        selection.pointsEarned = selection.isCorrect ? question.getPoints() : 0;
        return selection;
    }

    /**
     * Set the parent attempt.
     */
    public void setAttempt(QuizAttempt attempt) {
        this.attempt = attempt;
    }
}
