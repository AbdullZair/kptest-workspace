package com.kptest.domain.patient;

import jakarta.persistence.*;
import lombok.*;
import org.springframework.data.annotation.CreatedDate;
import org.springframework.data.jpa.domain.support.AuditingEntityListener;

import java.time.Instant;
import java.util.UUID;

/**
 * ActivationCode entity for one-time patient activation.
 */
@Entity
@Table(name = "patient_activation_codes")
@EntityListeners(AuditingEntityListener.class)
@Getter
@Setter
@NoArgsConstructor(access = AccessLevel.PROTECTED)
@EqualsAndHashCode(of = "id")
public class ActivationCode {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @Column(name = "patient_id", nullable = false)
    private UUID patientId;

    @Column(name = "code", nullable = false, unique = true, length = 8)
    private String code;

    @Column(name = "expires_at", nullable = false)
    private Instant expiresAt;

    @Column(name = "used_at")
    private Instant usedAt;

    @Column(name = "used_by")
    private UUID usedBy;

    @CreatedDate
    @Column(name = "created_at", nullable = false, updatable = false)
    private Instant createdAt;

    @Column(name = "is_used", nullable = false)
    private boolean isUsed;

    /**
     * Factory method for creating an activation code.
     * Code is valid for 72 hours.
     */
    public static ActivationCode create(UUID patientId, String code) {
        ActivationCode activationCode = new ActivationCode();
        activationCode.patientId = patientId;
        activationCode.code = code;
        activationCode.expiresAt = Instant.now().plusSeconds(72 * 60 * 60); // 72 hours
        activationCode.isUsed = false;
        activationCode.createdAt = Instant.now();
        return activationCode;
    }

    /**
     * Mark the code as used.
     */
    public void markAsUsed(UUID userId) {
        this.isUsed = true;
        this.usedAt = Instant.now();
        this.usedBy = userId;
    }

    /**
     * Check if the code is expired.
     */
    public boolean isExpired() {
        return Instant.now().isAfter(expiresAt);
    }

    /**
     * Check if the code is valid (not used and not expired).
     */
    public boolean isValid() {
        return !isUsed && !isExpired();
    }
}
