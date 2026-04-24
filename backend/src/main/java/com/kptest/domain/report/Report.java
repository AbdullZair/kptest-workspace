package com.kptest.domain.report;

import jakarta.persistence.*;
import lombok.*;
import org.springframework.data.annotation.CreatedDate;
import org.springframework.data.jpa.domain.support.AuditingEntityListener;

import java.time.Instant;
import java.time.LocalDate;
import java.util.UUID;

/**
 * Report entity for storing generated reports and their data.
 */
@Entity
@Table(name = "reports")
@EntityListeners(AuditingEntityListener.class)
@Getter
@Setter
@NoArgsConstructor(access = AccessLevel.PROTECTED)
@EqualsAndHashCode(of = "id")
public class Report {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private ReportType type;

    @Column(name = "project_id")
    private UUID projectId;

    @Column(name = "patient_id")
    private UUID patientId;

    @Column(name = "date_from", nullable = false)
    private LocalDate dateFrom;

    @Column(name = "date_to", nullable = false)
    private LocalDate dateTo;

    @Column(columnDefinition = "jsonb", nullable = false)
    private String data;

    @Column(name = "generated_at", nullable = false, updatable = false)
    @CreatedDate
    private Instant generatedAt;

    @Column(name = "generated_by", nullable = false)
    private UUID generatedBy;

    /**
     * Factory method for creating a report.
     */
    public static Report create(ReportType type, UUID projectId, UUID patientId,
                                 LocalDate dateFrom, LocalDate dateTo, String data, UUID generatedBy) {
        Report report = new Report();
        report.type = type;
        report.projectId = projectId;
        report.patientId = patientId;
        report.dateFrom = dateFrom;
        report.dateTo = dateTo;
        report.data = data;
        report.generatedBy = generatedBy;
        return report;
    }
}
