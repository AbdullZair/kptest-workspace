package com.kptest.domain.project;

import com.kptest.domain.staff.Staff;
import com.kptest.domain.user.User;
import jakarta.persistence.*;
import lombok.*;
import org.springframework.data.annotation.CreatedDate;
import org.springframework.data.annotation.LastModifiedDate;
import org.springframework.data.jpa.domain.support.AuditingEntityListener;

import java.time.Instant;
import java.util.UUID;

/**
 * Therapeutic project entity.
 */
@Entity
@Table(name = "projects")
@EntityListeners(AuditingEntityListener.class)
@Getter
@Setter
@NoArgsConstructor(access = AccessLevel.PROTECTED)
@EqualsAndHashCode(of = "id")
public class Project {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @Column(nullable = false, length = 200)
    private String name;

    @Column(columnDefinition = "TEXT")
    private String description;

    @Column(name = "start_date", nullable = false)
    private Instant startDate;

    @Column(name = "end_date")
    private Instant endDate;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private ProjectStatus status;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "created_by", nullable = false)
    private Staff createdBy;

    @Column(name = "compliance_threshold")
    private Integer complianceThreshold;

    @Column(columnDefinition = "jsonb")
    @org.hibernate.annotations.JdbcTypeCode(org.hibernate.type.SqlTypes.JSON)
    private String config;

    @CreatedDate
    @Column(name = "created_at", nullable = false, updatable = false)
    private Instant createdAt;

    @LastModifiedDate
    @Column(name = "updated_at", nullable = false)
    private Instant updatedAt;

    /**
     * Factory method for creating a project.
     */
    public static Project create(String name, String description, Instant startDate, 
                                  Staff createdBy) {
        Project project = new Project();
        project.name = name;
        project.description = description;
        project.startDate = startDate;
        project.createdBy = createdBy;
        project.status = ProjectStatus.PLANNED;
        project.complianceThreshold = 80; // default 80%
        return project;
    }

    /**
     * Activate the project.
     */
    public void activate() {
        this.status = ProjectStatus.ACTIVE;
    }

    /**
     * Complete the project.
     */
    public void complete() {
        this.status = ProjectStatus.COMPLETED;
        this.endDate = Instant.now();
    }

    /**
     * Archive the project.
     */
    public void archive() {
        this.status = ProjectStatus.ARCHIVED;
    }
}
