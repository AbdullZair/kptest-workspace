package com.kptest.domain.material;

import jakarta.persistence.*;
import lombok.*;
import org.springframework.data.annotation.CreatedDate;
import org.springframework.data.annotation.LastModifiedDate;
import org.springframework.data.jpa.domain.support.AuditingEntityListener;

import java.time.Instant;
import java.util.UUID;

/**
 * Material progress entity tracking patient progress through educational materials.
 */
@Entity
@Table(name = "material_progress")
@EntityListeners(AuditingEntityListener.class)
@Getter
@Setter
@NoArgsConstructor(access = AccessLevel.PROTECTED)
@EqualsAndHashCode(of = "id")
public class MaterialProgress {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @Column(name = "material_id", nullable = false)
    private UUID materialId;

    @Column(name = "patient_id", nullable = false)
    private UUID patientId;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private MaterialStatus status;

    @Column(name = "started_at")
    private Instant startedAt;

    @Column(name = "completed_at")
    private Instant completedAt;

    @Column(name = "time_spent_seconds", nullable = false)
    private Integer timeSpentSeconds;

    @Column(name = "quiz_score")
    private Integer quizScore;

    @CreatedDate
    @Column(name = "created_at", nullable = false, updatable = false)
    private Instant createdAt;

    @LastModifiedDate
    @Column(name = "updated_at", nullable = false)
    private Instant updatedAt;

    /**
     * Material status enum.
     */
    public enum MaterialStatus {
        PENDING,
        IN_PROGRESS,
        COMPLETED
    }

    /**
     * Factory method for creating material progress.
     */
    public static MaterialProgress create(UUID materialId, UUID patientId) {
        MaterialProgress progress = new MaterialProgress();
        progress.materialId = materialId;
        progress.patientId = patientId;
        progress.status = MaterialStatus.PENDING;
        progress.timeSpentSeconds = 0;
        return progress;
    }

    /**
     * Start viewing the material.
     */
    public void start() {
        if (this.status == MaterialStatus.PENDING) {
            this.status = MaterialStatus.IN_PROGRESS;
            this.startedAt = Instant.now();
        }
    }

    /**
     * Mark material as completed.
     */
    public void complete(Integer quizScore) {
        this.status = MaterialStatus.COMPLETED;
        this.completedAt = Instant.now();
        if (quizScore != null) {
            this.quizScore = quizScore;
        }
    }

    /**
     * Add time spent on material.
     */
    public void addTimeSpent(int seconds) {
        this.timeSpentSeconds = this.timeSpentSeconds + seconds;
    }

    /**
     * Check if material is completed.
     */
    public boolean isCompleted() {
        return this.status == MaterialStatus.COMPLETED;
    }

    /**
     * Check if material is in progress.
     */
    public boolean isInProgress() {
        return this.status == MaterialStatus.IN_PROGRESS;
    }
}
