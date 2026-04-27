package com.kptest.domain.quiz;

import jakarta.persistence.*;
import lombok.*;
import org.springframework.data.annotation.CreatedDate;
import org.springframework.data.annotation.LastModifiedDate;
import org.springframework.data.jpa.domain.support.AuditingEntityListener;

import java.time.Instant;
import java.util.UUID;

/**
 * Quiz answer entity representing a possible answer to a quiz question.
 */
@Entity
@Table(name = "quiz_answers")
@EntityListeners(AuditingEntityListener.class)
@Getter
@Setter
@NoArgsConstructor(access = AccessLevel.PROTECTED)
@EqualsAndHashCode(of = "id")
public class QuizAnswer {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "question_id", nullable = false)
    private QuizQuestion question;

    @Column(name = "order_index", nullable = false)
    private Integer orderIndex;

    @Column(nullable = false, columnDefinition = "TEXT")
    private String answer;

    @Column(nullable = false)
    private Boolean correct;

    @Column(name = "explanation", columnDefinition = "TEXT")
    private String explanation;

    /**
     * Check if this answer is correct.
     * @return true if correct
     */
    public boolean isCorrect() {
        return Boolean.TRUE.equals(correct);
    }

    @Column(name = "created_at", nullable = false, updatable = false)
    @CreatedDate
    private Instant createdAt;

    @Column(name = "updated_at", nullable = false)
    @LastModifiedDate
    private Instant updatedAt;

    /**
     * Factory method for creating an answer.
     */
    public static QuizAnswer create(
        QuizQuestion question,
        Integer orderIndex,
        String answer,
        Boolean correct
    ) {
        QuizAnswer a = new QuizAnswer();
        a.question = question;
        a.orderIndex = orderIndex;
        a.answer = answer;
        a.correct = correct;
        return a;
    }

    /**
     * Set the parent question.
     */
    public void setQuestion(QuizQuestion question) {
        this.question = question;
    }
}
