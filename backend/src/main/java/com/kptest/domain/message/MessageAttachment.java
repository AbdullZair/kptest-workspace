package com.kptest.domain.message;

import jakarta.persistence.*;
import lombok.*;
import org.springframework.data.annotation.CreatedDate;
import org.springframework.data.jpa.domain.support.AuditingEntityListener;

import java.time.Instant;
import java.util.UUID;

/**
 * MessageAttachment entity representing a file attachment to a message.
 */
@Entity
@Table(name = "message_attachments")
@EntityListeners(AuditingEntityListener.class)
@Getter
@NoArgsConstructor(access = AccessLevel.PROTECTED)
@EqualsAndHashCode(of = "id")
public class MessageAttachment {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "message_id", nullable = false)
    private Message message;

    @Column(name = "file_name", nullable = false, length = 255)
    private String fileName;

    @Column(name = "file_type", nullable = false, length = 100)
    private String fileType;

    @Column(name = "file_size", nullable = false)
    private Long fileSize;

    @Column(name = "storage_path", nullable = false, length = 500)
    private String storagePath;

    @CreatedDate
    @Column(name = "uploaded_at", nullable = false, updatable = false)
    private Instant uploadedAt;

    /**
     * Set the message for this attachment (package-private for Message entity).
     */
    void setMessage(Message message) {
        this.message = message;
    }

    /**
     * Factory method for creating an attachment.
     */
    public static MessageAttachment create(Message message, String fileName, String fileType, Long fileSize, String storagePath) {
        MessageAttachment attachment = new MessageAttachment();
        attachment.message = message;
        attachment.fileName = fileName;
        attachment.fileType = fileType;
        attachment.fileSize = fileSize;
        attachment.storagePath = storagePath;
        return attachment;
    }
}
