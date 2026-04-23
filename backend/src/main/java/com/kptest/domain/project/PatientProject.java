package com.kptest.domain.project;

import com.kptest.domain.patient.Patient;
import com.kptest.domain.staff.Staff;
import jakarta.persistence.*;
import lombok.*;
import org.springframework.data.annotation.CreatedDate;
import org.springframework.data.annotation.LastModifiedDate;
import org.springframework.data.jpa.domain.support.AuditingEntityListener;

import java.math.BigDecimal;
import java.time.Instant;
import java.util.UUID;

/**
 * Join entity representing a patient's enrollment in a project.
 */
@Entity
@Table(name = "patient_projects", 
       uniqueConstraints = @UniqueConstraint(
           columnNames = {"patient_id", "project_id", "left_at"}
       ))
@EntityListeners(AuditingEntityListener.class)
@Getter
@Setter
@NoArgsConstructor(access = AccessLevel.PROTECTED)
@EqualsAndHashCode(of = "id")
public class PatientProject {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "patient_id", nullable = false)
    private Patient patient;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "project_id", nullable = false)
    private Project project;

    @Column(name = "enrolled_at", nullable = false)
    private Instant enrolledAt;

    @Column(name = "left_at")
    private Instant leftAt;

    @Column(name = "removal_reason", length = 500)
    private String removalReason;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "removed_by")
    private Staff removedBy;

    @Enumerated(EnumType.STRING)
    @Column(name = "current_stage", nullable = false)
    private TherapyStage currentStage;

    @Column(name = "compliance_score")
    private BigDecimal complianceScore;

    @CreatedDate
    @Column(name = "created_at", nullable = false, updatable = false)
    private Instant createdAt;

    @LastModifiedDate
    @Column(name = "updated_at", nullable = false)
    private Instant updatedAt;

    /**
     * Factory method for enrolling a patient in a project.
     */
    public static PatientProject enroll(Patient patient, Project project) {
        PatientProject pp = new PatientProject();
        pp.patient = patient;
        pp.project = project;
        pp.enrolledAt = Instant.now();
        pp.currentStage = TherapyStage.NOT_STARTED;
        pp.complianceScore = BigDecimal.ZERO;
        return pp;
    }

    /**
     * Remove patient from project.
     */
    public void remove(Staff remover, String reason) {
        this.leftAt = Instant.now();
        this.removedBy = remover;
        this.removalReason = reason;
        this.currentStage = TherapyStage.REMOVED;
    }

    /**
     * Check if enrollment is active.
     */
    public boolean isActive() {
        return leftAt == null;
    }

    /**
     * Update compliance score.
     */
    public void updateComplianceScore(BigDecimal score) {
        this.complianceScore = score;
    }
}
