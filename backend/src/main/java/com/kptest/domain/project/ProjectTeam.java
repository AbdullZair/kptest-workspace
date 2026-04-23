package com.kptest.domain.project;

import com.kptest.domain.project.Project;
import com.kptest.domain.user.User;
import jakarta.persistence.*;
import lombok.*;
import org.springframework.data.annotation.CreatedDate;
import org.springframework.data.jpa.domain.support.AuditingEntityListener;

import java.time.Instant;
import java.util.UUID;

/**
 * Staff member assignment to a project.
 */
@Entity
@Table(name = "project_team", 
       uniqueConstraints = @UniqueConstraint(
           columnNames = {"project_id", "user_id"}
       ))
@EntityListeners(AuditingEntityListener.class)
@Getter
@Setter
@NoArgsConstructor(access = AccessLevel.PROTECTED)
@EqualsAndHashCode(of = "id")
public class ProjectTeam {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "project_id", nullable = false)
    private Project project;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private ProjectRole role;

    @Column(name = "assigned_at", nullable = false)
    private Instant assignedAt;

    @CreatedDate
    @Column(name = "created_at", nullable = false, updatable = false)
    private Instant createdAt;

    /**
     * Factory method for assigning staff to a project.
     */
    public static ProjectTeam assign(Project project, User user, ProjectRole role) {
        ProjectTeam pt = new ProjectTeam();
        pt.project = project;
        pt.user = user;
        pt.role = role;
        pt.assignedAt = Instant.now();
        return pt;
    }
}
