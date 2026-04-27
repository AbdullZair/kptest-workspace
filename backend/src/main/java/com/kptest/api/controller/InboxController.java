package com.kptest.api.controller;

import com.kptest.api.dto.DelegateMessageRequest;
import com.kptest.api.dto.InboxMessageDto;
import com.kptest.api.dto.InboxThreadDto;
import com.kptest.application.service.InboxService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

import java.util.Map;
import java.util.UUID;

/**
 * REST Controller for Central Inbox with Delegation.
 */
@Slf4j
@RestController
@RequestMapping("/api/v1/inbox")
@RequiredArgsConstructor
@Tag(name = "Inbox", description = "Central inbox with message aggregation and delegation")
public class InboxController {

    private final InboxService inboxService;

    /**
     * Get all inbox threads with filters.
     */
    @GetMapping("/threads")
    @PreAuthorize("hasAnyRole('ADMIN', 'COORDINATOR', 'DOCTOR', 'NURSE', 'THERAPIST')")
    @Operation(summary = "Get inbox threads", description = "Returns paginated list of inbox threads with filters")
    public ResponseEntity<PageResponse<InboxThreadDto>> getInboxThreads(
        @Parameter(description = "Filter by project ID")
        @RequestParam(required = false) UUID projectId,

        @Parameter(description = "Filter by status (NEW, IN_PROGRESS, RESOLVED, CLOSED)")
        @RequestParam(required = false) String status,

        @Parameter(description = "Filter by assigned user ID")
        @RequestParam(required = false) UUID assignedTo,

        @Parameter(description = "Filter by unread status")
        @RequestParam(required = false) Boolean isUnread,

        @Parameter(description = "Page number")
        @RequestParam(defaultValue = "0") int page,

        @Parameter(description = "Page size")
        @RequestParam(defaultValue = "20") int size,

        @AuthenticationPrincipal UserDetails userDetails
    ) {
        log.info("GET /api/v1/inbox/threads - projectId: {}, status: {}, assignedTo: {}, page: {}, size: {}",
            projectId, status, assignedTo, page, size);

        Page<InboxThreadDto> threadPage = inboxService.getInboxThreads(
            projectId, status, assignedTo, isUnread, page, size
        );

        return ResponseEntity.ok(new PageResponse<>(
            threadPage.getContent(),
            threadPage.getNumber(),
            threadPage.getSize(),
            threadPage.getTotalElements(),
            threadPage.getTotalPages(),
            threadPage.isFirst(),
            threadPage.isLast()
        ));
    }

    /**
     * Get inbox messages with filters.
     */
    @GetMapping("/messages")
    @PreAuthorize("hasAnyRole('ADMIN', 'COORDINATOR', 'DOCTOR', 'NURSE', 'THERAPIST')")
    @Operation(summary = "Get inbox messages", description = "Returns paginated list of inbox messages with filters")
    public ResponseEntity<PageResponse<InboxMessageDto>> getInboxMessages(
        @Parameter(description = "Filter by thread ID")
        @RequestParam(required = false) UUID threadId,

        @Parameter(description = "Filter by priority (LOW, MEDIUM, HIGH, URGENT)")
        @RequestParam(required = false) String priority,

        @Parameter(description = "Filter by status")
        @RequestParam(required = false) String status,

        @Parameter(description = "Filter by assigned user ID")
        @RequestParam(required = false) UUID assignedTo,

        @Parameter(description = "Page number")
        @RequestParam(defaultValue = "0") int page,

        @Parameter(description = "Page size")
        @RequestParam(defaultValue = "20") int size
    ) {
        log.info("GET /api/v1/inbox/messages - threadId: {}, priority: {}, status: {}, page: {}, size: {}",
            threadId, priority, status, page, size);

        Page<InboxMessageDto> messagePage = inboxService.getInboxMessages(
            threadId, priority, status, assignedTo, page, size
        );

        return ResponseEntity.ok(new PageResponse<>(
            messagePage.getContent(),
            messagePage.getNumber(),
            messagePage.getSize(),
            messagePage.getTotalElements(),
            messagePage.getTotalPages(),
            messagePage.isFirst(),
            messagePage.isLast()
        ));
    }

    /**
     * Delegate a thread to a team member.
     */
    @PostMapping("/threads/{threadId}/delegate")
    @PreAuthorize("hasAnyRole('ADMIN', 'COORDINATOR', 'DOCTOR')")
    @Operation(summary = "Delegate thread", description = "Delegates a thread to a team member with status update")
    public ResponseEntity<InboxThreadDto> delegateThread(
        @Parameter(description = "Thread ID")
        @PathVariable UUID threadId,

        @Parameter(description = "Delegation request")
        @Valid @RequestBody DelegateMessageRequest request,

        @AuthenticationPrincipal UserDetails userDetails
    ) {
        log.info("POST /api/v1/inbox/threads/{}/delegate - assigneeId: {}, status: {}",
            threadId, request.assigneeId(), request.status());

        UUID currentUserId = getCurrentUserId(userDetails);
        InboxThreadDto result = inboxService.delegateThread(threadId, request, currentUserId);

        return ResponseEntity.ok(result);
    }

    /**
     * Update thread status.
     */
    @PatchMapping("/threads/{threadId}/status")
    @PreAuthorize("hasAnyRole('ADMIN', 'COORDINATOR', 'DOCTOR', 'NURSE', 'THERAPIST')")
    @Operation(summary = "Update thread status", description = "Updates the status of a thread")
    public ResponseEntity<InboxThreadDto> updateThreadStatus(
        @Parameter(description = "Thread ID")
        @PathVariable UUID threadId,

        @Parameter(description = "New status")
        @RequestParam String status,

        @AuthenticationPrincipal UserDetails userDetails
    ) {
        log.info("PATCH /api/v1/inbox/threads/{}/status - status: {}", threadId, status);

        UUID currentUserId = getCurrentUserId(userDetails);
        InboxThreadDto result = inboxService.updateThreadStatus(threadId, status, currentUserId);

        return ResponseEntity.ok(result);
    }

    /**
     * Mark thread as read.
     */
    @PostMapping("/threads/{threadId}/mark-as-read")
    @PreAuthorize("hasAnyRole('ADMIN', 'COORDINATOR', 'DOCTOR', 'NURSE', 'THERAPIST')")
    @Operation(summary = "Mark thread as read", description = "Marks all messages in a thread as read")
    public ResponseEntity<Void> markThreadAsRead(
        @Parameter(description = "Thread ID")
        @PathVariable UUID threadId,

        @AuthenticationPrincipal UserDetails userDetails
    ) {
        log.info("POST /api/v1/inbox/threads/{}/mark-as-read", threadId);

        UUID currentUserId = getCurrentUserId(userDetails);
        inboxService.markThreadAsRead(threadId, currentUserId);

        return ResponseEntity.ok().build();
    }

    /**
     * Get unread count for current user.
     */
    @GetMapping("/unread-count")
    @PreAuthorize("hasAnyRole('ADMIN', 'COORDINATOR', 'DOCTOR', 'NURSE', 'THERAPIST')")
    @Operation(summary = "Get unread count", description = "Returns the count of unread threads for the current user")
    public ResponseEntity<Map<String, Long>> getUnreadCount(
        @AuthenticationPrincipal UserDetails userDetails
    ) {
        UUID currentUserId = getCurrentUserId(userDetails);
        long count = inboxService.getUnreadCount(currentUserId);

        return ResponseEntity.ok(Map.of("count", count));
    }

    /**
     * Helper method to extract user ID from UserDetails.
     */
    private UUID getCurrentUserId(UserDetails userDetails) {
        // In a real implementation, this would extract from JWT or session
        // For now, we'll use a placeholder - the actual implementation depends on your auth setup
        return UUID.fromString("00000000-0000-0000-0000-000000000000");
    }

    /**
     * Page response wrapper.
     */
    public record PageResponse<T>(
        java.util.List<T> content,
        int pageNumber,
        int pageSize,
        long totalElements,
        int totalPages,
        boolean isFirst,
        boolean isLast
    ) {
    }
}
