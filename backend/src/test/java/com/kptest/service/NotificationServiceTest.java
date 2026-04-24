package com.kptest.service;

import com.kptest.api.dto.*;
import com.kptest.application.service.NotificationService;
import com.kptest.domain.notification.Notification;
import com.kptest.domain.notification.NotificationPreference;
import com.kptest.domain.notification.NotificationType;
import com.kptest.domain.notification.repository.NotificationPreferenceRepository;
import com.kptest.domain.notification.repository.NotificationRepository;
import com.kptest.domain.user.User;
import com.kptest.domain.user.UserRepository;
import com.kptest.domain.user.UserRole;
import com.kptest.exception.ResourceNotFoundException;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Nested;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;

import java.time.Instant;
import java.util.*;

import static org.assertj.core.api.Assertions.*;
import static org.mockito.ArgumentMatchers.*;
import static org.mockito.BDDMockito.*;

/**
 * Unit tests for NotificationService.
 */
@ExtendWith(MockitoExtension.class)
@DisplayName("NotificationService Unit Tests")
class NotificationServiceTest {

    @Mock
    private NotificationRepository notificationRepository;

    @Mock
    private NotificationPreferenceRepository preferenceRepository;

    @Mock
    private UserRepository userRepository;

    private NotificationService notificationService;

    private Notification testNotification;
    private NotificationPreference testPreference;
    private static final UUID TEST_NOTIFICATION_ID = UUID.randomUUID();
    private static final UUID TEST_USER_ID = UUID.randomUUID();

    @BeforeEach
    void setUp() {
        notificationService = new NotificationService(notificationRepository, preferenceRepository, userRepository);
        testNotification = createTestNotification();
        testPreference = createTestPreference();
    }

    private Notification createTestNotification() {
        Notification notification = Notification.create(
            TEST_USER_ID,
            NotificationType.MESSAGE,
            "Test Notification",
            "Test Content",
            "http://example.com"
        );
        notification.setId(TEST_NOTIFICATION_ID);
        notification.setCreatedAt(Instant.now());
        return notification;
    }

    private NotificationPreference createTestPreference() {
        NotificationPreference preference = NotificationPreference.createDefault(TEST_USER_ID);
        preference.setId(UUID.randomUUID());
        return preference;
    }

    @Nested
    @DisplayName("Get Notifications Tests")
    class GetNotificationsTests {

        @Test
        @DisplayName("shouldGetNotifications_WithNoFilters")
        void shouldGetNotifications_WithNoFilters() {
            // Given
            given(notificationRepository.findByUserId(eq(TEST_USER_ID), any(Pageable.class)))
                .willReturn(List.of(testNotification));

            // When
            List<NotificationDto> result = notificationService.getNotifications(TEST_USER_ID, null, null, 0, 20);

            // Then
            assertThat(result).hasSize(1);
        }

        @Test
        @DisplayName("shouldGetNotifications_WithTypeFilter")
        void shouldGetNotifications_WithTypeFilter() {
            // Given
            given(notificationRepository.findByUserIdAndType(eq(TEST_USER_ID), eq(NotificationType.MESSAGE), any(Pageable.class)))
                .willReturn(List.of(testNotification));

            // When
            List<NotificationDto> result = notificationService.getNotifications(TEST_USER_ID, NotificationType.MESSAGE, null, 0, 20);

            // Then
            assertThat(result).hasSize(1);
        }

        @Test
        @DisplayName("shouldGetNotifications_WithReadFilter")
        void shouldGetNotifications_WithReadFilter() {
            // Given
            given(notificationRepository.findUnreadByUserId(eq(TEST_USER_ID), any(Pageable.class)))
                .willReturn(List.of(testNotification));

            // When
            List<NotificationDto> result = notificationService.getNotifications(TEST_USER_ID, null, false, 0, 20);

            // Then
            assertThat(result).hasSize(1);
        }

        @Test
        @DisplayName("shouldGetNotifications_WithTypeAndReadFilter")
        void shouldGetNotifications_WithTypeAndReadFilter() {
            // Given
            given(notificationRepository.findUnreadByUserIdAndType(eq(TEST_USER_ID), eq(NotificationType.MESSAGE), any(Pageable.class)))
                .willReturn(List.of(testNotification));

            // When
            List<NotificationDto> result = notificationService.getNotifications(TEST_USER_ID, NotificationType.MESSAGE, false, 0, 20);

            // Then
            assertThat(result).hasSize(1);
        }

        @Test
        @DisplayName("shouldReturnEmptyList_WhenNoNotificationsFound")
        void shouldReturnEmptyList_WhenNoNotificationsFound() {
            // Given
            given(notificationRepository.findByUserId(eq(TEST_USER_ID), any(Pageable.class)))
                .willReturn(Collections.emptyList());

            // When
            List<NotificationDto> result = notificationService.getNotifications(TEST_USER_ID, null, null, 0, 20);

            // Then
            assertThat(result).isEmpty();
        }
    }

    @Nested
    @DisplayName("Get Unread Notifications Tests")
    class GetUnreadNotificationsTests {

        @Test
        @DisplayName("shouldGetUnreadNotifications_WhenNotificationsExist")
        void shouldGetUnreadNotifications_WhenNotificationsExist() {
            // Given
            given(notificationRepository.findUnreadByUserId(eq(TEST_USER_ID), any(Pageable.class)))
                .willReturn(List.of(testNotification));

            // When
            List<NotificationDto> result = notificationService.getUnreadNotifications(TEST_USER_ID);

            // Then
            assertThat(result).hasSize(1);
        }

        @Test
        @DisplayName("shouldReturnEmptyList_WhenNoUnreadNotifications")
        void shouldReturnEmptyList_WhenNoUnreadNotifications() {
            // Given
            given(notificationRepository.findUnreadByUserId(eq(TEST_USER_ID), any(Pageable.class)))
                .willReturn(Collections.emptyList());

            // When
            List<NotificationDto> result = notificationService.getUnreadNotifications(TEST_USER_ID);

            // Then
            assertThat(result).isEmpty();
        }
    }

    @Nested
    @DisplayName("Get Unread Count Tests")
    class GetUnreadCountTests {

        @Test
        @DisplayName("shouldGetUnreadCount_WhenNotificationsExist")
        void shouldGetUnreadCount_WhenNotificationsExist() {
            // Given
            given(notificationRepository.countUnreadByUserId(TEST_USER_ID)).willReturn(5L);

            // When
            long result = notificationService.getUnreadCount(TEST_USER_ID);

            // Then
            assertThat(result).isEqualTo(5);
        }

        @Test
        @DisplayName("shouldReturnZero_WhenNoUnreadNotifications")
        void shouldReturnZero_WhenNoUnreadNotifications() {
            // Given
            given(notificationRepository.countUnreadByUserId(TEST_USER_ID)).willReturn(0L);

            // When
            long result = notificationService.getUnreadCount(TEST_USER_ID);

            // Then
            assertThat(result).isZero();
        }
    }

    @Nested
    @DisplayName("Mark As Read Tests")
    class MarkAsReadTests {

        @Test
        @DisplayName("shouldMarkAsRead_WhenNotificationExists")
        void shouldMarkAsRead_WhenNotificationExists() {
            // Given
            given(notificationRepository.findById(TEST_NOTIFICATION_ID)).willReturn(Optional.of(testNotification));
            given(notificationRepository.save(any(Notification.class))).willReturn(testNotification);

            // When
            NotificationDto result = notificationService.markAsRead(TEST_NOTIFICATION_ID);

            // Then
            assertThat(result).isNotNull();
            assertThat(testNotification.getRead()).isTrue();
        }

        @Test
        @DisplayName("shouldThrowResourceNotFoundException_WhenNotificationNotFound")
        void shouldThrowResourceNotFoundException_WhenNotificationNotFound() {
            // Given
            given(notificationRepository.findById(TEST_NOTIFICATION_ID)).willReturn(Optional.empty());

            // When & Then
            assertThatThrownBy(() -> notificationService.markAsRead(TEST_NOTIFICATION_ID))
                .isInstanceOf(ResourceNotFoundException.class)
                .hasMessageContaining("Notification not found");
        }
    }

    @Nested
    @DisplayName("Mark All As Read Tests")
    class MarkAllAsReadTests {

        @Test
        @DisplayName("shouldMarkAllAsRead_WhenNotificationsExist")
        void shouldMarkAllAsRead_WhenNotificationsExist() {
            // Given
            willDoNothing().given(notificationRepository).markAllAsRead(TEST_USER_ID);

            // When
            notificationService.markAllAsRead(TEST_USER_ID);

            // Then
            then(notificationRepository).should().markAllAsRead(TEST_USER_ID);
        }
    }

    @Nested
    @DisplayName("Delete Notification Tests")
    class DeleteNotificationTests {

        @Test
        @DisplayName("shouldDeleteNotification_WhenNotificationExists")
        void shouldDeleteNotification_WhenNotificationExists() {
            // Given
            given(notificationRepository.existsById(TEST_NOTIFICATION_ID)).willReturn(true);
            willDoNothing().given(notificationRepository).deleteById(TEST_NOTIFICATION_ID);

            // When
            notificationService.deleteNotification(TEST_NOTIFICATION_ID);

            // Then
            then(notificationRepository).should().deleteById(TEST_NOTIFICATION_ID);
        }

        @Test
        @DisplayName("shouldThrowResourceNotFoundException_WhenNotificationNotFound")
        void shouldThrowResourceNotFoundException_WhenNotificationNotFoundForDelete() {
            // Given
            given(notificationRepository.existsById(TEST_NOTIFICATION_ID)).willReturn(false);

            // When & Then
            assertThatThrownBy(() -> notificationService.deleteNotification(TEST_NOTIFICATION_ID))
                .isInstanceOf(ResourceNotFoundException.class)
                .hasMessageContaining("Notification not found");
        }
    }

    @Nested
    @DisplayName("Get Preferences Tests")
    class GetPreferencesTests {

        @Test
        @DisplayName("shouldGetPreferences_WhenPreferencesExist")
        void shouldGetPreferences_WhenPreferencesExist() {
            // Given
            given(preferenceRepository.findByUserId(TEST_USER_ID)).willReturn(Optional.of(testPreference));

            // When
            NotificationPreferenceDto result = notificationService.getPreferences(TEST_USER_ID);

            // Then
            assertThat(result).isNotNull();
            assertThat(result.userId()).isEqualTo(TEST_USER_ID);
        }

        @Test
        @DisplayName("shouldCreateDefaultPreferences_WhenPreferencesNotFound")
        void shouldCreateDefaultPreferences_WhenPreferencesNotFound() {
            // Given
            given(preferenceRepository.findByUserId(TEST_USER_ID)).willReturn(Optional.empty());
            given(preferenceRepository.save(any(NotificationPreference.class))).willReturn(testPreference);

            // When
            NotificationPreferenceDto result = notificationService.getPreferences(TEST_USER_ID);

            // Then
            assertThat(result).isNotNull();
            then(preferenceRepository).should().save(any(NotificationPreference.class));
        }
    }

    @Nested
    @DisplayName("Update Preferences Tests")
    class UpdatePreferencesTests {

        @Test
        @DisplayName("shouldUpdatePreferences_WhenPreferencesExist")
        void shouldUpdatePreferences_WhenPreferencesExist() {
            // Given
            UpdateNotificationPreferencesRequest request = new UpdateNotificationPreferencesRequest(
                false, true, null, null, true, null, null, null, null);
            given(preferenceRepository.findByUserId(TEST_USER_ID)).willReturn(Optional.of(testPreference));
            given(preferenceRepository.save(any(NotificationPreference.class))).willReturn(testPreference);

            // When
            NotificationPreferenceDto result = notificationService.updatePreferences(TEST_USER_ID, request);

            // Then
            assertThat(result).isNotNull();
            assertThat(testPreference.getMessageNotifications()).isFalse();
            assertThat(testPreference.getEventNotifications()).isTrue();
        }

        @Test
        @DisplayName("shouldCreatePreferences_WhenPreferencesNotFound")
        void shouldCreatePreferences_WhenPreferencesNotFoundForUpdate() {
            // Given
            UpdateNotificationPreferencesRequest request = new UpdateNotificationPreferencesRequest(
                null, null, null, null, null, null, null, null, null);
            given(preferenceRepository.findByUserId(TEST_USER_ID)).willReturn(Optional.empty());
            given(preferenceRepository.save(any(NotificationPreference.class))).willReturn(testPreference);

            // When
            NotificationPreferenceDto result = notificationService.updatePreferences(TEST_USER_ID, request);

            // Then
            assertThat(result).isNotNull();
        }

        @Test
        @DisplayName("shouldUpdatePreferences_WithEmailEnabled")
        void shouldUpdatePreferences_WithEmailEnabled() {
            // Given
            UpdateNotificationPreferencesRequest request = new UpdateNotificationPreferencesRequest(
                null, null, null, null, true, null, null, null, null);
            given(preferenceRepository.findByUserId(TEST_USER_ID)).willReturn(Optional.of(testPreference));
            given(preferenceRepository.save(any(NotificationPreference.class))).willReturn(testPreference);

            // When
            NotificationPreferenceDto result = notificationService.updatePreferences(TEST_USER_ID, request);

            // Then
            assertThat(testPreference.getEmailEnabled()).isTrue();
        }

        @Test
        @DisplayName("shouldUpdatePreferences_WithSmsEnabled")
        void shouldUpdatePreferences_WithSmsEnabled() {
            // Given
            UpdateNotificationPreferencesRequest request = new UpdateNotificationPreferencesRequest(
                null, null, null, null, null, true, null, null, null);
            given(preferenceRepository.findByUserId(TEST_USER_ID)).willReturn(Optional.of(testPreference));
            given(preferenceRepository.save(any(NotificationPreference.class))).willReturn(testPreference);

            // When
            NotificationPreferenceDto result = notificationService.updatePreferences(TEST_USER_ID, request);

            // Then
            assertThat(testPreference.getSmsEnabled()).isTrue();
        }

        @Test
        @DisplayName("shouldUpdatePreferences_WithPushEnabled")
        void shouldUpdatePreferences_WithPushEnabled() {
            // Given
            UpdateNotificationPreferencesRequest request = new UpdateNotificationPreferencesRequest(
                null, null, null, null, null, null, false, null, null);
            given(preferenceRepository.findByUserId(TEST_USER_ID)).willReturn(Optional.of(testPreference));
            given(preferenceRepository.save(any(NotificationPreference.class))).willReturn(testPreference);

            // When
            NotificationPreferenceDto result = notificationService.updatePreferences(TEST_USER_ID, request);

            // Then
            assertThat(testPreference.getPushEnabled()).isFalse();
        }

        @Test
        @DisplayName("shouldUpdatePreferences_WithQuietHours")
        void shouldUpdatePreferences_WithQuietHours() {
            // Given
            UpdateNotificationPreferencesRequest request = new UpdateNotificationPreferencesRequest(
                null, null, null, null, null, null, null, "23:00", "08:00");
            given(preferenceRepository.findByUserId(TEST_USER_ID)).willReturn(Optional.of(testPreference));
            given(preferenceRepository.save(any(NotificationPreference.class))).willReturn(testPreference);

            // When
            NotificationPreferenceDto result = notificationService.updatePreferences(TEST_USER_ID, request);

            // Then
            assertThat(testPreference.getQuietHoursStart()).isEqualTo("23:00");
            assertThat(testPreference.getQuietHoursEnd()).isEqualTo("08:00");
        }
    }

    @Nested
    @DisplayName("Send Notification Tests")
    class SendNotificationTests {

        @Test
        @DisplayName("shouldSendNotification_WithValidRequest")
        void shouldSendNotification_WithValidRequest() {
            // Given
            SendNotificationRequest request = new SendNotificationRequest(
                TEST_USER_ID, NotificationType.MESSAGE, "Title", "Content", null, true, false, false, null);
            given(userRepository.findById(TEST_USER_ID)).willReturn(Optional.of(createTestUser()));
            given(preferenceRepository.findByUserId(TEST_USER_ID)).willReturn(Optional.of(testPreference));
            given(notificationRepository.save(any(Notification.class))).willReturn(testNotification);

            // When
            NotificationDto result = notificationService.sendNotification(request);

            // Then
            assertThat(result).isNotNull();
            then(notificationRepository).should().save(any(Notification.class));
        }

        @Test
        @DisplayName("shouldSendNotification_WithScheduledFor")
        void shouldSendNotification_WithScheduledFor() {
            // Given
            SendNotificationRequest request = new SendNotificationRequest(
                TEST_USER_ID, NotificationType.MESSAGE, "Title", "Content", null, null, null, null, Instant.now().plusSeconds(3600));
            given(userRepository.findById(TEST_USER_ID)).willReturn(Optional.of(createTestUser()));
            given(preferenceRepository.findByUserId(TEST_USER_ID)).willReturn(Optional.of(testPreference));
            given(notificationRepository.save(any(Notification.class))).willReturn(testNotification);

            // When
            NotificationDto result = notificationService.sendNotification(request);

            // Then
            assertThat(result).isNotNull();
        }

        @Test
        @DisplayName("shouldThrowResourceNotFoundException_WhenUserNotFound")
        void shouldThrowResourceNotFoundException_WhenUserNotFound() {
            // Given
            SendNotificationRequest request = new SendNotificationRequest(
                TEST_USER_ID, NotificationType.MESSAGE, "Title", "Content", null, null, null, null, null);
            given(userRepository.findById(TEST_USER_ID)).willReturn(Optional.empty());

            // When & Then
            assertThatThrownBy(() -> notificationService.sendNotification(request))
                .isInstanceOf(ResourceNotFoundException.class)
                .hasMessageContaining("User not found");
        }

        @Test
        @DisplayName("shouldThrowIllegalStateException_WhenNotificationsDisabled")
        void shouldThrowIllegalStateException_WhenNotificationsDisabled() {
            // Given
            testPreference.setMessageNotifications(false);
            SendNotificationRequest request = new SendNotificationRequest(
                TEST_USER_ID, NotificationType.MESSAGE, "Title", "Content", null, null, null, null, null);
            given(userRepository.findById(TEST_USER_ID)).willReturn(Optional.of(createTestUser()));
            given(preferenceRepository.findByUserId(TEST_USER_ID)).willReturn(Optional.of(testPreference));

            // When & Then
            assertThatThrownBy(() -> notificationService.sendNotification(request))
                .isInstanceOf(IllegalStateException.class)
                .hasMessageContaining("Notifications disabled");
        }
    }

    @Nested
    @DisplayName("Send Push Notification Tests")
    class SendPushNotificationTests {

        @Test
        @DisplayName("shouldSendPushNotification")
        void shouldSendPushNotification() {
            // When
            notificationService.sendPushNotification(TEST_USER_ID, "Title", "Body");

            // Then
            // No exception thrown - push notification logic is logged
        }
    }

    @Nested
    @DisplayName("Send Email Notification Tests")
    class SendEmailNotificationTests {

        @Test
        @DisplayName("shouldSendEmailNotification_WhenUserHasEmail")
        void shouldSendEmailNotification_WhenUserHasEmail() {
            // Given
            User user = createTestUser();
            user.setEmail("test@example.com");
            given(userRepository.findById(TEST_USER_ID)).willReturn(Optional.of(user));

            // When
            notificationService.sendEmailNotification(TEST_USER_ID, "Subject", "Body");

            // Then
            // No exception thrown - email notification logic is logged
        }

        @Test
        @DisplayName("shouldNotSendEmail_WhenUserHasNoEmail")
        void shouldNotSendEmail_WhenUserHasNoEmail() {
            // Given
            User user = createTestUser();
            user.setEmail(null);
            given(userRepository.findById(TEST_USER_ID)).willReturn(Optional.of(user));

            // When
            notificationService.sendEmailNotification(TEST_USER_ID, "Subject", "Body");

            // Then
            // No exception thrown - just logged
        }

        @Test
        @DisplayName("shouldThrowResourceNotFoundException_WhenUserNotFound")
        void shouldThrowResourceNotFoundException_WhenUserNotFoundForEmail() {
            // Given
            given(userRepository.findById(TEST_USER_ID)).willReturn(Optional.empty());

            // When & Then
            assertThatThrownBy(() -> notificationService.sendEmailNotification(TEST_USER_ID, "Subject", "Body"))
                .isInstanceOf(ResourceNotFoundException.class)
                .hasMessageContaining("User not found");
        }
    }

    @Nested
    @DisplayName("Send SMS Notification Tests")
    class SendSmsNotificationTests {

        @Test
        @DisplayName("shouldSendSmsNotification_WhenUserHasPhone")
        void shouldSendSmsNotification_WhenUserHasPhone() {
            // Given
            User user = createTestUser();
            user.setPhone("+48123456789");
            given(userRepository.findById(TEST_USER_ID)).willReturn(Optional.of(user));

            // When
            notificationService.sendSmsNotification(TEST_USER_ID, "Message");

            // Then
            // No exception thrown - SMS notification logic is logged
        }

        @Test
        @DisplayName("shouldNotSendSms_WhenUserHasNoPhone")
        void shouldNotSendSms_WhenUserHasNoPhone() {
            // Given
            User user = createTestUser();
            user.setPhone(null);
            given(userRepository.findById(TEST_USER_ID)).willReturn(Optional.of(user));

            // When
            notificationService.sendSmsNotification(TEST_USER_ID, "Message");

            // Then
            // No exception thrown - just logged
        }

        @Test
        @DisplayName("shouldThrowResourceNotFoundException_WhenUserNotFoundForSms")
        void shouldThrowResourceNotFoundException_WhenUserNotFoundForSms() {
            // Given
            given(userRepository.findById(TEST_USER_ID)).willReturn(Optional.empty());

            // When & Then
            assertThatThrownBy(() -> notificationService.sendSmsNotification(TEST_USER_ID, "Message"))
                .isInstanceOf(ResourceNotFoundException.class)
                .hasMessageContaining("User not found");
        }
    }

    @Nested
    @DisplayName("Notification Entity Tests")
    class NotificationEntityTests {

        @Test
        @DisplayName("shouldMarkAsRead")
        void shouldMarkAsRead() {
            // Given
            Notification notification = createTestNotification();

            // When
            notification.markAsRead();

            // Then
            assertThat(notification.getRead()).isTrue();
        }

        @Test
        @DisplayName("shouldMarkPushSent")
        void shouldMarkPushSent() {
            // Given
            Notification notification = createTestNotification();

            // When
            notification.markPushSent();

            // Then
            assertThat(notification.getSentPush()).isTrue();
        }

        @Test
        @DisplayName("shouldMarkEmailSent")
        void shouldMarkEmailSent() {
            // Given
            Notification notification = createTestNotification();

            // When
            notification.markEmailSent();

            // Then
            assertThat(notification.getSentEmail()).isTrue();
        }

        @Test
        @DisplayName("shouldMarkSmsSent")
        void shouldMarkSmsSent() {
            // Given
            Notification notification = createTestNotification();

            // When
            notification.markSmsSent();

            // Then
            assertThat(notification.getSentSms()).isTrue();
        }

        @Test
        @DisplayName("shouldMarkSent")
        void shouldMarkSent() {
            // Given
            Notification notification = createTestNotification();

            // When
            notification.markSent();

            // Then
            assertThat(notification.getSentAt()).isNotNull();
        }

        @Test
        @DisplayName("shouldCheckIsDueForSending_WhenScheduledForIsNull")
        void shouldCheckIsDueForSending_WhenScheduledForIsNull() {
            // Given
            Notification notification = createTestNotification();

            // When
            boolean result = notification.isDueForSending();

            // Then
            assertThat(result).isTrue();
        }

        @Test
        @DisplayName("shouldCheckIsDueForSending_WhenScheduledForIsPast")
        void shouldCheckIsDueForSending_WhenScheduledForIsPast() {
            // Given
            Notification notification = createTestNotification();
            notification.setScheduledFor(Instant.now().minusSeconds(3600));

            // When
            boolean result = notification.isDueForSending();

            // Then
            assertThat(result).isTrue();
        }
    }

    @Nested
    @DisplayName("NotificationPreference Entity Tests")
    class NotificationPreferenceEntityTests {

        @Test
        @DisplayName("shouldCreateDefault")
        void shouldCreateDefault() {
            // When
            NotificationPreference preference = NotificationPreference.createDefault(TEST_USER_ID);

            // Then
            assertThat(preference.getUserId()).isEqualTo(TEST_USER_ID);
            assertThat(preference.getMessageNotifications()).isTrue();
            assertThat(preference.getEventNotifications()).isTrue();
            assertThat(preference.getMaterialNotifications()).isTrue();
            assertThat(preference.getReminderNotifications()).isTrue();
            assertThat(preference.getPushEnabled()).isTrue();
            assertThat(preference.getEmailEnabled()).isFalse();
            assertThat(preference.getSmsEnabled()).isFalse();
        }

        @Test
        @DisplayName("shouldCheckIsEnabledForType_Message")
        void shouldCheckIsEnabledForType_Message() {
            // Given
            NotificationPreference preference = createTestPreference();
            preference.setMessageNotifications(true);

            // When
            boolean result = preference.isEnabledForType(NotificationType.MESSAGE);

            // Then
            assertThat(result).isTrue();
        }

        @Test
        @DisplayName("shouldCheckIsEnabledForType_Event")
        void shouldCheckIsEnabledForType_Event() {
            // Given
            NotificationPreference preference = createTestPreference();
            preference.setEventNotifications(true);

            // When
            boolean result = preference.isEnabledForType(NotificationType.EVENT);

            // Then
            assertThat(result).isTrue();
        }

        @Test
        @DisplayName("shouldCheckIsEnabledForType_Material")
        void shouldCheckIsEnabledForType_Material() {
            // Given
            NotificationPreference preference = createTestPreference();
            preference.setMaterialNotifications(false);

            // When
            boolean result = preference.isEnabledForType(NotificationType.MATERIAL);

            // Then
            assertThat(result).isFalse();
        }

        @Test
        @DisplayName("shouldCheckIsEnabledForType_Reminder")
        void shouldCheckIsEnabledForType_Reminder() {
            // Given
            NotificationPreference preference = createTestPreference();
            preference.setReminderNotifications(true);

            // When
            boolean result = preference.isEnabledForType(NotificationType.REMINDER);

            // Then
            assertThat(result).isTrue();
        }

        @Test
        @DisplayName("shouldCheckIsEnabledForType_ScheduleChange")
        void shouldCheckIsEnabledForType_ScheduleChange() {
            // Given
            NotificationPreference preference = createTestPreference();
            preference.setEventNotifications(true);

            // When
            boolean result = preference.isEnabledForType(NotificationType.SCHEDULE_CHANGE);

            // Then
            assertThat(result).isTrue();
        }

        @Test
        @DisplayName("shouldCheckIsQuietHours_WhenQuietHoursAreNull")
        void shouldCheckIsQuietHours_WhenQuietHoursAreNull() {
            // Given
            NotificationPreference preference = createTestPreference();
            preference.setQuietHoursStart(null);
            preference.setQuietHoursEnd(null);

            // When
            boolean result = preference.isQuietHours();

            // Then
            assertThat(result).isFalse();
        }
    }

    private User createTestUser() {
        User user = User.create("test@example.com", "passwordHash", UserRole.PATIENT);
        user.setId(TEST_USER_ID);
        return user;
    }
}
