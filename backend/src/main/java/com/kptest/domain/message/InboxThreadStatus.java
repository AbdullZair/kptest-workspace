package com.kptest.domain.message;

import jakarta.persistence.*;
import lombok.*;
import org.springframework.data.annotation.CreatedDate;
import org.springframework.data.annotation.LastModifiedDate;
import org.springframework.data.jpa.domain.support.AuditingEntityListener;

import java.time.Instant;
import java.util.UUID;

/**
 * InboxThreadStatus entity for tracking thread delegation and status.
 */
@Entity
@Table(name = "inbox_thread_status")
@EntityListeners(AuditingEntityListener.class)
@Getter
@Setter
@NoArgsConstructor(access = AccessLevel.PROTECTED)
@EqualsAndHashCode(of = "id")
public class InboxThreadStatus {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @Column(name = "thread_id", nullable = false, unique = true)
    private UUID threadId;

    @Enumerated(EnumType.STRING)
    @Column(name = "status", nullable = false)
    private Status status;

    @Column(name = "assigned_to")
    private UUID assignedTo;

    @CreatedDate
    @Column(name = "created_at", nullable = false, updatable = false)
    private Instant createdAt;

    @LastModifiedDate
    @Column(name = "updated_at", nullable = false)
    private Instant updatedAt;

    @Column(name = "resolved_at")
    private Instant resolvedAt;

    @Column(name = "closed_at")
    private Instant closedAt;

    /**
     * Status enumeration for inbox threads.
     */
    public enum Status {
        NEW,
        IN_PROGRESS,
        RESOLVED,
        CLOSED
    }

    /**
     * Factory method for creating a new inbox thread status.
     */
    public static InboxThreadStatus create(UUID threadId) {
        InboxThreadStatus status = new InboxThreadStatus();
        status.threadId = threadId;
        status.status = Status.NEW;
        status.createdAt = Instant.now();
        status.updatedAt = Instant.now();
        return status;
    }

    /**
     * Update the status of the thread.
     */
    public void updateStatus(Status newStatus) {
        this.status = newStatus;
        this.updatedAt = Instant.now();

        if (newStatus == Status.RESOLVED && this.resolvedAt == null) {
            this.resolvedAt = Instant.now();
        } else if (newStatus == Status.CLOSED && this.closedAt == null) {
            this.closedAt = Instant.now();
        }
    }

    /**
     * Assign the thread to a user.
     */
    public void assignTo(UUID userId) {
        this.assignedTo = userId;
        this.updatedAt = Instant.now();

        if (this.status == Status.NEW) {
            this.status = Status.IN_PROGRESS;
        }
    }
}
