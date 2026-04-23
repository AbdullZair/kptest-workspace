package com.kptest.domain.message.repository;

import com.kptest.domain.message.MessageAttachment;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.UUID;

/**
 * Repository for MessageAttachment entity.
 */
@Repository
public interface MessageAttachmentRepository extends JpaRepository<MessageAttachment, UUID> {

    /**
     * Find attachments by message ID.
     */
    @Query("SELECT a FROM MessageAttachment a WHERE a.message.id = :messageId ORDER BY a.uploadedAt ASC")
    List<MessageAttachment> findByMessageId(@Param("messageId") UUID messageId);

    /**
     * Count attachments by message ID.
     */
    @Query("SELECT COUNT(a) FROM MessageAttachment a WHERE a.message.id = :messageId")
    long countByMessageId(@Param("messageId") UUID messageId);

    /**
     * Delete attachments by message ID.
     */
    void deleteByMessageId(@Param("messageId") UUID messageId);
}
