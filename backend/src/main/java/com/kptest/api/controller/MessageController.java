package com.kptest.api.controller;

import com.kptest.api.dto.*;
import com.kptest.application.service.MessageService;
import com.kptest.domain.message.ThreadType;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.util.List;
import java.util.Map;
import java.util.UUID;

/**
 * Message REST Controller.
 * Handles all message and conversation thread operations.
 */
@Slf4j
@RestController
@RequestMapping("/api/v1/messages")
@RequiredArgsConstructor
@Tag(name = "Messages", description = "Message and conversation management endpoints")
public class MessageController {

    private final MessageService messageService;

    /**
     * Get all message threads.
     */
    @GetMapping("/threads")
    @PreAuthorize("hasAnyRole('ADMIN', 'DOCTOR', 'NURSE', 'RECEPTIONIST', 'USER')")
    @Operation(summary = "Get all threads", description = "Returns a list of message threads with optional filtering")
    public ResponseEntity<List<MessageThreadDto>> getThreads(
        @Parameter(description = "Project ID to filter by")
        @RequestParam(required = false) UUID projectId,

        @Parameter(description = "Thread type to filter by (INDIVIDUAL, GROUP)")
        @RequestParam(required = false) ThreadType type,

        @Parameter(description = "Page number (0-indexed)")
        @RequestParam(defaultValue = "0") int page,

        @Parameter(description = "Page size")
        @RequestParam(defaultValue = "20") int size
    ) {
        log.info("GET /api/v1/messages/threads - projectId={}, type={}, page={}, size={}", projectId, type, page, size);

        List<MessageThreadDto> threads = messageService.getThreads(projectId, type, page, size);

        return ResponseEntity.ok(threads);
    }

    /**
     * Get thread by ID.
     */
    @GetMapping("/threads/{id}")
    @PreAuthorize("hasAnyRole('ADMIN', 'DOCTOR', 'NURSE', 'RECEPTIONIST', 'USER')")
    @Operation(summary = "Get thread by ID", description = "Returns detailed information about a specific thread")
    public ResponseEntity<MessageThreadDto> getThreadById(
        @Parameter(description = "Thread ID")
        @PathVariable UUID id,

        @Parameter(description = "Project ID for validation")
        @RequestParam(required = false) UUID projectId
    ) {
        log.info("GET /api/v1/messages/threads/{}", id);

        MessageThreadDto thread = messageService.getThreadById(id, projectId);

        return ResponseEntity.ok(thread);
    }

    /**
     * Create a new thread.
     */
    @PostMapping("/threads")
    @PreAuthorize("hasAnyRole('ADMIN', 'DOCTOR', 'NURSE', 'RECEPTIONIST')")
    @Operation(summary = "Create thread", description = "Creates a new message thread")
    public ResponseEntity<MessageThreadDto> createThread(
        @Parameter(description = "Thread data")
        @Valid @RequestBody CreateThreadRequest request,

        @AuthenticationPrincipal Jwt jwt
    ) {
        log.info("POST /api/v1/messages/threads - title: {}, type: {}", request.title(), request.type());

        UUID createdBy = UUID.fromString(jwt.getSubject());
        MessageThreadDto thread = messageService.createThread(request, createdBy);

        return ResponseEntity
            .status(HttpStatus.CREATED)
            .body(thread);
    }

    /**
     * Get messages in a thread.
     */
    @GetMapping("/threads/{id}/messages")
    @PreAuthorize("hasAnyRole('ADMIN', 'DOCTOR', 'NURSE', 'RECEPTIONIST', 'USER')")
    @Operation(summary = "Get thread messages", description = "Returns messages in a specific thread")
    public ResponseEntity<List<MessageDto>> getThreadMessages(
        @Parameter(description = "Thread ID")
        @PathVariable UUID id,

        @Parameter(description = "Page number (0-indexed)")
        @RequestParam(defaultValue = "0") int page,

        @Parameter(description = "Page size")
        @RequestParam(defaultValue = "50") int size
    ) {
        log.info("GET /api/v1/messages/threads/{}/messages - page={}, size={}", id, page, size);

        List<MessageDto> messages = messageService.getMessages(id, page, size);

        return ResponseEntity.ok(messages);
    }

    /**
     * Send a message in a thread.
     */
    @PostMapping("/threads/{id}/messages")
    @PreAuthorize("hasAnyRole('ADMIN', 'DOCTOR', 'NURSE', 'RECEPTIONIST', 'USER')")
    @Operation(summary = "Send message", description = "Sends a new message to a thread")
    public ResponseEntity<MessageDto> sendMessage(
        @Parameter(description = "Thread ID")
        @PathVariable UUID id,

        @Parameter(description = "Message data")
        @Valid @RequestBody SendMessageRequest request,

        @AuthenticationPrincipal Jwt jwt
    ) {
        log.info("POST /api/v1/messages/threads/{}/messages - thread: {}", id, id);

        UUID senderId = UUID.fromString(jwt.getSubject());
        MessageDto message = messageService.sendMessage(id, request, senderId);

        return ResponseEntity
            .status(HttpStatus.CREATED)
            .body(message);
    }

    /**
     * Mark a message as read.
     */
    @PostMapping("/messages/{id}/read")
    @PreAuthorize("hasAnyRole('ADMIN', 'DOCTOR', 'NURSE', 'RECEPTIONIST', 'USER')")
    @Operation(summary = "Mark message as read", description = "Marks a message as read by the current user")
    public ResponseEntity<MessageDto> markAsRead(
        @Parameter(description = "Message ID")
        @PathVariable UUID id,

        @AuthenticationPrincipal Jwt jwt
    ) {
        log.info("POST /api/v1/messages/messages/{}/read", id);

        UUID userId = UUID.fromString(jwt.getSubject());
        MessageDto message = messageService.markAsRead(id, userId);

        return ResponseEntity.ok(message);
    }

    /**
     * Upload an attachment to a message.
     */
    @PostMapping("/messages/{id}/attachments")
    @PreAuthorize("hasAnyRole('ADMIN', 'DOCTOR', 'NURSE', 'RECEPTIONIST', 'USER')")
    @Operation(summary = "Upload attachment", description = "Uploads a file attachment to a message")
    public ResponseEntity<MessageAttachmentDto> uploadAttachment(
        @Parameter(description = "Message ID")
        @PathVariable UUID id,

        @Parameter(description = "File to upload")
        @RequestParam("file") MultipartFile file,

        @AuthenticationPrincipal Jwt jwt
    ) throws IOException {
        log.info("POST /api/v1/messages/messages/{}/attachments - file: {}", id, file.getOriginalFilename());

        UUID userId = UUID.fromString(jwt.getSubject());
        MessageAttachmentDto attachment = messageService.uploadAttachment(id, file, userId);

        return ResponseEntity
            .status(HttpStatus.CREATED)
            .body(attachment);
    }

    /**
     * Get unread messages.
     */
    @GetMapping("/unread")
    @PreAuthorize("hasAnyRole('ADMIN', 'DOCTOR', 'NURSE', 'RECEPTIONIST', 'USER')")
    @Operation(summary = "Get unread messages", description = "Returns unread messages for the current user")
    public ResponseEntity<Map<String, Object>> getUnreadMessages(
        @Parameter(description = "Project ID to filter by")
        @RequestParam(required = false) UUID projectId,

        @Parameter(description = "Page number (0-indexed)")
        @RequestParam(defaultValue = "0") int page,

        @Parameter(description = "Page size")
        @RequestParam(defaultValue = "20") int size,

        @AuthenticationPrincipal Jwt jwt
    ) {
        UUID userId = UUID.fromString(jwt.getSubject());
        
        log.info("GET /api/v1/messages/unread - userId={}, projectId={}, page={}, size={}", userId, projectId, page, size);

        long count = messageService.getUnreadCount(userId, projectId);
        List<MessageDto> messages = messageService.getUnreadMessages(userId, projectId, page, size);

        return ResponseEntity.ok(Map.of(
            "data", messages,
            "total", count
        ));
    }

    /**
     * Get unread count.
     */
    @GetMapping("/unread/count")
    @PreAuthorize("hasAnyRole('ADMIN', 'DOCTOR', 'NURSE', 'RECEPTIONIST', 'USER')")
    @Operation(summary = "Get unread count", description = "Returns the count of unread messages for the current user")
    public ResponseEntity<Map<String, Long>> getUnreadCount(
        @Parameter(description = "Project ID to filter by")
        @RequestParam(required = false) UUID projectId,

        @AuthenticationPrincipal Jwt jwt
    ) {
        UUID userId = UUID.fromString(jwt.getSubject());
        
        log.info("GET /api/v1/messages/unread/count - userId={}, projectId={}", userId, projectId);

        long count = messageService.getUnreadCount(userId, projectId);

        return ResponseEntity.ok(Map.of(
            "count", count
        ));
    }
}
