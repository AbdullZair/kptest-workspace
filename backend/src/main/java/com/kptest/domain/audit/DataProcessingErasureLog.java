package com.kptest.domain.audit;

import jakarta.persistence.*;
import lombok.*;
import org.springframework.data.annotation.CreatedDate;
import org.springframework.data.jpa.domain.support.AuditingEntityListener;

import java.time.Instant;
import java.util.UUID;

/**
 * Data Processing Erasure Log entity for tracking patient data erasures.
 * Required by RODO Article 17 for audit trail of right to be forgotten requests.
 */
@Entity
@Table(name = "data_processing_erasure_logs")
@EntityListeners(AuditingEntityListener.class)
@Getter
@Setter
@NoArgsConstructor(access = AccessLevel.PROTECTED)
@EqualsAndHashCode(of = "id")
public class DataProcessingErasureLog {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @Column(name = "patient_id", nullable = false)
    private UUID patientId;

    @Column(nullable = false, columnDefinition = "TEXT")
    private String reason;

    @Column(name = "erased_by", nullable = false)
    private UUID erasedBy;

    @CreatedDate
    @Column(name = "erased_at", nullable = false, updatable = false)
    private Instant erasedAt;

    /**
     * Factory method for creating an erasure log.
     */
    public static DataProcessingErasureLog create(
        UUID patientId,
        String reason,
        UUID erasedBy
    ) {
        DataProcessingErasureLog log = new DataProcessingErasureLog();
        log.patientId = patientId;
        log.reason = reason;
        log.erasedBy = erasedBy;
        return log;
    }
}
