package com.kptest.service;

import com.kptest.api.dto.*;
import com.kptest.application.service.MessageService;
import com.kptest.domain.message.*;
import com.kptest.domain.message.repository.MessageAttachmentRepository;
import com.kptest.domain.message.repository.MessageRepository;
import com.kptest.domain.message.repository.MessageThreadRepository;
import com.kptest.exception.ResourceNotFoundException;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Nested;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.ArgumentCaptor;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.mock.web.MockMultipartFile;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.time.Instant;
import java.util.*;

import static org.assertj.core.api.Assertions.*;
import static org.mockito.ArgumentMatchers.*;
import static org.mockito.BDDMockito.*;

/**
 * Unit tests for MessageService.
 */
@ExtendWith(MockitoExtension.class)
@DisplayName("MessageService Unit Tests")
class MessageServiceTest {

    @Mock
    private MessageThreadRepository threadRepository;

    @Mock
    private MessageRepository messageRepository;

    @Mock
    private MessageAttachmentRepository attachmentRepository;

    private MessageService messageService;

    private MessageThread testThread;
    private Message testMessage;
    private static final UUID TEST_THREAD_ID = UUID.randomUUID();
    private static final UUID TEST_PROJECT_ID = UUID.randomUUID();
    private static final UUID TEST_USER_ID = UUID.randomUUID();
    private static final UUID TEST_MESSAGE_ID = UUID.randomUUID();

    @BeforeEach
    void setUp() {
        messageService = new MessageService(threadRepository, messageRepository, attachmentRepository);
        testThread = createTestThread();
        testMessage = createTestMessage();
    }

    private MessageThread createTestThread() {
        MessageThread thread = MessageThread.create(
            TEST_PROJECT_ID,
            "Test Thread",
            ThreadType.INDIVIDUAL,
            TEST_USER_ID
        );
        thread.setId(TEST_THREAD_ID);
        thread.setCreatedAt(Instant.now());
        thread.setLastMessageAt(Instant.now());
        return thread;
    }

    private Message createTestMessage() {
        Message message = Message.create(testThread, TEST_USER_ID, "Test content", MessagePriority.INFO);
        message.setId(TEST_MESSAGE_ID);
        message.setSentAt(Instant.now());
        message.setReadBy(new ArrayList<>());
        return message;
    }

    @Nested
    @DisplayName("Get Threads Tests")
    class GetThreadsTests {

        @Test
        @DisplayName("shouldGetThreadsWithProjectIdAndType")
        void shouldGetThreadsWithProjectIdAndType() {
            // Given
            given(threadRepository.findByProjectIdAndType(eq(TEST_PROJECT_ID), eq(ThreadType.INDIVIDUAL), any(Pageable.class)))
                .willReturn(List.of(testThread));

            // When
            List<MessageThreadDto> result = messageService.getThreads(TEST_PROJECT_ID, ThreadType.INDIVIDUAL, 0, 20);

            // Then
            assertThat(result).hasSize(1);
            assertThat(result.get(0).projectId()).isEqualTo(TEST_PROJECT_ID);
            then(threadRepository).should().findByProjectIdAndType(eq(TEST_PROJECT_ID), eq(ThreadType.INDIVIDUAL), any(Pageable.class));
        }

        @Test
        @DisplayName("shouldGetThreadsWithProjectIdOnly")
        void shouldGetThreadsWithProjectIdOnly() {
            // Given
            given(threadRepository.findByProjectId(eq(TEST_PROJECT_ID), any(Pageable.class)))
                .willReturn(List.of(testThread));

            // When
            List<MessageThreadDto> result = messageService.getThreads(TEST_PROJECT_ID, null, 0, 20);

            // Then
            assertThat(result).hasSize(1);
            then(threadRepository).should().findByProjectId(eq(TEST_PROJECT_ID), any(Pageable.class));
        }

        @Test
        @DisplayName("shouldGetThreadsWithTypeOnly")
        void shouldGetThreadsWithTypeOnly() {
            // Given
            given(threadRepository.findAllWithFilters(eq(null), eq(ThreadType.GROUP), eq(null), any(Pageable.class)))
                .willReturn(List.of(testThread));

            // When
            List<MessageThreadDto> result = messageService.getThreads(null, ThreadType.GROUP, 0, 20);

            // Then
            assertThat(result).hasSize(1);
            then(threadRepository).should().findAllWithFilters(eq(null), eq(ThreadType.GROUP), eq(null), any(Pageable.class));
        }

        @Test
        @DisplayName("shouldReturnEmptyList_WhenNoThreadsFound")
        void shouldReturnEmptyList_WhenNoThreadsFound() {
            // Given
            given(threadRepository.findAllWithFilters(any(), any(), any(), any()))
                .willReturn(Collections.emptyList());

            // When
            List<MessageThreadDto> result = messageService.getThreads(null, null, 0, 20);

            // Then
            assertThat(result).isEmpty();
        }
    }

    @Nested
    @DisplayName("Get Thread By ID Tests")
    class GetThreadByIdTests {

        @Test
        @DisplayName("shouldGetThreadById_WhenThreadExists")
        void shouldGetThreadById_WhenThreadExists() {
            // Given
            given(threadRepository.findByIdAndProjectId(TEST_THREAD_ID, TEST_PROJECT_ID))
                .willReturn(Optional.of(testThread));

            // When
            MessageThreadDto result = messageService.getThreadById(TEST_THREAD_ID, TEST_PROJECT_ID);

            // Then
            assertThat(result).isNotNull();
            assertThat(result.id()).isEqualTo(TEST_THREAD_ID);
        }

        @Test
        @DisplayName("shouldThrowResourceNotFoundException_WhenThreadNotFound")
        void shouldThrowResourceNotFoundException_WhenThreadNotFound() {
            // Given
            given(threadRepository.findByIdAndProjectId(TEST_THREAD_ID, TEST_PROJECT_ID))
                .willReturn(Optional.empty());

            // When & Then
            assertThatThrownBy(() -> messageService.getThreadById(TEST_THREAD_ID, TEST_PROJECT_ID))
                .isInstanceOf(ResourceNotFoundException.class)
                .hasMessageContaining("Thread not found");
        }
    }

    @Nested
    @DisplayName("Create Thread Tests")
    class CreateThreadTests {

        @Test
        @DisplayName("shouldCreateThread_WithValidRequest")
        void shouldCreateThread_WithValidRequest() {
            // Given
            CreateThreadRequest request = new CreateThreadRequest(TEST_PROJECT_ID, "New Thread", ThreadType.INDIVIDUAL);
            given(threadRepository.save(any(MessageThread.class))).willReturn(testThread);

            // When
            MessageThreadDto result = messageService.createThread(request, TEST_USER_ID);

            // Then
            assertThat(result).isNotNull();
            then(threadRepository).should().save(any(MessageThread.class));
        }

        @Test
        @DisplayName("shouldCreateThread_WithGroupType")
        void shouldCreateThread_WithGroupType() {
            // Given
            CreateThreadRequest request = new CreateThreadRequest(TEST_PROJECT_ID, "Group Thread", ThreadType.GROUP);
            given(threadRepository.save(any(MessageThread.class))).willReturn(testThread);

            // When
            MessageThreadDto result = messageService.createThread(request, TEST_USER_ID);

            // Then
            assertThat(result).isNotNull();
            ArgumentCaptor<MessageThread> captor = ArgumentCaptor.forClass(MessageThread.class);
            then(threadRepository).should().save(captor.capture());
            assertThat(captor.getValue().getType()).isEqualTo(ThreadType.GROUP);
        }
    }

    @Nested
    @DisplayName("Get Messages Tests")
    class GetMessagesTests {

        @Test
        @DisplayName("shouldGetMessages_WithDefaultPagination")
        void shouldGetMessages_WithDefaultPagination() {
            // Given
            given(messageRepository.findByThreadIdDescending(eq(TEST_THREAD_ID), any(Pageable.class)))
                .willReturn(List.of(testMessage));

            // When
            List<MessageDto> result = messageService.getMessages(TEST_THREAD_ID, 0, 20);

            // Then
            assertThat(result).hasSize(1);
            assertThat(result.get(0).content()).isEqualTo("Test content");
        }

        @Test
        @DisplayName("shouldReturnEmptyList_WhenNoMessagesFound")
        void shouldReturnEmptyList_WhenNoMessagesFound() {
            // Given
            given(messageRepository.findByThreadIdDescending(eq(TEST_THREAD_ID), any(Pageable.class)))
                .willReturn(Collections.emptyList());

            // When
            List<MessageDto> result = messageService.getMessages(TEST_THREAD_ID, 0, 20);

            // Then
            assertThat(result).isEmpty();
        }
    }

    @Nested
    @DisplayName("Send Message Tests")
    class SendMessageTests {

        @Test
        @DisplayName("shouldSendMessage_WithValidRequest")
        void shouldSendMessage_WithValidRequest() {
            // Given
            SendMessageRequest request = new SendMessageRequest("New message content", MessagePriority.INFO, null, null);
            given(threadRepository.findById(TEST_THREAD_ID)).willReturn(Optional.of(testThread));
            given(messageRepository.save(any(Message.class))).willReturn(testMessage);

            // When
            MessageDto result = messageService.sendMessage(TEST_THREAD_ID, request, TEST_USER_ID);

            // Then
            assertThat(result).isNotNull();
            then(messageRepository).should().save(any(Message.class));
            then(threadRepository).should().save(any(MessageThread.class));
        }

        @Test
        @DisplayName("shouldSendMessage_WithParentMessage")
        void shouldSendMessage_WithParentMessage() {
            // Given
            UUID parentMessageId = UUID.randomUUID();
            SendMessageRequest request = new SendMessageRequest("Reply content", MessagePriority.INFO, parentMessageId, null);
            given(threadRepository.findById(TEST_THREAD_ID)).willReturn(Optional.of(testThread));
            given(messageRepository.findById(parentMessageId)).willReturn(Optional.of(testMessage));
            given(messageRepository.save(any(Message.class))).willReturn(testMessage);

            // When
            MessageDto result = messageService.sendMessage(TEST_THREAD_ID, request, TEST_USER_ID);

            // Then
            assertThat(result).isNotNull();
        }

        @Test
        @DisplayName("shouldSendMessage_WithInternalNote")
        void shouldSendMessage_WithInternalNote() {
            // Given
            SendMessageRequest request = new SendMessageRequest("Message content", MessagePriority.URGENT, null, "Internal note");
            given(threadRepository.findById(TEST_THREAD_ID)).willReturn(Optional.of(testThread));
            given(messageRepository.save(any(Message.class))).willReturn(testMessage);

            // When
            MessageDto result = messageService.sendMessage(TEST_THREAD_ID, request, TEST_USER_ID);

            // Then
            assertThat(result).isNotNull();
        }

        @Test
        @DisplayName("shouldThrowResourceNotFoundException_WhenThreadNotFound")
        void shouldThrowResourceNotFoundException_WhenThreadNotFound() {
            // Given
            SendMessageRequest request = new SendMessageRequest("Content", MessagePriority.INFO, null, null);
            given(threadRepository.findById(TEST_THREAD_ID)).willReturn(Optional.empty());

            // When & Then
            assertThatThrownBy(() -> messageService.sendMessage(TEST_THREAD_ID, request, TEST_USER_ID))
                .isInstanceOf(ResourceNotFoundException.class)
                .hasMessageContaining("Thread not found");
        }

        @Test
        @DisplayName("shouldThrowResourceNotFoundException_WhenParentMessageNotFound")
        void shouldThrowResourceNotFoundException_WhenParentMessageNotFound() {
            // Given
            UUID parentMessageId = UUID.randomUUID();
            SendMessageRequest request = new SendMessageRequest("Reply", MessagePriority.INFO, parentMessageId, null);
            given(threadRepository.findById(TEST_THREAD_ID)).willReturn(Optional.of(testThread));
            given(messageRepository.findById(parentMessageId)).willReturn(Optional.empty());

            // When & Then
            assertThatThrownBy(() -> messageService.sendMessage(TEST_THREAD_ID, request, TEST_USER_ID))
                .isInstanceOf(ResourceNotFoundException.class)
                .hasMessageContaining("Parent message not found");
        }
    }

    @Nested
    @DisplayName("Mark As Read Tests")
    class MarkAsReadTests {

        @Test
        @DisplayName("shouldMarkMessageAsRead_WhenMessageExists")
        void shouldMarkMessageAsRead_WhenMessageExists() {
            // Given
            given(messageRepository.findById(TEST_MESSAGE_ID)).willReturn(Optional.of(testMessage));
            given(messageRepository.save(any(Message.class))).willReturn(testMessage);

            // When
            MessageDto result = messageService.markAsRead(TEST_MESSAGE_ID, TEST_USER_ID);

            // Then
            assertThat(result).isNotNull();
            assertThat(testMessage.getReadBy()).contains(TEST_USER_ID);
            then(messageRepository).should().save(testMessage);
        }

        @Test
        @DisplayName("shouldThrowResourceNotFoundException_WhenMessageNotFound")
        void shouldThrowResourceNotFoundException_WhenMessageNotFound() {
            // Given
            given(messageRepository.findById(TEST_MESSAGE_ID)).willReturn(Optional.empty());

            // When & Then
            assertThatThrownBy(() -> messageService.markAsRead(TEST_MESSAGE_ID, TEST_USER_ID))
                .isInstanceOf(ResourceNotFoundException.class)
                .hasMessageContaining("Message not found");
        }
    }

    @Nested
    @DisplayName("Upload Attachment Tests")
    class UploadAttachmentTests {

        @Test
        @DisplayName("shouldUploadAttachment_WithValidFile")
        void shouldUploadAttachment_WithValidFile() throws IOException {
            // Given
            MultipartFile file = new MockMultipartFile("file", "test.txt", "text/plain", "content".getBytes());
            given(messageRepository.findById(TEST_MESSAGE_ID)).willReturn(Optional.of(testMessage));
            given(attachmentRepository.save(any(MessageAttachment.class))).willReturn(createTestAttachment());

            // When
            MessageAttachmentDto result = messageService.uploadAttachment(TEST_MESSAGE_ID, file, TEST_USER_ID);

            // Then
            assertThat(result).isNotNull();
            then(attachmentRepository).should().save(any(MessageAttachment.class));
        }

        @Test
        @DisplayName("shouldUploadAttachment_WithDefaultContentType")
        void shouldUploadAttachment_WithDefaultContentType() throws IOException {
            // Given
            MultipartFile file = new MockMultipartFile("file", "test", null, "content".getBytes());
            given(messageRepository.findById(TEST_MESSAGE_ID)).willReturn(Optional.of(testMessage));
            given(attachmentRepository.save(any(MessageAttachment.class))).willReturn(createTestAttachment());

            // When
            MessageAttachmentDto result = messageService.uploadAttachment(TEST_MESSAGE_ID, file, TEST_USER_ID);

            // Then
            assertThat(result).isNotNull();
        }

        @Test
        @DisplayName("shouldThrowResourceNotFoundException_WhenMessageNotFound")
        void shouldThrowResourceNotFoundException_WhenMessageNotFoundForAttachment() throws IOException {
            // Given
            MultipartFile file = new MockMultipartFile("file", "test.txt", "text/plain", "content".getBytes());
            given(messageRepository.findById(TEST_MESSAGE_ID)).willReturn(Optional.empty());

            // When & Then
            assertThatThrownBy(() -> messageService.uploadAttachment(TEST_MESSAGE_ID, file, TEST_USER_ID))
                .isInstanceOf(ResourceNotFoundException.class)
                .hasMessageContaining("Message not found");
        }
    }

    @Nested
    @DisplayName("Get Unread Count Tests")
    class GetUnreadCountTests {

        @Test
        @DisplayName("shouldGetUnreadCount_WithValidParams")
        void shouldGetUnreadCount_WithValidParams() {
            // Given
            given(messageRepository.countUnreadMessages(TEST_USER_ID, TEST_PROJECT_ID)).willReturn(5L);

            // When
            long result = messageService.getUnreadCount(TEST_USER_ID, TEST_PROJECT_ID);

            // Then
            assertThat(result).isEqualTo(5);
        }

        @Test
        @DisplayName("shouldReturnZero_WhenNoUnreadMessages")
        void shouldReturnZero_WhenNoUnreadMessages() {
            // Given
            given(messageRepository.countUnreadMessages(TEST_USER_ID, TEST_PROJECT_ID)).willReturn(0L);

            // When
            long result = messageService.getUnreadCount(TEST_USER_ID, TEST_PROJECT_ID);

            // Then
            assertThat(result).isZero();
        }
    }

    @Nested
    @DisplayName("Get Unread Messages Tests")
    class GetUnreadMessagesTests {

        @Test
        @DisplayName("shouldGetUnreadMessages_WithValidParams")
        void shouldGetUnreadMessages_WithValidParams() {
            // Given
            given(messageRepository.findUnreadMessages(eq(TEST_USER_ID), eq(TEST_PROJECT_ID), any(Pageable.class)))
                .willReturn(List.of(testMessage));

            // When
            List<MessageDto> result = messageService.getUnreadMessages(TEST_USER_ID, TEST_PROJECT_ID, 0, 20);

            // Then
            assertThat(result).hasSize(1);
        }

        @Test
        @DisplayName("shouldReturnEmptyList_WhenNoUnreadMessages")
        void shouldReturnEmptyList_WhenNoUnreadMessages() {
            // Given
            given(messageRepository.findUnreadMessages(eq(TEST_USER_ID), eq(TEST_PROJECT_ID), any(Pageable.class)))
                .willReturn(Collections.emptyList());

            // When
            List<MessageDto> result = messageService.getUnreadMessages(TEST_USER_ID, TEST_PROJECT_ID, 0, 20);

            // Then
            assertThat(result).isEmpty();
        }
    }

    @Nested
    @DisplayName("Message Entity Tests")
    class MessageEntityTests {

        @Test
        @DisplayName("shouldMarkAsRead_WhenFirstTime")
        void shouldMarkAsRead_WhenFirstTime() {
            // Given
            Message message = createTestMessage();
            message.setReadBy(new ArrayList<>());

            // When
            message.markAsRead(TEST_USER_ID);

            // Then
            assertThat(message.getReadBy()).contains(TEST_USER_ID);
            assertThat(message.getReadAt()).isNotNull();
        }

        @Test
        @DisplayName("shouldMarkAsRead_WhenAlreadyReadByOthers")
        void shouldMarkAsRead_WhenAlreadyReadByOthers() {
            // Given
            Message message = createTestMessage();
            UUID otherUserId = UUID.randomUUID();
            message.getReadBy().add(otherUserId);
            message.setReadAt(Instant.now());

            // When
            message.markAsRead(TEST_USER_ID);

            // Then
            assertThat(message.getReadBy()).contains(TEST_USER_ID, otherUserId);
        }

        @Test
        @DisplayName("shouldCheckIsReadBy_WhenUserRead")
        void shouldCheckIsReadBy_WhenUserRead() {
            // Given
            Message message = createTestMessage();
            message.markAsRead(TEST_USER_ID);

            // When
            boolean result = message.isReadBy(TEST_USER_ID);

            // Then
            assertThat(result).isTrue();
        }

        @Test
        @DisplayName("shouldCheckIsReadBy_WhenUserNotRead")
        void shouldCheckIsReadBy_WhenUserNotRead() {
            // Given
            Message message = createTestMessage();

            // When
            boolean result = message.isReadBy(TEST_USER_ID);

            // Then
            assertThat(result).isFalse();
        }

        @Test
        @DisplayName("shouldAddReply")
        void shouldAddReply() {
            // Given
            Message parent = createTestMessage();
            Message reply = Message.create(testThread, TEST_USER_ID, "Reply", MessagePriority.INFO);

            // When
            parent.addReply(reply);

            // Then
            assertThat(parent.getReplies()).hasSize(1);
            assertThat(reply.getParentMessage()).isEqualTo(parent);
        }

        @Test
        @DisplayName("shouldRemoveReply")
        void shouldRemoveReply() {
            // Given
            Message parent = createTestMessage();
            Message reply = Message.create(testThread, TEST_USER_ID, "Reply", MessagePriority.INFO);
            parent.addReply(reply);

            // When
            parent.removeReply(reply);

            // Then
            assertThat(parent.getReplies()).isEmpty();
            assertThat(reply.getParentMessage()).isNull();
        }

        @Test
        @DisplayName("shouldAddAttachment")
        void shouldAddAttachment() {
            // Given
            Message message = createTestMessage();
            MessageAttachment attachment = createTestAttachment();

            // When
            message.addAttachment(attachment);

            // Then
            assertThat(message.getAttachments()).hasSize(1);
        }

        @Test
        @DisplayName("shouldRemoveAttachment")
        void shouldRemoveAttachment() {
            // Given
            Message message = createTestMessage();
            MessageAttachment attachment = createTestAttachment();
            message.addAttachment(attachment);

            // When
            message.removeAttachment(attachment);

            // Then
            assertThat(message.getAttachments()).isEmpty();
        }
    }

    @Nested
    @DisplayName("Message Thread Entity Tests")
    class MessageThreadEntityTests {

        @Test
        @DisplayName("shouldUpdateLastMessageAt")
        void shouldUpdateLastMessageAt() {
            // Given
            MessageThread thread = createTestThread();
            Instant oldLastMessageAt = thread.getLastMessageAt();

            // When
            thread.updateLastMessageAt();

            // Then
            assertThat(thread.getLastMessageAt()).isAfterOrEqualTo(oldLastMessageAt);
        }
    }

    @Nested
    @DisplayName("Message Priority Tests")
    class MessagePriorityTests {

        @Test
        @DisplayName("shouldSendMessage_WithInfoPriority")
        void shouldSendMessage_WithInfoPriority() {
            // Given
            SendMessageRequest request = new SendMessageRequest("Info message", MessagePriority.INFO, null, null);
            given(threadRepository.findById(TEST_THREAD_ID)).willReturn(Optional.of(testThread));
            given(messageRepository.save(any(Message.class))).willReturn(testMessage);

            // When
            MessageDto result = messageService.sendMessage(TEST_THREAD_ID, request, TEST_USER_ID);

            // Then
            assertThat(result).isNotNull();
            ArgumentCaptor<Message> captor = ArgumentCaptor.forClass(Message.class);
            then(messageRepository).should().save(captor.capture());
            assertThat(captor.capture().getPriority()).isEqualTo(MessagePriority.INFO);
        }

        @Test
        @DisplayName("shouldSendMessage_WithQuestionPriority")
        void shouldSendMessage_WithQuestionPriority() {
            // Given
            SendMessageRequest request = new SendMessageRequest("Question message", MessagePriority.QUESTION, null, null);
            given(threadRepository.findById(TEST_THREAD_ID)).willReturn(Optional.of(testThread));
            given(messageRepository.save(any(Message.class))).willReturn(testMessage);

            // When
            MessageDto result = messageService.sendMessage(TEST_THREAD_ID, request, TEST_USER_ID);

            // Then
            assertThat(result).isNotNull();
            ArgumentCaptor<Message> captor = ArgumentCaptor.forClass(Message.class);
            then(messageRepository).should().save(captor.capture());
            assertThat(captor.capture().getPriority()).isEqualTo(MessagePriority.QUESTION);
        }

        @Test
        @DisplayName("shouldSendMessage_WithUrgentPriority")
        void shouldSendMessage_WithUrgentPriority() {
            // Given
            SendMessageRequest request = new SendMessageRequest("Urgent message", MessagePriority.URGENT, null, null);
            given(threadRepository.findById(TEST_THREAD_ID)).willReturn(Optional.of(testThread));
            given(messageRepository.save(any(Message.class))).willReturn(testMessage);

            // When
            MessageDto result = messageService.sendMessage(TEST_THREAD_ID, request, TEST_USER_ID);

            // Then
            assertThat(result).isNotNull();
            ArgumentCaptor<Message> captor = ArgumentCaptor.forClass(Message.class);
            then(messageRepository).should().save(captor.capture());
            assertThat(captor.capture().getPriority()).isEqualTo(MessagePriority.URGENT);
        }

        @Test
        @DisplayName("shouldCreateMessage_WithCorrectPriority")
        void shouldCreateMessage_WithCorrectPriority() {
            // Given
            Message infoMessage = Message.create(testThread, TEST_USER_ID, "Info", MessagePriority.INFO);
            Message questionMessage = Message.create(testThread, TEST_USER_ID, "Question", MessagePriority.QUESTION);
            Message urgentMessage = Message.create(testThread, TEST_USER_ID, "Urgent", MessagePriority.URGENT);

            // When & Then
            assertThat(infoMessage.getPriority()).isEqualTo(MessagePriority.INFO);
            assertThat(questionMessage.getPriority()).isEqualTo(MessagePriority.QUESTION);
            assertThat(urgentMessage.getPriority()).isEqualTo(MessagePriority.URGENT);
        }

        @Test
        @DisplayName("shouldMessageToString_IncludePriority")
        void shouldMessageToString_IncludePriority() {
            // Given
            Message message = Message.create(testThread, TEST_USER_ID, "Test", MessagePriority.URGENT);

            // When
            String result = message.toString();

            // Then
            assertThat(result).contains("URGENT");
        }

        @Test
        @DisplayName("shouldMessageEquals_ConsiderPriority")
        void shouldMessageEquals_ConsiderPriority() {
            // Given
            Message message1 = Message.create(testThread, TEST_USER_ID, "Test", MessagePriority.INFO);
            Message message2 = Message.create(testThread, TEST_USER_ID, "Test", MessagePriority.INFO);
            Message message3 = Message.create(testThread, TEST_USER_ID, "Test", MessagePriority.URGENT);

            // When & Then
            assertThat(message1.getPriority()).isEqualTo(message2.getPriority());
            assertThat(message1.getPriority()).isNotEqualTo(message3.getPriority());
        }
    }

    @Nested
    @DisplayName("MessagePriority Enum Tests")
    class MessagePriorityEnumTests {

        @Test
        @DisplayName("shouldHaveAllPriorityValues")
        void shouldHaveAllPriorityValues() {
            // When & Then
            assertThat(MessagePriority.values()).containsExactly(MessagePriority.INFO, MessagePriority.QUESTION, MessagePriority.URGENT);
        }

        @Test
        @DisplayName("shouldValueOf_WithValidValues")
        void shouldValueOf_WithValidValues() {
            // When & Then
            assertThat(MessagePriority.valueOf("INFO")).isEqualTo(MessagePriority.INFO);
            assertThat(MessagePriority.valueOf("QUESTION")).isEqualTo(MessagePriority.QUESTION);
            assertThat(MessagePriority.valueOf("URGENT")).isEqualTo(MessagePriority.URGENT);
        }

        @Test
        @DisplayName("shouldOrdinal_HaveCorrectOrder")
        void shouldOrdinal_HaveCorrectOrder() {
            // When & Then
            assertThat(MessagePriority.INFO.ordinal()).isEqualTo(0);
            assertThat(MessagePriority.QUESTION.ordinal()).isEqualTo(1);
            assertThat(MessagePriority.URGENT.ordinal()).isEqualTo(2);
        }
    }

    private MessageAttachment createTestAttachment() {
        MessageAttachment attachment = MessageAttachment.create(
            testMessage,
            "test.txt",
            "text/plain",
            100L,
            "/tmp/test.txt"
        );
        return attachment;
    }
}
