package com.kptest.domain.project;

import jakarta.persistence.*;
import lombok.*;
import org.springframework.data.annotation.CreatedDate;
import org.springframework.data.annotation.LastModifiedDate;
import org.springframework.data.jpa.domain.support.AuditingEntityListener;

import java.time.Instant;
import java.util.UUID;

/**
 * Patient stage progress entity tracking patient progression through therapy stages.
 */
@Entity
@Table(name = "patient_stage_progress")
@EntityListeners(AuditingEntityListener.class)
@Getter
@Setter
@NoArgsConstructor(access = AccessLevel.PROTECTED)
@EqualsAndHashCode(of = "id")
public class PatientStageProgress {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "patient_project_id", nullable = false)
    private PatientProject patientProject;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "stage_id", nullable = false)
    private TherapyStageEntity stage;

    @Column(name = "started_at")
    private Instant startedAt;

    @Column(name = "completed_at")
    private Instant completedAt;

    @Column(name = "unlocked_at")
    private Instant unlockedAt;

    @Enumerated(EnumType.STRING)
    @Column(name = "status", nullable = false)
    private StageStatus status;

    @Column(name = "completed_by")
    private UUID completedBy;

    @Column(name = "completion_reason", length = 500)
    private String completionReason;

    @Column(name = "created_at", nullable = false, updatable = false)
    @CreatedDate
    private Instant createdAt;

    @Column(name = "updated_at", nullable = false)
    @LastModifiedDate
    private Instant updatedAt;

    /**
     * Stage status enum.
     */
    public enum StageStatus {
        LOCKED,      // Stage is not yet accessible
        AVAILABLE,   // Stage is unlocked and in progress
        COMPLETED    // Stage is completed
    }

    /**
     * Factory method for creating stage progress.
     */
    public static PatientStageProgress create(
        PatientProject patientProject,
        TherapyStageEntity stage
    ) {
        PatientStageProgress progress = new PatientStageProgress();
        progress.patientProject = patientProject;
        progress.stage = stage;
        progress.status = StageStatus.LOCKED;
        return progress;
    }

    /**
     * Unlock the stage.
     */
    public void unlock() {
        this.unlockedAt = Instant.now();
        this.status = StageStatus.AVAILABLE;
        if (this.startedAt == null) {
            this.startedAt = Instant.now();
        }
    }

    /**
     * Complete the stage.
     */
    public void complete(UUID completedBy, String reason) {
        this.completedAt = Instant.now();
        this.completedBy = completedBy;
        this.completionReason = reason;
        this.status = StageStatus.COMPLETED;
    }

    /**
     * Check if stage is completed.
     */
    public boolean isCompleted() {
        return this.status == StageStatus.COMPLETED;
    }

    /**
     * Check if stage is unlocked.
     */
    public boolean isUnlocked() {
        return this.unlockedAt != null;
    }
}
