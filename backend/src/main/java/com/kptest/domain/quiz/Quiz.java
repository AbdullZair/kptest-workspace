package com.kptest.domain.quiz;

import com.kptest.domain.project.Project;
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
 * Quiz entity representing an educational quiz with questions and answers.
 */
@Entity
@Table(name = "quizzes")
@EntityListeners(AuditingEntityListener.class)
@Getter
@Setter
@NoArgsConstructor(access = AccessLevel.PROTECTED)
@EqualsAndHashCode(of = "id")
public class Quiz {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @Column(nullable = false, length = 255)
    private String title;

    @Column(columnDefinition = "TEXT")
    private String description;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "project_id", nullable = false)
    private Project project;

    @Column(name = "pass_threshold", nullable = false)
    private Integer passThreshold;

    @Column(name = "time_limit_seconds")
    private Integer timeLimitSeconds;

    @Column(nullable = false)
    private Boolean active;

    @Column(name = "created_by", nullable = false)
    private UUID createdBy;

    @OneToMany(mappedBy = "quiz", cascade = CascadeType.ALL, orphanRemoval = true)
    @OrderBy("orderIndex ASC")
    private List<QuizQuestion> questions = new ArrayList<>();

    @Column(name = "created_at", nullable = false, updatable = false)
    @CreatedDate
    private Instant createdAt;

    @Column(name = "updated_at", nullable = false)
    @LastModifiedDate
    private Instant updatedAt;

    /**
     * Factory method for creating a quiz.
     */
    public static Quiz create(
        String title,
        String description,
        Project project,
        Integer passThreshold,
        UUID createdBy
    ) {
        Quiz quiz = new Quiz();
        quiz.title = title;
        quiz.description = description;
        quiz.project = project;
        quiz.passThreshold = passThreshold;
        quiz.createdBy = createdBy;
        quiz.active = false;
        return quiz;
    }

    /**
     * Add a question to the quiz.
     */
    public void addQuestion(QuizQuestion question) {
        this.questions.add(question);
        question.setQuiz(this);
    }

    /**
     * Remove a question from the quiz.
     */
    public void removeQuestion(QuizQuestion question) {
        this.questions.remove(question);
        question.setQuiz(null);
    }

    /**
     * Activate the quiz.
     */
    public void activate() {
        this.active = true;
    }

    /**
     * Deactivate the quiz.
     */
    public void deactivate() {
        this.active = false;
    }

    /**
     * Calculate maximum possible score for this quiz.
     */
    public Integer getMaxScore() {
        return this.questions.stream()
            .mapToInt(QuizQuestion::getPoints)
            .sum();
    }

    /**
     * Check if quiz has time limit.
     */
    public boolean hasTimeLimit() {
        return this.timeLimitSeconds != null && this.timeLimitSeconds > 0;
    }
}
