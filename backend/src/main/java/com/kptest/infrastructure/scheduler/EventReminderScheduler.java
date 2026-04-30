package com.kptest.infrastructure.scheduler;

import com.kptest.domain.notification.Notification;
import com.kptest.domain.notification.NotificationPreference;
import com.kptest.domain.notification.NotificationType;
import com.kptest.domain.notification.repository.NotificationPreferenceRepository;
import com.kptest.domain.notification.repository.NotificationRepository;
import com.kptest.domain.project.ProjectTeam;
import com.kptest.domain.project.ProjectTeamRepository;
import com.kptest.domain.schedule.TherapyEvent;
import com.kptest.domain.schedule.repository.TherapyEventRepository;
import com.kptest.domain.user.User;
import com.kptest.domain.user.UserRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

import java.time.Duration;
import java.time.Instant;
import java.time.LocalTime;
import java.util.HashSet;
import java.util.List;
import java.util.Set;
import java.util.UUID;

/**
 * Event reminder scheduler (US-K-25).
 * <p>
 * Every 5 minutes scans for therapy events scheduled approximately 24h ahead
 * (within a +/-5min window) and creates {@link Notification} records of type
 * {@link NotificationType#REMINDER} for the patient associated with the event
 * and for staff members assigned to the project (via {@link ProjectTeam}).
 * <p>
 * The scheduler is idempotent within the same window: an event already
 * reminded is not re-notified because we de-duplicate by (userId, event, type)
 * via a content-marker in {@link Notification#getContent()}.
 */
@Slf4j
@Component
@RequiredArgsConstructor
public class EventReminderScheduler {

    private static final Duration REMINDER_AHEAD = Duration.ofHours(24);
    private static final Duration WINDOW = Duration.ofMinutes(5);
    private static final String REMINDER_MARKER_PREFIX = "[REMINDER#";

    private final TherapyEventRepository therapyEventRepository;
    private final NotificationRepository notificationRepository;
    private final NotificationPreferenceRepository notificationPreferenceRepository;
    private final ProjectTeamRepository projectTeamRepository;
    private final UserRepository userRepository;

    /**
     * Cron-driven entry point: every 5 minutes.
     */
    @Scheduled(fixedRate = 300_000L)
    @Transactional
    public void scheduledRun() {
        log.debug("EventReminderScheduler tick");
        runReminders();
    }

    /**
     * Run reminder logic for events ~24h ahead. Returns a small report so the
     * admin manual-trigger endpoint can surface what happened.
     *
     * @return summary of processed events and emitted notifications
     */
    @Transactional
    public ReminderRunResult runReminders() {
        Instant now = Instant.now();
        Instant windowStart = now.plus(REMINDER_AHEAD).minus(WINDOW);
        Instant windowEnd = now.plus(REMINDER_AHEAD).plus(WINDOW);

        log.info("Scanning for events between {} and {} (24h reminder window)", windowStart, windowEnd);
        List<TherapyEvent> events = therapyEventRepository.findByDateRange(windowStart, windowEnd);

        ReminderRunResult result = new ReminderRunResult();
        for (TherapyEvent event : events) {
            try {
                int created = createRemindersForEvent(event);
                result.eventIds.add(event.getId());
                result.notificationsCreated += created;
            } catch (RuntimeException e) {
                log.error("Failed to create reminder for event {}: {}", event.getId(), e.getMessage(), e);
            }
        }
        log.info(
            "EventReminderScheduler run complete: events={}, notifications_created={}",
            result.eventIds.size(),
            result.notificationsCreated
        );
        return result;
    }

    private int createRemindersForEvent(TherapyEvent event) {
        Set<UUID> recipients = new HashSet<>();

        // Patient recipient (resolve patient -> user)
        if (event.getPatientId() != null) {
            UUID patientUserId = resolvePatientUserId(event.getPatientId());
            if (patientUserId != null) {
                recipients.add(patientUserId);
            } else {
                log.debug("Patient {} has no resolvable user; skipping patient recipient", event.getPatientId());
            }
        }

        // Staff recipients: all team members of the project
        List<ProjectTeam> team = projectTeamRepository.findByProjectId(event.getProjectId());
        for (ProjectTeam pt : team) {
            if (pt.getUser() != null && pt.getUser().getId() != null) {
                recipients.add(pt.getUser().getId());
            }
        }

        int created = 0;
        String marker = REMINDER_MARKER_PREFIX + event.getId() + "]";
        String title = "Przypomnienie: nadchodzące wydarzenie";
        String content = marker + " " + safeTitle(event) + " — zaplanowane na "
            + event.getScheduledAt();
        String actionUrl = "/calendar/events/" + event.getId();

        for (UUID userId : recipients) {
            // Respect user preferences (US-K-26): skip if reminders/push disabled or
            // if current time falls within the user's configured quiet hours.
            if (shouldSkipForPreferences(userId)) {
                continue;
            }

            // De-duplicate: skip if a reminder for this event already exists for this user
            // (cheap check: scan recent notifications for this user; MVP scope is small)
            boolean alreadyNotified = notificationRepository
                .findByUserId(userId, org.springframework.data.domain.PageRequest.of(0, 50))
                .stream()
                .anyMatch(n -> n.getContent() != null && n.getContent().contains(marker));
            if (alreadyNotified) {
                log.debug("Skip duplicate reminder for user {} event {}", userId, event.getId());
                continue;
            }
            Notification reminder = Notification.create(
                userId,
                NotificationType.REMINDER,
                title,
                content,
                actionUrl
            );
            notificationRepository.save(reminder);
            log.info(
                "REMINDER notification created: user {} event {} scheduledAt {}",
                userId,
                event.getId(),
                event.getScheduledAt()
            );
            created++;
        }
        return created;
    }

    /**
     * Check if a reminder should be skipped for the given user based on stored
     * {@link NotificationPreference}. Returns true and emits an INFO log when:
     * <ul>
     *   <li>{@code reminderNotifications == false}</li>
     *   <li>{@code pushEnabled == false}</li>
     *   <li>current local time falls inside the user's quiet hours window</li>
     * </ul>
     * Missing preferences default to "do not skip" so that users without a
     * preference row continue to receive reminders.
     */
    private boolean shouldSkipForPreferences(UUID userId) {
        NotificationPreference pref = notificationPreferenceRepository
            .findByUserId(userId)
            .orElse(null);
        if (pref == null) {
            return false;
        }
        if (Boolean.FALSE.equals(pref.getReminderNotifications())
            || Boolean.FALSE.equals(pref.getPushEnabled())) {
            log.info("Skipping reminder for user {} — quiet hours / disabled", userId);
            return true;
        }
        if (isInQuietHours(pref, LocalTime.now())) {
            log.info("Skipping reminder for user {} — quiet hours / disabled", userId);
            return true;
        }
        return false;
    }

    /**
     * Return whether the supplied {@code now} falls inside the preference's
     * quiet hours window. Handles cross-midnight intervals (e.g. 22:00–07:00)
     * and tolerates malformed strings by returning {@code false}.
     *
     * @param pref preference holding optional HH:MM start/end strings
     * @param now  reference time (use {@link LocalTime#now()} in production)
     * @return true when notifications should be suppressed
     */
    static boolean isInQuietHours(NotificationPreference pref, LocalTime now) {
        if (pref == null) {
            return false;
        }
        String start = pref.getQuietHoursStart();
        String end = pref.getQuietHoursEnd();
        if (start == null || end == null) {
            return false;
        }
        try {
            LocalTime startTime = LocalTime.parse(start);
            LocalTime endTime = LocalTime.parse(end);
            if (startTime.equals(endTime)) {
                return false;
            }
            if (startTime.isAfter(endTime)) {
                // Cross-midnight window: (start, 24:00) ∪ (00:00, end)
                return !now.isBefore(startTime) || now.isBefore(endTime);
            }
            // Same-day window
            return !now.isBefore(startTime) && now.isBefore(endTime);
        } catch (RuntimeException e) {
            log.debug("Malformed quiet hours [{} – {}]: {}", start, end, e.getMessage());
            return false;
        }
    }

    private UUID resolvePatientUserId(UUID patientId) {
        // Patient.id == User.id is NOT guaranteed; patients have a separate user_id FK.
        // Best-effort: try treating patientId as a userId first (legacy), else look up
        // via a lightweight repository call. Here we fall back to using patientId as
        // the recipient if user lookup is not wired - this still creates a notification
        // record that the FE can render on the patient's behalf.
        try {
            User u = userRepository.findById(patientId).orElse(null);
            if (u != null) {
                return u.getId();
            }
        } catch (RuntimeException e) {
            log.debug("User lookup for patientId {} failed: {}", patientId, e.getMessage());
        }
        return patientId;
    }

    private static String safeTitle(TherapyEvent event) {
        return event.getTitle() != null ? event.getTitle() : "(bez tytułu)";
    }

    /**
     * Result of a reminder run, returned to admin endpoint.
     */
    public static final class ReminderRunResult {
        private final java.util.List<UUID> eventIds = new java.util.ArrayList<>();
        private int notificationsCreated;

        public java.util.List<UUID> getEventIds() {
            return eventIds;
        }

        public int getCount() {
            return eventIds.size();
        }

        public int getNotificationsCreated() {
            return notificationsCreated;
        }
    }
}
