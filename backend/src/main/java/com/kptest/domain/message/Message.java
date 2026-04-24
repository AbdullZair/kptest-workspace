package com.kptest.domain.message;

import com.vladmihalcea.hibernate.type.json.JsonType;
import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.Type;
import org.springframework.data.annotation.CreatedDate;
import org.springframework.data.jpa.domain.support.AuditingEntityListener;

import java.time.Instant;
import java.util.ArrayList;
import java.util.List;
import java.util.UUID;

/**
 * Message entity representing a single message in a conversation thread.
 */
@Entity
@Table(name = "messages")
@EntityListeners(AuditingEntityListener.class)
@Getter
@Setter
@NoArgsConstructor(access = AccessLevel.PROTECTED)
@EqualsAndHashCode(of = "id")
public class Message {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "thread_id", nullable = false)
    private MessageThread thread;

    @Column(name = "sender_id", nullable = false)
    private UUID senderId;

    @Column(name = "content", nullable = false, columnDefinition = "TEXT")
    private String content;

    @Enumerated(EnumType.STRING)
    @Column(name = "priority", nullable = false)
    private MessagePriority priority;

    @CreatedDate
    @Column(name = "sent_at", nullable = false, updatable = false)
    private Instant sentAt;

    @Column(name = "read_at")
    private Instant readAt;

    @Type(JsonType.class)
    @Column(name = "read_by", columnDefinition = "jsonb")
    private List<UUID> readBy;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "parent_message_id")
    private Message parentMessage;

    @OneToMany(mappedBy = "parentMessage", cascade = CascadeType.ALL, orphanRemoval = true)
    @Setter(AccessLevel.NONE)
    private List<Message> replies = new ArrayList<>();

    @Column(name = "internal_note", length = 1000)
    private String internalNote;

    @OneToMany(mappedBy = "message", cascade = CascadeType.ALL, orphanRemoval = true)
    @Setter(AccessLevel.NONE)
    private List<MessageAttachment> attachments = new ArrayList<>();

    /**
     * Factory method for creating a message.
     */
    public static Message create(MessageThread thread, UUID senderId, String content, MessagePriority priority) {
        Message message = new Message();
        message.thread = thread;
        message.senderId = senderId;
        message.content = content;
        message.priority = priority;
        message.readBy = new ArrayList<>();
        return message;
    }

    /**
     * Mark message as read by a user.
     */
    public void markAsRead(UUID userId) {
        if (this.readBy == null) {
            this.readBy = new ArrayList<>();
        }
        if (!this.readBy.contains(userId)) {
            this.readBy.add(userId);
        }
        if (this.readBy.size() == 1) {
            this.readAt = Instant.now();
        }
    }

    /**
     * Check if message is read by a specific user.
     */
    public boolean isReadBy(UUID userId) {
        return this.readBy != null && this.readBy.contains(userId);
    }

    /**
     * Add a reply to this message.
     */
    public void addReply(Message reply) {
        this.replies.add(reply);
        reply.parentMessage = this;
    }

    /**
     * Remove a reply from this message.
     */
    public void removeReply(Message reply) {
        this.replies.remove(reply);
        reply.parentMessage = null;
    }

    /**
     * Add an attachment to this message.
     */
    public void addAttachment(MessageAttachment attachment) {
        this.attachments.add(attachment);
        attachment.setMessage(this);
    }

    /**
     * Remove an attachment from this message.
     */
    public void removeAttachment(MessageAttachment attachment) {
        this.attachments.remove(attachment);
        attachment.setMessage(null);
    }
}
