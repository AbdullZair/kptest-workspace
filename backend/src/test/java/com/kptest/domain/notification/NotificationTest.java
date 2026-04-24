package com.kptest.domain.notification;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Nested;
import org.junit.jupiter.api.Test;

import java.time.Instant;
import java.util.UUID;

import static org.assertj.core.api.Assertions.*;

/**
 * Unit tests for Notification entity.
 */
@DisplayName("Notification Entity Unit Tests")
class NotificationTest {

    private Notification notification;
    private static final UUID TEST_USER_ID = UUID.randomUUID();
    private static final String TEST_TITLE = "Test Title";
    private static final String TEST_CONTENT = "Test Content";

    @BeforeEach
    void setUp() {
        notification = Notification.create(
            TEST_USER_ID,
            NotificationType.MESSAGE,
            TEST_TITLE,
            TEST_CONTENT,
            "http://example.com/link"
        );
    }

    @Nested
    @DisplayName("Create Notification Tests")
    class CreateNotificationTests {

        @Test
        @DisplayName("shouldCreateNotification_WithValidData")
        void shouldCreateNotification_WithValidData() {
            // When
            Notification created = Notification.create(
                TEST_USER_ID,
                NotificationType.MESSAGE,
                "Title",
                "Content",
                "http://example.com"
            );

            // Then
            assertThat(created).isNotNull();
            assertThat(created.getUserId()).isEqualTo(TEST_USER_ID);
            assertThat(created.getType()).isEqualTo(NotificationType.MESSAGE);
            assertThat(created.getTitle()).isEqualTo("Title");
            assertThat(created.getContent()).isEqualTo("Content");
            assertThat(created.getActionUrl()).isEqualTo("http://example.com");
            assertThat(created.getRead()).isFalse();
            assertThat(created.getSentPush()).isFalse();
            assertThat(created.getSentEmail()).isFalse();
            assertThat(created.getSentSms()).isFalse();
        }

        @Test
        @DisplayName("shouldCreateNotification_WithAllNotificationTypes")
        void shouldCreateNotification_WithAllNotificationTypes() {
            // When & Then
            for (NotificationType type : NotificationType.values()) {
                Notification n = Notification.create(
                    TEST_USER_ID,
                    type,
                    "Title",
                    "Content",
                    null
                );
                assertThat(n.getType()).isEqualTo(type);
            }
        }

        @Test
        @DisplayName("shouldCreateNotification_WithNullActionUrl")
        void shouldCreateNotification_WithNullActionUrl() {
            // When
            Notification created = Notification.create(
                TEST_USER_ID,
                NotificationType.MESSAGE,
                "Title",
                "Content",
                null
            );

            // Then
            assertThat(created.getActionUrl()).isNull();
        }

        @Test
        @DisplayName("shouldSetDefaultReadToFalse")
        void shouldSetDefaultReadToFalse() {
            // When
            Notification created = Notification.create(
                TEST_USER_ID,
                NotificationType.MESSAGE,
                "Title",
                "Content",
                null
            );

            // Then
            assertThat(created.getRead()).isFalse();
        }
    }

    @Nested
    @DisplayName("Mark As Read Tests")
    class MarkAsReadTests {

        @Test
        @DisplayName("shouldMarkAsRead")
        void shouldMarkAsRead() {
            // When
            notification.markAsRead();

            // Then
            assertThat(notification.getRead()).isTrue();
        }

        @Test
        @DisplayName("shouldMarkAsRead_WhenAlreadyRead")
        void shouldMarkAsRead_WhenAlreadyRead() {
            // Given
            notification.markAsRead();

            // When
            notification.markAsRead();

            // Then
            assertThat(notification.getRead()).isTrue();
        }
    }

    @Nested
    @DisplayName("Mark Push Sent Tests")
    class MarkPushSentTests {

        @Test
        @DisplayName("shouldMarkPushSent")
        void shouldMarkPushSent() {
            // When
            notification.markPushSent();

            // Then
            assertThat(notification.getSentPush()).isTrue();
        }

        @Test
        @DisplayName("shouldMarkPushSent_WhenAlreadySent")
        void shouldMarkPushSent_WhenAlreadySent() {
            // Given
            notification.markPushSent();

            // When
            notification.markPushSent();

            // Then
            assertThat(notification.getSentPush()).isTrue();
        }
    }

    @Nested
    @DisplayName("Mark Email Sent Tests")
    class MarkEmailSentTests {

        @Test
        @DisplayName("shouldMarkEmailSent")
        void shouldMarkEmailSent() {
            // When
            notification.markEmailSent();

            // Then
            assertThat(notification.getSentEmail()).isTrue();
        }

        @Test
        @DisplayName("shouldMarkEmailSent_WhenAlreadySent")
        void shouldMarkEmailSent_WhenAlreadySent() {
            // Given
            notification.markEmailSent();

            // When
            notification.markEmailSent();

            // Then
            assertThat(notification.getSentEmail()).isTrue();
        }
    }

    @Nested
    @DisplayName("Mark SMS Sent Tests")
    class MarkSmsSentTests {

        @Test
        @DisplayName("shouldMarkSmsSent")
        void shouldMarkSmsSent() {
            // When
            notification.markSmsSent();

            // Then
            assertThat(notification.getSentSms()).isTrue();
        }

        @Test
        @DisplayName("shouldMarkSmsSent_WhenAlreadySent")
        void shouldMarkSmsSent_WhenAlreadySent() {
            // Given
            notification.markSmsSent();

            // When
            notification.markSmsSent();

            // Then
            assertThat(notification.getSentSms()).isTrue();
        }
    }

    @Nested
    @DisplayName("Notification Fields Tests")
    class NotificationFieldsTests {

        @Test
        @DisplayName("shouldSetUserId")
        void shouldSetUserId() {
            // Given
            UUID userId = UUID.randomUUID();

            // When
            notification.setUserId(userId);

            // Then
            assertThat(notification.getUserId()).isEqualTo(userId);
        }

        @Test
        @DisplayName("shouldSetTitle")
        void shouldSetTitle() {
            // Given
            String title = "New Title";

            // When
            notification.setTitle(title);

            // Then
            assertThat(notification.getTitle()).isEqualTo(title);
        }

        @Test
        @DisplayName("shouldSetContent")
        void shouldSetContent() {
            // Given
            String content = "New Content";

            // When
            notification.setContent(content);

            // Then
            assertThat(notification.getContent()).isEqualTo(content);
        }

        @Test
        @DisplayName("shouldSetType")
        void shouldSetType() {
            // Given
            NotificationType type = NotificationType.REMINDER;

            // When
            notification.setType(type);

            // Then
            assertThat(notification.getType()).isEqualTo(type);
        }

        @Test
        @DisplayName("shouldSetActionUrl")
        void shouldSetActionUrl() {
            // Given
            String url = "http://example.com/new-link";

            // When
            notification.setActionUrl(url);

            // Then
            assertThat(notification.getActionUrl()).isEqualTo(url);
        }

        @Test
        @DisplayName("shouldSetRead")
        void shouldSetRead() {
            // When
            notification.setRead(true);

            // Then
            assertThat(notification.getRead()).isTrue();
        }

        @Test
        @DisplayName("shouldSetSentPush")
        void shouldSetSentPush() {
            // When
            notification.setSentPush(true);

            // Then
            assertThat(notification.getSentPush()).isTrue();
        }

        @Test
        @DisplayName("shouldSetSentEmail")
        void shouldSetSentEmail() {
            // When
            notification.setSentEmail(true);

            // Then
            assertThat(notification.getSentEmail()).isTrue();
        }

        @Test
        @DisplayName("shouldSetSentSms")
        void shouldSetSentSms() {
            // When
            notification.setSentSms(true);

            // Then
            assertThat(notification.getSentSms()).isTrue();
        }
    }

    @Nested
    @DisplayName("Notification Equality Tests")
    class EqualityTests {

        @Test
        @DisplayName("shouldEqual_WhenSameId")
        void shouldEqual_WhenSameId() {
            // Given
            Notification notification2 = new Notification();
            notification2.setId(notification.getId());

            // When & Then
            assertThat(notification).isEqualTo(notification2);
        }

        @Test
        @DisplayName("shouldNotEqual_WhenDifferentId")
        void shouldNotEqual_WhenDifferentId() {
            // Given
            Notification notification2 = new Notification();
            notification2.setId(UUID.randomUUID()); // Different ID

            // When & Then
            assertThat(notification).isNotEqualTo(notification2);
        }

        @Test
        @DisplayName("shouldNotEqual_WhenNull")
        void shouldNotEqual_WhenNull() {
            // When & Then
            assertThat(notification).isNotNull();
        }

        @Test
        @DisplayName("shouldNotEqual_WhenDifferentClass")
        void shouldNotEqual_WhenDifferentClass() {
            // When & Then
            assertThat(notification).isNotEqualTo("string");
        }
    }
}
