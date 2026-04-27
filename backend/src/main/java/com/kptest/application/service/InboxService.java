package com.kptest.application.service;

import com.kptest.api.dto.DelegateMessageRequest;
import com.kptest.api.dto.InboxMessageDto;
import com.kptest.api.dto.InboxThreadDto;
import com.kptest.domain.audit.AuditLog;
import com.kptest.domain.audit.repository.AuditLogRepository;
import com.kptest.domain.message.InboxThreadStatus;
import com.kptest.domain.message.Message;
import com.kptest.domain.message.MessageThread;
import com.kptest.domain.message.repository.InboxThreadStatusRepository;
import com.kptest.domain.message.repository.MessageRepository;
import com.kptest.domain.message.repository.MessageThreadRepository;
import com.kptest.domain.patient.Patient;
import com.kptest.domain.patient.PatientRepository;
import com.kptest.domain.project.Project;
import com.kptest.domain.project.ProjectRepository;
import com.kptest.domain.user.User;
import com.kptest.domain.user.UserRepository;
import com.kptest.exception.ResourceNotFoundException;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.*;
import java.util.stream.Collectors;

/**
 * Inbox service for central message aggregation and delegation.
 */
@Slf4j
@Service
@RequiredArgsConstructor
@Transactional
public class InboxService {

    private final MessageThreadRepository threadRepository;
    private final MessageRepository messageRepository;
    private final InboxThreadStatusRepository inboxStatusRepository;
    private final UserRepository userRepository;
    private final ProjectRepository projectRepository;
    private final PatientRepository patientRepository;
    private final AuditLogRepository auditLogRepository;

    /**
     * Get all inbox threads with filters.
     */
    @Transactional(readOnly = true)
    public Page<InboxThreadDto> getInboxThreads(
        UUID projectId,
        String status,
        UUID assignedTo,
        Boolean isUnread,
        Integer page,
        Integer size
    ) {
        log.info("Getting inbox threads - projectId: {}, status: {}, assignedTo: {}, isUnread: {}, page: {}, size: {}",
            projectId, status, assignedTo, isUnread, page, size);

        Pageable pageable = PageRequest.of(page != null ? page : 0, size != null ? size : 20);

        // Get all threads
        List<MessageThread> allThreads = threadRepository.findAll();

        // Filter by project if provided
        if (projectId != null) {
            allThreads = allThreads.stream()
                .filter(t -> t.getProjectId().equals(projectId))
                .toList();
        }

        // Get inbox statuses
        List<InboxThreadStatus> allStatuses = inboxStatusRepository.findAll();
        Map<UUID, InboxThreadStatus> statusMap = allStatuses.stream()
            .collect(Collectors.toMap(InboxThreadStatus::getThreadId, s -> s));

        // Filter threads based on inbox status
        List<InboxThreadDto> filteredThreads = new ArrayList<>();

        for (MessageThread thread : allThreads) {
            InboxThreadStatus threadStatus = statusMap.computeIfAbsent(
                thread.getId(),
                id -> {
                    InboxThreadStatus newStatus = InboxThreadStatus.create(thread.getId());
                    return inboxStatusRepository.save(newStatus);
                }
            );

            // Filter by status if provided
            if (status != null && !status.isBlank()) {
                if (!InboxMessageDto.ThreadStatus.NEW.name().equals(status)) {
                    continue;
                }
            }

            // Filter by assignedTo if provided
            if (assignedTo != null) {
                if (threadStatus.getAssignedTo() == null || !threadStatus.getAssignedTo().equals(assignedTo)) {
                    continue;
                }
            }

            // Calculate message count and unread count
            long messageCount = messageRepository.countByThreadId(thread.getId());

            // Get project name
            String projectName = projectRepository.findById(thread.getProjectId())
                .map(Project::getName)
                .orElse("Unknown Project");

            // Get creator name
            String creatorName = userRepository.findById(thread.getCreatedBy())
                .map(this::getUserName)
                .orElse("Unknown");

            // Get participants
            List<String> participants = getThreadParticipants(thread.getId());

            // Create DTO
            InboxThreadDto dto = InboxThreadDto.fromEntity(
                thread,
                projectName,
                (int) messageCount,
                0, // Will be calculated per user
                InboxMessageDto.ThreadStatus.NEW,
                threadStatus.getAssignedTo(),
                threadStatus.getAssignedTo() != null ?
                    userRepository.findById(threadStatus.getAssignedTo()).map(this::getUserName).orElse("Unknown") : null,
                creatorName,
                participants
            );

            filteredThreads.add(dto);
        }

        // Apply pagination
        int start = (int) pageable.getOffset();
        int end = Math.min(start + pageable.getPageSize(), filteredThreads.size());
        List<InboxThreadDto> pageContent = filteredThreads.subList(start, end);

        return new PageImpl<>(pageContent, pageable, filteredThreads.size());
    }

    /**
     * Get inbox messages with filters.
     */
    @Transactional(readOnly = true)
    public Page<InboxMessageDto> getInboxMessages(
        UUID threadId,
        String priority,
        String status,
        UUID assignedTo,
        Integer page,
        Integer size
    ) {
        log.info("Getting inbox messages - threadId: {}, priority: {}, status: {}, assignedTo: {}, page: {}, size: {}",
            threadId, priority, status, assignedTo, page, size);

        Pageable pageable = PageRequest.of(page != null ? page : 0, size != null ? size : 20);

        List<Message> messages;
        if (threadId != null) {
            messages = messageRepository.findByThreadId(threadId, pageable);
        } else {
            messages = messageRepository.findAll(pageable).getContent();
        }

        // Filter by priority if provided
        if (priority != null && !priority.isBlank()) {
            messages = messages.stream()
                .filter(m -> m.getPriority().name().equals(priority))
                .toList();
        }

        List<InboxMessageDto> messageDtos = new ArrayList<>();

        for (Message message : messages) {
            MessageThread thread = message.getThread();

            // Get project name
            String projectName = projectRepository.findById(thread.getProjectId())
                .map(Project::getName)
                .orElse("Unknown Project");

            // Get sender name
            String senderName = userRepository.findById(message.getSenderId())
                .map(this::getUserName)
                .orElse("Unknown");

            // Get inbox status
            InboxThreadStatus threadStatus = inboxStatusRepository.findByThreadId(thread.getId())
                .orElseGet(() -> inboxStatusRepository.save(InboxThreadStatus.create(thread.getId())));

            // Check if unread
            boolean isUnread = message.getReadBy() == null || message.getReadBy().isEmpty();

            InboxMessageDto dto = InboxMessageDto.fromEntity(
                message,
                thread.getTitle(),
                thread.getProjectId(),
                projectName,
                senderName,
                InboxMessageDto.ThreadStatus.NEW,
                threadStatus.getAssignedTo(),
                threadStatus.getAssignedTo() != null ?
                    userRepository.findById(threadStatus.getAssignedTo()).map(this::getUserName).orElse("Unknown") : null,
                isUnread
            );

            messageDtos.add(dto);
        }

        int start = (int) pageable.getOffset();
        int end = Math.min(start + pageable.getPageSize(), messageDtos.size());
        List<InboxMessageDto> pageContent = messageDtos.subList(start, end);

        return new PageImpl<>(pageContent, pageable, messageDtos.size());
    }

    /**
     * Delegate a thread to a team member.
     */
    public InboxThreadDto delegateThread(UUID threadId, DelegateMessageRequest request, UUID currentUserId) {
        log.info("Delegating thread {} to user {} with status {}", threadId, request.assigneeId(), request.status());

        MessageThread thread = threadRepository.findById(threadId)
            .orElseThrow(() -> new ResourceNotFoundException("Thread not found with id: " + threadId));

        // Verify assignee exists
        User assignee = userRepository.findById(request.assigneeId())
            .orElseThrow(() -> new ResourceNotFoundException("User not found with id: " + request.assigneeId()));

        // Get or create inbox status
        InboxThreadStatus threadStatus = inboxStatusRepository.findByThreadId(threadId)
            .orElseGet(() -> inboxStatusRepository.save(InboxThreadStatus.create(threadId)));

        // Update status
        InboxThreadStatus.Status newStatus;
        try {
            newStatus = InboxThreadStatus.Status.valueOf(request.status().toUpperCase());
        } catch (IllegalArgumentException e) {
            throw new IllegalArgumentException("Invalid status: " + request.status());
        }

        threadStatus.updateStatus(newStatus);
        threadStatus.assignTo(request.assigneeId());
        inboxStatusRepository.save(threadStatus);

        // Log audit
        logAudit(currentUserId, AuditLog.AuditAction.UPDATE, "MessageThread", threadId,
            Map.of("previousAssignee", threadStatus.getAssignedTo(), "previousStatus", InboxMessageDto.ThreadStatus.NEW.name()),
            Map.of("newAssignee", request.assigneeId(), "newStatus", request.status(), "comment", request.comment()),
            null, null);

        // Get project name
        String projectName = projectRepository.findById(thread.getProjectId())
            .map(Project::getName)
            .orElse("Unknown Project");

        // Get creator name
        String creatorName = userRepository.findById(thread.getCreatedBy())
            .map(this::getUserName)
            .orElse("Unknown");

        List<String> participants = getThreadParticipants(threadId);

        return InboxThreadDto.fromEntity(
            thread,
            projectName,
            (int) messageRepository.countByThreadId(threadId),
            0,
            InboxMessageDto.ThreadStatus.NEW,
            threadStatus.getAssignedTo(),
            getUserName(assignee),
            creatorName,
            participants
        );
    }

    /**
     * Get unread count for a user.
     */
    @Transactional(readOnly = true)
    public long getUnreadCount(UUID userId) {
        log.info("Getting unread count for user: {}", userId);

        // Count threads assigned to user with NEW status
        return inboxStatusRepository.countUnreadByAssignedTo(userId);
    }

    /**
     * Mark thread as read.
     */
    public void markThreadAsRead(UUID threadId, UUID userId) {
        log.info("Marking thread {} as read by user {}", threadId, userId);

        List<Message> messages = messageRepository.findByThreadId(threadId, PageRequest.of(0, 1000));

        for (Message message : messages) {
            message.markAsRead(userId);
        }
        messageRepository.saveAll(messages);
    }

    /**
     * Update thread status.
     */
    public InboxThreadDto updateThreadStatus(UUID threadId, String status, UUID currentUserId) {
        log.info("Updating thread {} status to {}", threadId, status);

        MessageThread thread = threadRepository.findById(threadId)
            .orElseThrow(() -> new ResourceNotFoundException("Thread not found with id: " + threadId));

        InboxThreadStatus threadStatus = inboxStatusRepository.findByThreadId(threadId)
            .orElseGet(() -> inboxStatusRepository.save(InboxThreadStatus.create(threadId)));

        InboxThreadStatus.Status newStatus;
        try {
            newStatus = InboxThreadStatus.Status.valueOf(status.toUpperCase());
        } catch (IllegalArgumentException e) {
            throw new IllegalArgumentException("Invalid status: " + status);
        }

        threadStatus.updateStatus(newStatus);
        inboxStatusRepository.save(threadStatus);

        // Log audit
        logAudit(currentUserId, AuditLog.AuditAction.UPDATE, "MessageThread", threadId,
            Map.of("previousStatus", InboxMessageDto.ThreadStatus.NEW.name()),
            Map.of("newStatus", status),
            null, null);

        String projectName = projectRepository.findById(thread.getProjectId())
            .map(Project::getName)
            .orElse("Unknown Project");

        String creatorName = userRepository.findById(thread.getCreatedBy())
            .map(this::getUserName)
            .orElse("Unknown");

        List<String> participants = getThreadParticipants(threadId);

        return InboxThreadDto.fromEntity(
            thread,
            projectName,
            (int) messageRepository.countByThreadId(threadId),
            0,
            InboxMessageDto.ThreadStatus.NEW,
            threadStatus.getAssignedTo(),
            threadStatus.getAssignedTo() != null ?
                userRepository.findById(threadStatus.getAssignedTo()).map(this::getUserName).orElse("Unknown") : null,
            creatorName,
            participants
        );
    }

    // Helper methods

    private String getUserName(User user) {
        if (user.getStaff() != null && user.getStaff().getFirstName() != null) {
            return user.getStaff().getFirstName() + " " + user.getStaff().getLastName();
        } else if (user.getPatient() != null) {
            return user.getPatient().getFirstName() + " " + user.getPatient().getLastName();
        }
        return user.getEmail();
    }

    private List<String> getThreadParticipants(UUID threadId) {
        List<Message> messages = messageRepository.findByThreadId(threadId, PageRequest.of(0, 100));
        Set<UUID> participantIds = new HashSet<>();

        for (Message message : messages) {
            participantIds.add(message.getSenderId());
            if (message.getReadBy() != null) {
                participantIds.addAll(message.getReadBy());
            }
        }

        return participantIds.stream()
            .map(id -> userRepository.findById(id).map(this::getUserName).orElse("Unknown"))
            .toList();
    }

    private void logAudit(UUID userId, AuditLog.AuditAction action, String entityType,
                         UUID entityId, Map<String, Object> oldValue, Map<String, Object> newValue,
                         String ipAddress, String userAgent) {
        try {
            AuditLog log = AuditLog.create(userId, action, entityType, entityId);
            if (oldValue != null) {
                log.setOldValue(convertToJson(oldValue));
            }
            if (newValue != null) {
                log.setNewValue(convertToJson(newValue));
            }
            log.setIpAddress(ipAddress);
            log.setUserAgent(userAgent);
            auditLogRepository.save(log);
        } catch (Exception e) {
            log.error("Failed to create audit log", e);
        }
    }

    private String convertToJson(Map<String, Object> map) {
        if (map == null) {
            return null;
        }
        StringBuilder sb = new StringBuilder("{");
        for (Map.Entry<String, Object> entry : map.entrySet()) {
            if (sb.length() > 1) {
                sb.append(",");
            }
            sb.append("\"").append(entry.getKey()).append("\":\"").append(entry.getValue()).append("\"");
        }
        sb.append("}");
        return sb.toString();
    }
}
