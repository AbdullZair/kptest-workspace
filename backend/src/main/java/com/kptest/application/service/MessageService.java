package com.kptest.application.service;

import com.kptest.api.dto.*;
import com.kptest.domain.message.Message;
import com.kptest.domain.message.MessageAttachment;
import com.kptest.domain.message.MessageThread;
import com.kptest.domain.message.ThreadType;
import com.kptest.domain.message.repository.MessageAttachmentRepository;
import com.kptest.domain.message.repository.MessageRepository;
import com.kptest.domain.message.repository.MessageThreadRepository;
import com.kptest.exception.ResourceNotFoundException;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.time.Instant;
import java.util.List;
import java.util.UUID;

/**
 * Message service handling all message-related operations.
 */
@Slf4j
@Service
@RequiredArgsConstructor
@Transactional
public class MessageService {

    private final MessageThreadRepository threadRepository;
    private final MessageRepository messageRepository;
    private final MessageAttachmentRepository attachmentRepository;

    private static final String ATTACHMENT_STORAGE_PATH = "/tmp/message-attachments";

    /**
     * Get all threads with filtering and pagination.
     *
     * @param projectId Project ID to filter by
     * @param type Thread type to filter by
     * @param page Page number
     * @param size Page size
     * @return List of message threads
     */
    @Transactional(readOnly = true)
    public List<MessageThreadDto> getThreads(
        UUID projectId,
        ThreadType type,
        int page,
        int size
    ) {
        log.debug("Finding threads with filters - projectId: {}, type: {}, page: {}, size: {}", projectId, type, page, size);

        Pageable pageable = PageRequest.of(page, size, Sort.by(Sort.Direction.DESC, "lastMessageAt"));
        List<MessageThread> threads;

        if (projectId != null && type != null) {
            threads = threadRepository.findByProjectIdAndType(projectId, type, pageable);
        } else if (projectId != null) {
            threads = threadRepository.findByProjectId(projectId, pageable);
        } else {
            threads = threadRepository.findAllWithFilters(null, type, null, pageable);
        }

        return threads.stream()
            .map(MessageThreadDto::fromEntity)
            .toList();
    }

    /**
     * Get thread by ID.
     *
     * @param id Thread ID
     * @param projectId Project ID for validation
     * @return Message thread DTO
     * @throws ResourceNotFoundException if thread not found
     */
    @Transactional(readOnly = true)
    public MessageThreadDto getThreadById(UUID id, UUID projectId) {
        log.debug("Finding thread by ID: {}", id);

        MessageThread thread = threadRepository.findByIdAndProjectId(id, projectId)
            .orElseThrow(() -> new ResourceNotFoundException("Thread not found with id: " + id));

        return MessageThreadDto.fromEntity(thread);
    }

    /**
     * Create a new thread.
     *
     * @param request Create thread request
     * @param createdBy User ID creating the thread
     * @return Created thread DTO
     */
    public MessageThreadDto createThread(CreateThreadRequest request, UUID createdBy) {
        log.info("Creating thread - project: {}, title: {}, type: {}", request.projectId(), request.title(), request.type());

        MessageThread thread = MessageThread.create(
            request.projectId(),
            request.title(),
            request.type(),
            createdBy
        );

        MessageThread savedThread = threadRepository.save(thread);
        log.info("Created thread with ID: {}", savedThread.getId());

        return MessageThreadDto.fromEntity(savedThread);
    }

    /**
     * Get messages in a thread with pagination.
     *
     * @param threadId Thread ID
     * @param page Page number
     * @param size Page size
     * @return List of messages
     */
    @Transactional(readOnly = true)
    public List<MessageDto> getMessages(UUID threadId, int page, int size) {
        log.debug("Finding messages for thread: {}, page: {}, size: {}", threadId, page, size);

        Pageable pageable = PageRequest.of(page, size, Sort.by(Sort.Direction.DESC, "sentAt"));
        List<Message> messages = messageRepository.findByThreadIdDescending(threadId, pageable);

        // Reverse to get ascending order for display
        List<Message> reversed = messages.reversed();

        return reversed.stream()
            .map(MessageDto::fromEntity)
            .toList();
    }

    /**
     * Send a message in a thread.
     *
     * @param threadId Thread ID
     * @param request Send message request
     * @param senderId User ID sending the message
     * @return Sent message DTO
     * @throws ResourceNotFoundException if thread not found
     */
    public MessageDto sendMessage(UUID threadId, SendMessageRequest request, UUID senderId) {
        log.info("Sending message to thread: {}, sender: {}", threadId, senderId);

        MessageThread thread = threadRepository.findById(threadId)
            .orElseThrow(() -> new ResourceNotFoundException("Thread not found with id: " + threadId));

        Message message = Message.create(thread, senderId, request.content(), request.priority());

        // Set parent message if this is a reply
        if (request.parentMessageId() != null) {
            Message parentMessage = messageRepository.findById(request.parentMessageId())
                .orElseThrow(() -> new ResourceNotFoundException("Parent message not found with id: " + request.parentMessageId()));
            message.addReply(parentMessage);
        }

        // Set internal note if provided
        if (request.internalNote() != null && !request.internalNote().isBlank()) {
            message.setInternalNote(request.internalNote());
        }

        Message savedMessage = messageRepository.save(message);

        // Update thread's last message timestamp
        thread.updateLastMessageAt();
        threadRepository.save(thread);

        log.info("Sent message with ID: {}", savedMessage.getId());

        return MessageDto.fromEntity(savedMessage);
    }

    /**
     * Mark a message as read by a user.
     *
     * @param messageId Message ID
     * @param userId User ID marking as read
     * @return Updated message DTO
     * @throws ResourceNotFoundException if message not found
     */
    public MessageDto markAsRead(UUID messageId, UUID userId) {
        log.info("Marking message as read - messageId: {}, userId: {}", messageId, userId);

        Message message = messageRepository.findById(messageId)
            .orElseThrow(() -> new ResourceNotFoundException("Message not found with id: " + messageId));

        message.markAsRead(userId);
        Message savedMessage = messageRepository.save(message);

        log.info("Marked message as read: {}", messageId);

        return MessageDto.fromEntity(savedMessage);
    }

    /**
     * Upload an attachment to a message.
     *
     * @param messageId Message ID
     * @param file File to upload
     * @param userId User ID uploading the file
     * @return Attachment DTO
     * @throws ResourceNotFoundException if message not found
     * @throws IOException if file storage fails
     */
    public MessageAttachmentDto uploadAttachment(UUID messageId, MultipartFile file, UUID userId) throws IOException {
        log.info("Uploading attachment to message: {}, file: {}, size: {} bytes", messageId, file.getOriginalFilename(), file.getSize());

        Message message = messageRepository.findById(messageId)
            .orElseThrow(() -> new ResourceNotFoundException("Message not found with id: " + messageId));

        // Create storage directory if it doesn't exist
        Path storageDir = Path.of(ATTACHMENT_STORAGE_PATH);
        if (!Files.exists(storageDir)) {
            Files.createDirectories(storageDir);
        }

        // Generate unique file name
        String originalFileName = file.getOriginalFilename() != null ? file.getOriginalFilename() : "unnamed";
        String fileExtension = originalFileName.contains(".")
            ? originalFileName.substring(originalFileName.lastIndexOf("."))
            : "";
        String storedFileName = UUID.randomUUID().toString() + fileExtension;
        Path filePath = storageDir.resolve(storedFileName);

        // Save file
        Files.write(filePath, file.getBytes());
        String storagePath = filePath.toString();

        // Create attachment entity
        MessageAttachment attachment = MessageAttachment.create(
            message,
            originalFileName,
            file.getContentType() != null ? file.getContentType() : "application/octet-stream",
            file.getSize(),
            storagePath
        );

        MessageAttachment savedAttachment = attachmentRepository.save(attachment);

        log.info("Uploaded attachment with ID: {}", savedAttachment.getId());

        return MessageAttachmentDto.fromEntity(savedAttachment);
    }

    /**
     * Get unread message count for a user.
     *
     * @param userId User ID
     * @param projectId Project ID
     * @return Unread message count
     */
    @Transactional(readOnly = true)
    public long getUnreadCount(UUID userId, UUID projectId) {
        log.debug("Counting unread messages for user: {}, project: {}", userId, projectId);

        return messageRepository.countUnreadMessages(userId, projectId);
    }

    /**
     * Get unread messages for a user.
     *
     * @param userId User ID
     * @param projectId Project ID
     * @param page Page number
     * @param size Page size
     * @return List of unread messages
     */
    @Transactional(readOnly = true)
    public List<MessageDto> getUnreadMessages(UUID userId, UUID projectId, int page, int size) {
        log.debug("Finding unread messages for user: {}, project: {}", userId, projectId);

        Pageable pageable = PageRequest.of(page, size, Sort.by(Sort.Direction.DESC, "sentAt"));
        List<Message> messages = messageRepository.findUnreadMessages(userId, projectId, pageable);

        return messages.stream()
            .map(MessageDto::fromEntity)
            .toList();
    }

    /**
     * Get thread by ID without project validation.
     *
     * @param id Thread ID
     * @return Message thread
     * @throws ResourceNotFoundException if thread not found
     */
    private MessageThread findThreadById(UUID id) {
        return threadRepository.findById(id)
            .orElseThrow(() -> new ResourceNotFoundException("Thread not found with id: " + id));
    }
}
