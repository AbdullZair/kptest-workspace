package com.kptest.domain.gamification;

import com.kptest.domain.patient.Patient;
import jakarta.persistence.*;
import lombok.*;
import org.springframework.data.annotation.CreatedDate;
import org.springframework.data.jpa.domain.support.AuditingEntityListener;

import java.time.Instant;
import java.util.UUID;

/**
 * PatientBadge entity representing a badge earned by a patient.
 */
@Entity
@Table(name = "patient_badges",
       uniqueConstraints = @UniqueConstraint(
           columnNames = {"patient_id", "badge_id"}
       ))
@EntityListeners(AuditingEntityListener.class)
@Getter
@Setter
@NoArgsConstructor(access = AccessLevel.PROTECTED)
@EqualsAndHashCode(of = "id")
public class PatientBadge {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "patient_id", nullable = false)
    private Patient patient;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "badge_id", nullable = false)
    private Badge badge;

    @Column(name = "earned_at", nullable = false)
    private Instant earnedAt;

    @Column(name = "notified", nullable = false)
    private Boolean notified;

    @Column(name = "created_at", nullable = false, updatable = false)
    @CreatedDate
    private Instant createdAt;

    /**
     * Factory method for awarding a badge to a patient.
     */
    public static PatientBadge award(Patient patient, Badge badge) {
        PatientBadge pb = new PatientBadge();
        pb.patient = patient;
        pb.badge = badge;
        pb.earnedAt = Instant.now();
        pb.notified = false;
        return pb;
    }

    /**
     * Mark badge as notified.
     */
    public void markNotified() {
        this.notified = true;
    }

    /**
     * Check if badge was notified.
     */
    public boolean isNotified() {
        return this.notified != null && this.notified;
    }
}
