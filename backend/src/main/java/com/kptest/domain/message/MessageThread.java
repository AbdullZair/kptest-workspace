package com.kptest.domain.message;

import jakarta.persistence.*;
import lombok.*;
import org.springframework.data.annotation.CreatedDate;
import org.springframework.data.annotation.LastModifiedDate;
import org.springframework.data.jpa.domain.support.AuditingEntityListener;

import java.time.Instant;
import java.util.UUID;

/**
 * MessageThread entity representing a conversation thread.
 */
@Entity
@Table(name = "message_threads")
@EntityListeners(AuditingEntityListener.class)
@Getter
@Setter
@NoArgsConstructor(access = AccessLevel.PROTECTED)
@EqualsAndHashCode(of = "id")
public class MessageThread {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @Column(name = "project_id", nullable = false)
    private UUID projectId;

    @Column(name = "title", nullable = false, length = 255)
    private String title;

    @Enumerated(EnumType.STRING)
    @Column(name = "thread_type", nullable = false)
    private ThreadType type;

    @Column(name = "created_by", nullable = false)
    private UUID createdBy;

    @CreatedDate
    @Column(name = "created_at", nullable = false, updatable = false)
    private Instant createdAt;

    @LastModifiedDate
    @Column(name = "updated_at")
    private Instant updatedAt;

    @Column(name = "last_message_at")
    private Instant lastMessageAt;

    /**
     * Factory method for creating a message thread.
     */
    public static MessageThread create(UUID projectId, String title, ThreadType type, UUID createdBy) {
        MessageThread thread = new MessageThread();
        thread.projectId = projectId;
        thread.title = title;
        thread.type = type;
        thread.createdBy = createdBy;
        thread.lastMessageAt = Instant.now();
        return thread;
    }

    /**
     * Update last message timestamp.
     */
    public void updateLastMessageAt() {
        this.lastMessageAt = Instant.now();
    }
}
