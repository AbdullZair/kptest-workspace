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
 * Quiz question entity with multiple possible answers.
 */
@Entity
@Table(name = "quiz_questions")
@EntityListeners(AuditingEntityListener.class)
@Getter
@Setter
@NoArgsConstructor(access = AccessLevel.PROTECTED)
@EqualsAndHashCode(of = "id")
public class QuizQuestion {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "quiz_id", nullable = false)
    private Quiz quiz;

    @Column(name = "order_index", nullable = false)
    private Integer orderIndex;

    @Column(nullable = false, columnDefinition = "TEXT")
    private String question;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private QuestionType type;

    @Column(nullable = false)
    private Integer points;

    @Column(name = "explanation", columnDefinition = "TEXT")
    private String explanation;

    @OneToMany(mappedBy = "question", cascade = CascadeType.ALL, orphanRemoval = true)
    @OrderBy("orderIndex ASC")
    private List<QuizAnswer> answers = new ArrayList<>();

    @Column(name = "created_at", nullable = false, updatable = false)
    @CreatedDate
    private Instant createdAt;

    @Column(name = "updated_at", nullable = false)
    @LastModifiedDate
    private Instant updatedAt;

    /**
     * Question type enum defining how many answers can be selected.
     */
    public enum QuestionType {
        SINGLE_CHOICE,    // Exactly one correct answer
        MULTI_CHOICE,     // Multiple correct answers possible
        TRUE_FALSE        // Binary true/false question
    }

    /**
     * Factory method for creating a question.
     */
    public static QuizQuestion create(
        Quiz quiz,
        Integer orderIndex,
        String question,
        QuestionType type,
        Integer points
    ) {
        QuizQuestion q = new QuizQuestion();
        q.quiz = quiz;
        q.orderIndex = orderIndex;
        q.question = question;
        q.type = type;
        q.points = points;
        return q;
    }

    /**
     * Add an answer to the question.
     */
    public void addAnswer(QuizAnswer answer) {
        this.answers.add(answer);
        answer.setQuestion(this);
    }

    /**
     * Remove an answer from the question.
     */
    public void removeAnswer(QuizAnswer answer) {
        this.answers.remove(answer);
        answer.setQuestion(null);
    }

    /**
     * Get correct answers for this question.
     */
    public List<QuizAnswer> getCorrectAnswers() {
        return this.answers.stream()
            .filter(QuizAnswer::isCorrect)
            .toList();
    }

    /**
     * Check if given answer IDs are correct for this question.
     */
    public boolean isAnswerCorrect(List<UUID> answerIds) {
        List<UUID> correctIds = getCorrectAnswers().stream()
            .map(QuizAnswer::getId)
            .toList();

        if (type == QuestionType.TRUE_FALSE || type == QuestionType.SINGLE_CHOICE) {
            return answerIds.size() == 1 && correctIds.containsAll(answerIds);
        } else {
            // Multi choice - all correct answers must be selected and no incorrect ones
            return answerIds.size() == correctIds.size() && correctIds.containsAll(answerIds);
        }
    }
}
