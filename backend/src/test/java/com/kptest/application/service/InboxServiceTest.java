package com.kptest.application.service;

import com.kptest.api.dto.DelegateMessageRequest;
import com.kptest.api.dto.InboxMessageDto;
import com.kptest.api.dto.InboxThreadDto;
import com.kptest.domain.message.InboxThreadStatus;
import com.kptest.domain.message.Message;
import com.kptest.domain.message.MessagePriority;
import com.kptest.domain.message.MessageThread;
import com.kptest.domain.message.ThreadType;
import com.kptest.domain.message.repository.InboxThreadStatusRepository;
import com.kptest.domain.message.repository.MessageRepository;
import com.kptest.domain.message.repository.MessageThreadRepository;
import com.kptest.domain.project.Project;
import com.kptest.domain.project.ProjectRepository;
import com.kptest.domain.user.User;
import com.kptest.domain.user.UserRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.data.domain.Page;

import java.time.Instant;
import java.util.*;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

/**
 * Unit tests for InboxService.
 */
@ExtendWith(MockitoExtension.class)
class InboxServiceTest {

    @Mock
    private MessageThreadRepository threadRepository;

    @Mock
    private MessageRepository messageRepository;

    @Mock
    private InboxThreadStatusRepository inboxStatusRepository;

    @Mock
    private UserRepository userRepository;

    @Mock
    private ProjectRepository projectRepository;

    @InjectMocks
    private InboxService inboxService;

    private MessageThread testThread;
    private InboxThreadStatus testStatus;
    private User testUser;
    private Project testProject;

    @BeforeEach
    void setUp() {
        testThread = new MessageThread();
        testThread.setId(UUID.randomUUID());
        testThread.setProjectId(UUID.randomUUID());
        testThread.setTitle("Test Thread");
        testThread.setType(ThreadType.PATIENT_COMMUNICATION);
        testThread.setCreatedBy(UUID.randomUUID());
        testThread.setCreatedAt(Instant.now());
        testThread.setLastMessageAt(Instant.now());

        testStatus = InboxThreadStatus.create(testThread.getId());
        testStatus.setStatus(InboxThreadStatus.Status.NEW);

        testUser = new User();
        testUser.setId(UUID.randomUUID());
        testUser.setEmail("test@example.com");

        testProject = new Project();
        testProject.setId(testThread.getProjectId());
        testProject.setName("Test Project");
    }

    @Test
    void getInboxThreads_ReturnsPageOfThreads() {
        // Arrange
        when(threadRepository.findAll()).thenReturn(List.of(testThread));
        when(inboxStatusRepository.findAll()).thenReturn(List.of(testStatus));
        when(inboxStatusRepository.save(any())).thenReturn(testStatus);
        when(projectRepository.findById(testThread.getProjectId())).thenReturn(Optional.of(testProject));
        when(userRepository.findById(testThread.getCreatedBy())).thenReturn(Optional.of(testUser));
        when(messageRepository.countByThreadId(testThread.getId())).thenReturn(5L);

        // Act
        Page<InboxThreadDto> result = inboxService.getInboxThreads(null, null, null, null, 0, 20);

        // Assert
        assertNotNull(result);
        assertEquals(1, result.getContent().size());
        assertEquals(testThread.getId(), result.getContent().get(0).id());
        verify(threadRepository, times(1)).findAll();
    }

    @Test
    void getInboxThreads_FiltersByProject() {
        // Arrange
        UUID otherProjectId = UUID.randomUUID();
        when(threadRepository.findAll()).thenReturn(List.of(testThread));
        when(inboxStatusRepository.findAll()).thenReturn(List.of(testStatus));

        // Act
        Page<InboxThreadDto> result = inboxService.getInboxThreads(otherProjectId, null, null, null, 0, 20);

        // Assert
        assertNotNull(result);
        assertEquals(0, result.getContent().size());
    }

    @Test
    void getInboxThreads_FiltersByStatus() {
        // Arrange
        when(threadRepository.findAll()).thenReturn(List.of(testThread));
        when(inboxStatusRepository.findAll()).thenReturn(List.of(testStatus));
        when(inboxStatusRepository.save(any())).thenReturn(testStatus);

        // Act - filter by RESOLVED status
        Page<InboxThreadDto> result = inboxService.getInboxThreads(null, "RESOLVED", null, null, 0, 20);

        // Assert
        assertNotNull(result);
        assertEquals(0, result.getContent().size());

        // Act - filter by NEW status
        result = inboxService.getInboxThreads(null, "NEW", null, null, 0, 20);

        // Assert
        assertNotNull(result);
        assertEquals(1, result.getContent().size());
    }

    @Test
    void delegateThread_Success() {
        // Arrange
        UUID assigneeId = UUID.randomUUID();
        DelegateMessageRequest request = new DelegateMessageRequest(assigneeId, "IN_PROGRESS", "Test comment");

        when(threadRepository.findById(testThread.getId())).thenReturn(Optional.of(testThread));
        when(userRepository.findById(assigneeId)).thenReturn(Optional.of(testUser));
        when(inboxStatusRepository.findByThreadId(testThread.getId())).thenReturn(Optional.of(testStatus));
        when(inboxStatusRepository.save(any())).thenReturn(testStatus);
        when(projectRepository.findById(testThread.getProjectId())).thenReturn(Optional.of(testProject));
        when(userRepository.findById(testThread.getCreatedBy())).thenReturn(Optional.of(testUser));
        when(messageRepository.countByThreadId(testThread.getId())).thenReturn(5L);

        // Act
        InboxThreadDto result = inboxService.delegateThread(testThread.getId(), request, UUID.randomUUID());

        // Assert
        assertNotNull(result);
        assertEquals(testThread.getId(), result.id());
        assertEquals(InboxThreadStatus.Status.IN_PROGRESS.name(), result.status().name());
        assertEquals(assigneeId, result.assigned_to());
        verify(inboxStatusRepository, times(1)).save(any());
    }

    @Test
    void delegateThread_ThreadNotFound_ThrowsException() {
        // Arrange
        UUID threadId = UUID.randomUUID();
        DelegateMessageRequest request = new DelegateMessageRequest(UUID.randomUUID(), "NEW", "Test");

        when(threadRepository.findById(threadId)).thenReturn(Optional.empty());

        // Act & Assert
        assertThrows(Exception.class, () -> inboxService.delegateThread(threadId, request, UUID.randomUUID()));
    }

    @Test
    void updateThreadStatus_Success() {
        // Arrange
        when(threadRepository.findById(testThread.getId())).thenReturn(Optional.of(testThread));
        when(inboxStatusRepository.findByThreadId(testThread.getId())).thenReturn(Optional.of(testStatus));
        when(inboxStatusRepository.save(any())).thenReturn(testStatus);
        when(projectRepository.findById(testThread.getProjectId())).thenReturn(Optional.of(testProject));
        when(userRepository.findById(testThread.getCreatedBy())).thenReturn(Optional.of(testUser));
        when(messageRepository.countByThreadId(testThread.getId())).thenReturn(5L);

        // Act
        InboxThreadDto result = inboxService.updateThreadStatus(testThread.getId(), "RESOLVED", UUID.randomUUID());

        // Assert
        assertNotNull(result);
        assertEquals(InboxThreadStatus.Status.RESOLVED, testStatus.getStatus());
    }

    @Test
    void getUnreadCount_ReturnsCount() {
        // Arrange
        UUID userId = UUID.randomUUID();
        when(inboxStatusRepository.countUnreadByAssignedTo(userId)).thenReturn(3L);

        // Act
        long result = inboxService.getUnreadCount(userId);

        // Assert
        assertEquals(3, result);
        verify(inboxStatusRepository, times(1)).countUnreadByAssignedTo(userId);
    }
}
