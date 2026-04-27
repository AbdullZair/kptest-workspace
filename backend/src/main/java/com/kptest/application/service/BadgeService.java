package com.kptest.application.service;
import com.kptest.domain.gamification.BadgeCategory;

import com.kptest.api.dto.BadgeDto;
import com.kptest.api.dto.PatientBadgeDto;
import com.kptest.domain.gamification.*;
import com.kptest.domain.gamification.repository.BadgeRepository;
import com.kptest.domain.gamification.repository.PatientBadgeRepository;
import com.kptest.domain.patient.Patient;
import com.kptest.domain.patient.PatientRepository;
import com.kptest.exception.ResourceNotFoundException;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Instant;
import java.util.List;
import java.util.UUID;

/**
 * Service for managing badges and automatic badge awarding.
 */
@Slf4j
@Service
@RequiredArgsConstructor
@Transactional
public class BadgeService {

    private final BadgeRepository badgeRepository;
    private final PatientBadgeRepository patientBadgeRepository;
    private final PatientRepository patientRepository;

    // ==================== Badge CRUD ====================

    /**
     * Get all active badges.
     */
    @Transactional(readOnly = true)
    public List<BadgeDto> getAllBadges() {
        log.debug("Finding all active badges");

        List<Badge> badges = badgeRepository.findByActiveOrderByCreatedAtDesc(true);

        return badges.stream()
            .map(BadgeDto::fromBadge)
            .toList();
    }

    /**
     * Get all visible badges for patients.
     */
    @Transactional(readOnly = true)
    public List<BadgeDto> getVisibleBadges() {
        log.debug("Finding visible badges for patients");

        List<Badge> badges = badgeRepository.findByActiveAndHiddenOrderByCategory(true, false);

        return badges.stream()
            .map(BadgeDto::fromBadgeWithoutRules)
            .toList();
    }

    /**
     * Get badge by ID.
     */
    @Transactional(readOnly = true)
    public BadgeDto getBadgeById(UUID id) {
        log.debug("Finding badge by ID: {}", id);

        Badge badge = badgeRepository.findById(id)
            .orElseThrow(() -> new ResourceNotFoundException("Badge not found with id: " + id));

        return BadgeDto.fromBadge(badge);
    }

    /**
     * Create a new badge.
     */
    public BadgeDto createBadge(BadgeDto badgeDto) {
        log.info("Creating badge: {}", badgeDto.name());

        Badge badge = Badge.create(
            badgeDto.name(),
            badgeDto.description(),
            badgeDto.category(),
            badgeDto.iconUrl(),
            badgeDto.color(),
            badgeDto.createdBy()
        );

        if (badgeDto.hidden() != null) {
            if (badgeDto.hidden()) {
                badge.hide();
            } else {
                badge.show();
            }
        }

        Badge savedBadge = badgeRepository.save(badge);
        log.info("Created badge with ID: {}", savedBadge.getId());

        return BadgeDto.fromBadge(savedBadge);
    }

    /**
     * Update an existing badge.
     */
    public BadgeDto updateBadge(UUID id, BadgeDto badgeDto) {
        log.info("Updating badge with ID: {}", id);

        Badge badge = badgeRepository.findById(id)
            .orElseThrow(() -> new ResourceNotFoundException("Badge not found with id: " + id));

        if (badgeDto.name() != null) {
            badge.setName(badgeDto.name());
        }
        if (badgeDto.description() != null) {
            badge.setDescription(badgeDto.description());
        }
        if (badgeDto.iconUrl() != null) {
            badge.setIconUrl(badgeDto.iconUrl());
        }
        if (badgeDto.color() != null) {
            badge.setColor(badgeDto.color());
        }
        if (badgeDto.category() != null) {
            badge.setCategory(badgeDto.category());
        }
        if (badgeDto.active() != null) {
            if (badgeDto.active()) {
                badge.activate();
            } else {
                badge.deactivate();
            }
        }
        if (badgeDto.hidden() != null) {
            if (badgeDto.hidden()) {
                badge.hide();
            } else {
                badge.show();
            }
        }

        Badge updatedBadge = badgeRepository.save(badge);
        log.info("Updated badge with ID: {}", updatedBadge.getId());

        return BadgeDto.fromBadge(updatedBadge);
    }

    /**
     * Delete a badge.
     */
    public void deleteBadge(UUID id) {
        log.info("Deleting badge with ID: {}", id);

        Badge badge = badgeRepository.findById(id)
            .orElseThrow(() -> new ResourceNotFoundException("Badge not found with id: " + id));

        badgeRepository.delete(badge);
        log.info("Deleted badge with ID: {}", id);
    }

    // ==================== Patient Badges ====================

    /**
     * Get all badges earned by a patient.
     */
    @Transactional(readOnly = true)
    public List<PatientBadgeDto> getPatientBadges(UUID patientId) {
        log.debug("Finding badges for patient: {}", patientId);

        List<PatientBadge> patientBadges = patientBadgeRepository.findByPatientIdOrderByEarnedAtDesc(patientId);

        return patientBadges.stream()
            .map(PatientBadgeDto::fromPatientBadge)
            .toList();
    }

    /**
     * Get unnotified badges for a patient.
     */
    @Transactional(readOnly = true)
    public List<PatientBadgeDto> getUnnotifiedBadges(UUID patientId) {
        log.debug("Finding unnotified badges for patient: {}", patientId);

        List<PatientBadge> patientBadges = patientBadgeRepository.findByPatientIdAndNotified(patientId, false);

        return patientBadges.stream()
            .map(PatientBadgeDto::fromPatientBadge)
            .toList();
    }

    /**
     * Mark a badge as notified.
     */
    public void markBadgeAsNotified(UUID patientBadgeId) {
        log.info("Marking badge as notified: {}", patientBadgeId);

        PatientBadge patientBadge = patientBadgeRepository.findById(patientBadgeId)
            .orElseThrow(() -> new ResourceNotFoundException("Patient badge not found with id: " + patientBadgeId));

        patientBadge.markNotified();
        patientBadgeRepository.save(patientBadge);
    }

    // ==================== Automatic Badge Awarding ====================

    /**
     * Check and award badges for events completed.
     */
    public void checkEventsCompleted(UUID patientId, String eventType) {
        log.debug("Checking events completed badges for patient: {}, event: {}", patientId, eventType);

        List<Badge> badges = badgeRepository.findAll();

        for (Badge badge : badges) {
            for (BadgeRule rule : badge.getRules()) {
                if (rule.getRuleType() == BadgeRule.RuleType.EVENTS_COMPLETED &&
                    !patientBadgeRepository.existsByPatientIdAndBadgeId(patientId, badge.getId())) {

                    // Check event type filter
                    if (rule.getEventType() != null && !rule.getEventType().equals(eventType)) {
                        continue;
                    }

                    // Count events (in real app, query event repository)
                    long eventCount = countEventsForPatient(patientId, rule.getEventType(), rule.getPeriodDays());

                    if (eventCount >= rule.getThreshold()) {
                        awardBadge(patientId, badge);
                    }
                }
            }
        }
    }

    /**
     * Check and award badges for compliance threshold.
     */
    public void checkComplianceThreshold(UUID patientId, double complianceScore) {
        log.debug("Checking compliance badges for patient: {}, score: {}", patientId, complianceScore);

        List<Badge> badges = badgeRepository.findAll();

        for (Badge badge : badges) {
            for (BadgeRule rule : badge.getRules()) {
                if (rule.getRuleType() == BadgeRule.RuleType.COMPLIANCE_THRESHOLD &&
                    !patientBadgeRepository.existsByPatientIdAndBadgeId(patientId, badge.getId())) {

                    int threshold = rule.getThreshold();
                    if (complianceScore >= threshold) {
                        awardBadge(patientId, badge);
                    }
                }
            }
        }
    }

    /**
     * Check and award badges for materials read.
     */
    public void checkMaterialsRead(UUID patientId, String category) {
        log.debug("Checking materials read badges for patient: {}, category: {}", patientId, category);

        List<Badge> badges = badgeRepository.findAll();

        for (Badge badge : badges) {
            for (BadgeRule rule : badge.getRules()) {
                if (rule.getRuleType() == BadgeRule.RuleType.MATERIALS_READ &&
                    !patientBadgeRepository.existsByPatientIdAndBadgeId(patientId, badge.getId())) {

                    // Check category filter
                    if (rule.hasCategoryFilter() && !rule.getCategoryFilter().equals(category)) {
                        continue;
                    }

                    // Count materials (in real app, query material progress repository)
                    long materialCount = countMaterialsRead(patientId, rule.getCategoryFilter());

                    if (materialCount >= rule.getThreshold()) {
                        awardBadge(patientId, badge);
                    }
                }
            }
        }
    }

    /**
     * Check and award badges for quiz passed.
     */
    public void checkQuizPassed(UUID patientId, UUID quizId) {
        log.debug("Checking quiz passed badges for patient: {}, quiz: {}", patientId, quizId);

        List<Badge> badges = badgeRepository.findAll();

        for (Badge badge : badges) {
            for (BadgeRule rule : badge.getRules()) {
                if (rule.getRuleType() == BadgeRule.RuleType.QUIZ_PASSED &&
                    !patientBadgeRepository.existsByPatientIdAndBadgeId(patientId, badge.getId())) {

                    // Check if rule is for specific quiz or any quiz
                    if (rule.isQuizSpecific() && !rule.getQuizId().equals(quizId)) {
                        continue;
                    }

                    awardBadge(patientId, badge);
                }
            }
        }
    }

    /**
     * Award a badge to a patient.
     */
    private void awardBadge(UUID patientId, Badge badge) {
        log.info("Awarding badge '{}' to patient {}", badge.getName(), patientId);

        Patient patient = patientRepository.findById(patientId)
            .orElseThrow(() -> new ResourceNotFoundException("Patient not found with id: " + patientId));

        PatientBadge patientBadge = PatientBadge.award(patient, badge);
        patientBadgeRepository.save(patientBadge);

        log.info("Awarded badge '{}' to patient {} (ID: {})", badge.getName(), patientId, patientBadge.getId());

        // In real app: send push notification
        // notificationService.sendBadgeEarnedNotification(patientId, badge);
    }

    /**
     * Count events for a patient (placeholder).
     */
    private long countEventsForPatient(UUID patientId, String eventType, Integer periodDays) {
        // In real app, query the event repository
        // For now, return 0
        return 0;
    }

    /**
     * Count materials read by a patient (placeholder).
     */
    private long countMaterialsRead(UUID patientId, String category) {
        // In real app, query the material progress repository
        // For now, return 0
        return 0;
    }

    /**
     * Get badge statistics for a patient.
     */
    @Transactional(readOnly = true)
    public BadgeStatsDto getBadgeStats(UUID patientId) {
        long totalBadges = patientBadgeRepository.countByPatientId(patientId);
        long engagementBadges = patientBadgeRepository.countByPatientIdAndBadgeCategory(patientId, Badge.BadgeCategory.ENGAGEMENT);
        long complianceBadges = patientBadgeRepository.countByPatientIdAndBadgeCategory(patientId, Badge.BadgeCategory.COMPLIANCE);
        long educationBadges = patientBadgeRepository.countByPatientIdAndBadgeCategory(patientId, Badge.BadgeCategory.EDUCATION);
        long milestoneBadges = patientBadgeRepository.countByPatientIdAndBadgeCategory(patientId, Badge.BadgeCategory.MILESTONE);

        return new BadgeStatsDto(totalBadges, engagementBadges, complianceBadges, educationBadges, milestoneBadges);
    }

    /**
     * DTO for badge statistics.
     */
    public record BadgeStatsDto(
        long totalBadges,
        long engagementBadges,
        long complianceBadges,
        long educationBadges,
        long milestoneBadges
    ) {}
}
