package com.kptest.domain.audit;

import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.JdbcTypeCode;
import org.hibernate.type.SqlTypes;
import org.springframework.data.annotation.CreatedDate;
import org.springframework.data.annotation.LastModifiedDate;
import org.springframework.data.jpa.domain.support.AuditingEntityListener;

import java.time.Instant;
import java.util.List;
import java.util.UUID;

/**
 * Data Processing Activity entity for RODO Article 30 compliance.
 * Tracks all data processing activities within the system.
 */
@Entity
@Table(name = "data_processing_activities")
@EntityListeners(AuditingEntityListener.class)
@Getter
@Setter
@NoArgsConstructor(access = AccessLevel.PROTECTED)
@EqualsAndHashCode(of = "id")
public class DataProcessingActivity {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @Column(nullable = false, length = 255)
    private String name;

    @Column(nullable = false, columnDefinition = "TEXT")
    private String purpose;

    @Enumerated(EnumType.STRING)
    @Column(name = "legal_basis", nullable = false, length = 50)
    private LegalBasis legalBasis;

    @JdbcTypeCode(SqlTypes.JSON)
    @Column(columnDefinition = "jsonb")
    private List<String> categories;

    @JdbcTypeCode(SqlTypes.JSON)
    @Column(columnDefinition = "jsonb")
    private List<String> recipients;

    @Column(name = "retention_period", length = 100)
    private String retentionPeriod;

    @Column(name = "security_measures", columnDefinition = "TEXT")
    private String securityMeasures;

    @Column(name = "data_controller", length = 255)
    private String dataController;

    @Column(name = "data_processor", length = 255)
    private String dataProcessor;

    @Column(name = "created_by")
    private UUID createdBy;

    @CreatedDate
    @Column(name = "created_at", nullable = false, updatable = false)
    private Instant createdAt;

    @LastModifiedDate
    @Column(name = "updated_at", nullable = false)
    private Instant updatedAt;

    /**
     * Legal basis for data processing as defined by RODO Article 6.
     */
    public enum LegalBasis {
        CONSENT,
        CONTRACT,
        LEGAL_OBLIGATION,
        VITAL_INTEREST,
        PUBLIC_TASK,
        LEGITIMATE_INTEREST
    }

    /**
     * Factory method for creating a data processing activity.
     */
    public static DataProcessingActivity create(
        String name,
        String purpose,
        LegalBasis legalBasis,
        UUID createdBy
    ) {
        DataProcessingActivity activity = new DataProcessingActivity();
        activity.name = name;
        activity.purpose = purpose;
        activity.legalBasis = legalBasis;
        activity.createdBy = createdBy;
        return activity;
    }

    /**
     * Set categories of data subjects.
     */
    public DataProcessingActivity withCategories(List<String> categories) {
        this.categories = categories;
        return this;
    }

    /**
     * Set categories of recipients.
     */
    public DataProcessingActivity withRecipients(List<String> recipients) {
        this.recipients = recipients;
        return this;
    }

    /**
     * Set retention period.
     */
    public DataProcessingActivity withRetentionPeriod(String retentionPeriod) {
        this.retentionPeriod = retentionPeriod;
        return this;
    }

    /**
     * Set security measures.
     */
    public DataProcessingActivity withSecurityMeasures(String securityMeasures) {
        this.securityMeasures = securityMeasures;
        return this;
    }

    /**
     * Set data controller.
     */
    public DataProcessingActivity withDataController(String dataController) {
        this.dataController = dataController;
        return this;
    }

    /**
     * Set data processor.
     */
    public DataProcessingActivity withDataProcessor(String dataProcessor) {
        this.dataProcessor = dataProcessor;
        return this;
    }
}
