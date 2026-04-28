package com.kptest.domain.project;

import com.kptest.domain.quiz.Quiz;
import jakarta.persistence.*;
import lombok.*;
import org.springframework.data.annotation.CreatedDate;
import org.springframework.data.annotation.LastModifiedDate;
import org.springframework.data.jpa.domain.support.AuditingEntityListener;

import java.time.Instant;
import java.util.UUID;

/**
 * Therapy stage entity representing a stage in a therapeutic project.
 * Replaces the simple enum with a full entity supporting ordered stages and unlock modes.
 */
@Entity
@Table(name = "therapy_stages")
@EntityListeners(AuditingEntityListener.class)
@Getter
@Setter
@NoArgsConstructor(access = AccessLevel.PROTECTED)
@EqualsAndHashCode(of = "id")
public class TherapyStageEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @Column(nullable = false, length = 200)
    private String name;

    @Column(columnDefinition = "TEXT")
    private String description;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "project_id", nullable = false)
    private Project project;

    @Column(name = "order_index", nullable = false)
    private Integer orderIndex;

    @Enumerated(EnumType.STRING)
    @Column(name = "unlock_mode", nullable = false)
    private UnlockMode unlockMode;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "required_quiz_id")
    private Quiz requiredQuiz;

    @Column(name = "is_active", nullable = false)
    private Boolean active;

    @Column(name = "created_by", nullable = false)
    private UUID createdBy;

    @Column(name = "created_at", nullable = false, updatable = false)
    @CreatedDate
    private Instant createdAt;

    @Column(name = "updated_at", nullable = false)
    @LastModifiedDate
    private Instant updatedAt;

    /**
     * Unlock mode enum defining how a stage can be unlocked.
     */
    public enum UnlockMode {
        MANUAL,      // Staff must manually unlock
        AUTO_QUIZ    // Automatically unlocked after passing required quiz
    }

    /**
     * Factory method for creating a therapy stage.
     */
    public static TherapyStageEntity create(
        String name,
        String description,
        Project project,
        Integer orderIndex,
        UnlockMode unlockMode,
        UUID createdBy
    ) {
        TherapyStageEntity stage = new TherapyStageEntity();
        stage.name = name;
        stage.description = description;
        stage.project = project;
        stage.orderIndex = orderIndex;
        stage.unlockMode = unlockMode;
        stage.createdBy = createdBy;
        stage.active = true;
        return stage;
    }

    /**
     * Set the required quiz for AUTO_QUIZ unlock mode.
     */
    public void setRequiredQuiz(Quiz quiz) {
        if (this.unlockMode == UnlockMode.AUTO_QUIZ) {
            this.requiredQuiz = quiz;
        }
    }

    /**
     * Deactivate the stage.
     */
    public void deactivate() {
        this.active = false;
    }

    /**
     * Activate the stage.
     */
    public void activate() {
        this.active = true;
    }

    /**
     * Check if stage requires quiz completion.
     */
    public boolean requiresQuiz() {
        return this.unlockMode == UnlockMode.AUTO_QUIZ && this.requiredQuiz != null;
    }
}
