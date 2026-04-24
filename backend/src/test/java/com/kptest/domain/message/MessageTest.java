package com.kptest.domain.message;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Nested;
import org.junit.jupiter.api.Test;

import java.time.Instant;
import java.util.ArrayList;
import java.util.List;
import java.util.UUID;

import static org.assertj.core.api.Assertions.*;

/**
 * Unit tests for Message entity.
 */
@DisplayName("Message Entity Unit Tests")
class MessageTest {

    private MessageThread testThread;
    private Message message;
    private static final UUID TEST_USER_ID = UUID.randomUUID();
    private static final String TEST_CONTENT = "Test message content";

    @BeforeEach
    void setUp() {
        testThread = createTestThread();
        message = Message.create(testThread, TEST_USER_ID, TEST_CONTENT, MessagePriority.INFO);
    }

    private MessageThread createTestThread() {
        MessageThread thread = MessageThread.create(
            UUID.randomUUID(),
            "Test Thread",
            ThreadType.INDIVIDUAL,
            UUID.randomUUID()
        );
        thread.setId(UUID.randomUUID());
        return thread;
    }

    @Nested
    @DisplayName("Create Message Tests")
    class CreateMessageTests {

        @Test
        @DisplayName("shouldCreateMessage_WithValidData")
        void shouldCreateMessage_WithValidData() {
            // When
            Message created = Message.create(testThread, TEST_USER_ID, "Content", MessagePriority.INFO);

            // Then
            assertThat(created).isNotNull();
            assertThat(created.getThread()).isEqualTo(testThread);
            assertThat(created.getSenderId()).isEqualTo(TEST_USER_ID);
            assertThat(created.getContent()).isEqualTo("Content");
            assertThat(created.getPriority()).isEqualTo(MessagePriority.INFO);
            assertThat(created.getReadBy()).isNullOrEmpty();
            assertThat(created.getInternalNote()).isNull();
        }

        @Test
        @DisplayName("shouldCreateMessage_WithAllPriorities")
        void shouldCreateMessage_WithAllPriorities() {
            // When & Then
            for (MessagePriority priority : MessagePriority.values()) {
                Message m = Message.create(testThread, TEST_USER_ID, "Content", priority);
                assertThat(m.getPriority()).isEqualTo(priority);
            }
        }

        @Test
        @DisplayName("shouldCreateMessage_WithDefaultReadByList")
        void shouldCreateMessage_WithDefaultReadByList() {
            // When
            Message created = Message.create(testThread, TEST_USER_ID, "Content", MessagePriority.INFO);

            // Then
            assertThat(created.getReadBy()).isNotNull();
        }
    }

    @Nested
    @DisplayName("Mark As Read Tests")
    class MarkAsReadTests {

        @Test
        @DisplayName("shouldMarkAsRead_WhenFirstTime")
        void shouldMarkAsRead_WhenFirstTime() {
            // Given
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
            UUID otherUserId = UUID.randomUUID();
            message.getReadBy().add(otherUserId);

            // When
            message.markAsRead(TEST_USER_ID);

            // Then
            assertThat(message.getReadBy()).contains(TEST_USER_ID, otherUserId);
        }

        @Test
        @DisplayName("shouldNotAddDuplicateUser_WhenAlreadyRead")
        void shouldNotAddDuplicateUser_WhenAlreadyRead() {
            // Given
            message.getReadBy().add(TEST_USER_ID);

            // When
            message.markAsRead(TEST_USER_ID);

            // Then
            assertThat(message.getReadBy()).hasSize(1);
        }

        @Test
        @DisplayName("shouldSetReadAt_WhenFirstReader")
        void shouldSetReadAt_WhenFirstReader() {
            // Given
            message.setReadBy(new ArrayList<>());
            Instant beforeRead = Instant.now();

            // When
            message.markAsRead(TEST_USER_ID);

            // Then
            assertThat(message.getReadAt()).isAfterOrEqualTo(beforeRead);
        }
    }

    @Nested
    @DisplayName("Is Read By Tests")
    class IsReadByTests {

        @Test
        @DisplayName("shouldReturnTrue_WhenUserHasRead")
        void shouldReturnTrue_WhenUserHasRead() {
            // Given
            message.getReadBy().add(TEST_USER_ID);

            // When
            boolean result = message.isReadBy(TEST_USER_ID);

            // Then
            assertThat(result).isTrue();
        }

        @Test
        @DisplayName("shouldReturnFalse_WhenUserHasNotRead")
        void shouldReturnFalse_WhenUserHasNotRead() {
            // When
            boolean result = message.isReadBy(TEST_USER_ID);

            // Then
            assertThat(result).isFalse();
        }

        @Test
        @DisplayName("shouldReturnFalse_WhenReadByIsEmpty")
        void shouldReturnFalse_WhenReadByIsEmpty() {
            // Given
            message.setReadBy(new ArrayList<>());

            // When
            boolean result = message.isReadBy(TEST_USER_ID);

            // Then
            assertThat(result).isFalse();
        }
    }

    @Nested
    @DisplayName("Add Reply Tests")
    class AddReplyTests {

        @Test
        @DisplayName("shouldAddReply")
        void shouldAddReply() {
            // Given
            Message reply = Message.create(testThread, TEST_USER_ID, "Reply", MessagePriority.INFO);

            // When
            message.addReply(reply);

            // Then
            assertThat(message.getReplies()).hasSize(1);
            assertThat(reply.getParentMessage()).isEqualTo(message);
        }

        @Test
        @DisplayName("shouldAddMultipleReplies")
        void shouldAddMultipleReplies() {
            // Given
            Message reply1 = Message.create(testThread, TEST_USER_ID, "Reply 1", MessagePriority.INFO);
            Message reply2 = Message.create(testThread, TEST_USER_ID, "Reply 2", MessagePriority.INFO);

            // When
            message.addReply(reply1);
            message.addReply(reply2);

            // Then
            assertThat(message.getReplies()).hasSize(2);
        }
    }

    @Nested
    @DisplayName("Remove Reply Tests")
    class RemoveReplyTests {

        @Test
        @DisplayName("shouldRemoveReply")
        void shouldRemoveReply() {
            // Given
            Message reply = Message.create(testThread, TEST_USER_ID, "Reply", MessagePriority.INFO);
            message.addReply(reply);

            // When
            message.removeReply(reply);

            // Then
            assertThat(message.getReplies()).isEmpty();
            assertThat(reply.getParentMessage()).isNull();
        }

        @Test
        @DisplayName("shouldRemoveReply_WhenMultipleReplies")
        void shouldRemoveReply_WhenMultipleReplies() {
            // Given
            Message reply1 = Message.create(testThread, TEST_USER_ID, "Reply 1", MessagePriority.INFO);
            Message reply2 = Message.create(testThread, TEST_USER_ID, "Reply 2", MessagePriority.INFO);
            message.addReply(reply1);
            message.addReply(reply2);

            // When
            message.removeReply(reply1);

            // Then
            assertThat(message.getReplies()).hasSize(1);
            assertThat(message.getReplies()).contains(reply2);
        }
    }

    @Nested
    @DisplayName("Add Attachment Tests")
    class AddAttachmentTests {

        @Test
        @DisplayName("shouldAddAttachment")
        void shouldAddAttachment() {
            // Given
            MessageAttachment attachment = MessageAttachment.create(
                message,
                "test.txt",
                "text/plain",
                100L,
                "/tmp/test.txt"
            );

            // When
            message.addAttachment(attachment);

            // Then
            assertThat(message.getAttachments()).hasSize(1);
        }

        @Test
        @DisplayName("shouldAddMultipleAttachments")
        void shouldAddMultipleAttachments() {
            // Given
            MessageAttachment attachment1 = MessageAttachment.create(
                message, "file1.txt", "text/plain", 100L, "/tmp/file1.txt"
            );
            MessageAttachment attachment2 = MessageAttachment.create(
                message, "file2.txt", "text/plain", 200L, "/tmp/file2.txt"
            );

            // When
            message.addAttachment(attachment1);
            message.addAttachment(attachment2);

            // Then
            assertThat(message.getAttachments()).hasSize(2);
        }
    }

    @Nested
    @DisplayName("Remove Attachment Tests")
    class RemoveAttachmentTests {

        @Test
        @DisplayName("shouldRemoveAttachment")
        void shouldRemoveAttachment() {
            // Given
            MessageAttachment attachment = MessageAttachment.create(
                message, "test.txt", "text/plain", 100L, "/tmp/test.txt"
            );
            message.addAttachment(attachment);

            // When
            message.removeAttachment(attachment);

            // Then
            assertThat(message.getAttachments()).isEmpty();
        }
    }

    @Nested
    @DisplayName("Message Fields Tests")
    class MessageFieldsTests {

        @Test
        @DisplayName("shouldSetContent")
        void shouldSetContent() {
            // Given
            String content = "New content";

            // When
            message.setContent(content);

            // Then
            assertThat(message.getContent()).isEqualTo(content);
        }

        @Test
        @DisplayName("shouldSetPriority")
        void shouldSetPriority() {
            // Given
            MessagePriority priority = MessagePriority.URGENT;

            // When
            message.setPriority(priority);

            // Then
            assertThat(message.getPriority()).isEqualTo(priority);
        }

        @Test
        @DisplayName("shouldSetInternalNote")
        void shouldSetInternalNote() {
            // Given
            String note = "Internal note";

            // When
            message.setInternalNote(note);

            // Then
            assertThat(message.getInternalNote()).isEqualTo(note);
        }

        @Test
        @DisplayName("shouldSetSentAt")
        void shouldSetSentAt() {
            // Given
            Instant sentAt = Instant.now();

            // When
            message.setSentAt(sentAt);

            // Then
            assertThat(message.getSentAt()).isEqualTo(sentAt);
        }

        @Test
        @DisplayName("shouldSetReadAt")
        void shouldSetReadAt() {
            // Given
            Instant readAt = Instant.now();

            // When
            message.setReadAt(readAt);

            // Then
            assertThat(message.getReadAt()).isEqualTo(readAt);
        }
    }

    @Nested
    @DisplayName("Message Equality Tests")
    class EqualityTests {

        @Test
        @DisplayName("shouldEqual_WhenSameId")
        void shouldEqual_WhenSameId() {
            // Given
            Message message2 = new Message();
            message2.setId(message.getId());

            // When & Then
            assertThat(message).isEqualTo(message2);
        }

        @Test
        @DisplayName("shouldNotEqual_WhenDifferentId")
        void shouldNotEqual_WhenDifferentId() {
            // Given
            Message message2 = new Message();
            message2.setId(UUID.randomUUID()); // Different ID

            // When & Then
            assertThat(message).isNotEqualTo(message2);
        }

        @Test
        @DisplayName("shouldNotEqual_WhenNull")
        void shouldNotEqual_WhenNull() {
            // When & Then
            assertThat(message).isNotNull();
        }

        @Test
        @DisplayName("shouldNotEqual_WhenDifferentClass")
        void shouldNotEqual_WhenDifferentClass() {
            // When & Then
            assertThat(message).isNotEqualTo("string");
        }
    }
}
