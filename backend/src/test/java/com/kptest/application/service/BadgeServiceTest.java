package com.kptest.application.service;

import com.kptest.api.dto.BadgeDto;
import com.kptest.domain.gamification.Badge;
import com.kptest.domain.gamification.BadgeRule;
import com.kptest.domain.gamification.PatientBadge;
import com.kptest.domain.gamification.repository.BadgeRepository;
import com.kptest.domain.gamification.repository.PatientBadgeRepository;
import com.kptest.domain.patient.Patient;
import com.kptest.domain.patient.PatientRepository;
import com.kptest.exception.ResourceNotFoundException;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

import static org.assertj.core.api.Assertions.*;
import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.*;

/**
 * Unit tests for BadgeService
 */
@ExtendWith(MockitoExtension.class)
class BadgeServiceTest {

    @Mock
    private BadgeRepository badgeRepository;

    @Mock
    private PatientBadgeRepository patientBadgeRepository;

    @Mock
    private PatientRepository patientRepository;

    @InjectMocks
    private BadgeService badgeService;

    private UUID badgeId;
    private UUID patientId;
    private UUID userId;
    private Badge badge;

    @BeforeEach
    void setUp() {
        badgeId = UUID.randomUUID();
        patientId = UUID.randomUUID();
        userId = UUID.randomUUID();

        badge = new Badge();
        badge.setId(badgeId);
        badge.setName("Test Badge");
        badge.setDescription("Test Description");
        badge.setCategory(Badge.BadgeCategory.ENGAGEMENT);
        badge.setActive(true);
        badge.setHidden(false);
        badge.setCreatedBy(userId);
    }

    @Test
    @DisplayName("Should get all active badges")
    void getAllBadges_ShouldReturnBadges() {
        // Given
        when(badgeRepository.findByActiveOrderByCreatedAtDesc(true)).thenReturn(List.of(badge));

        // When
        List<BadgeDto> result = badgeService.getAllBadges();

        // Then
        assertThat(result).hasSize(1);
        assertThat(result.get(0).id()).isEqualTo(badgeId);
        verify(badgeRepository).findByActiveOrderByCreatedAtDesc(true);
    }

    @Test
    @DisplayName("Should get visible badges")
    void getVisibleBadges_ShouldReturnBadges() {
        // Given
        when(badgeRepository.findByActiveAndHiddenOrderByCategory(true, false))
            .thenReturn(List.of(badge));

        // When
        List<BadgeDto> result = badgeService.getVisibleBadges();

        // Then
        assertThat(result).hasSize(1);
        verify(badgeRepository).findByActiveAndHiddenOrderByCategory(true, false);
    }

    @Test
    @DisplayName("Should get badge by ID")
    void getBadgeById_ShouldReturnBadge() {
        // Given
        when(badgeRepository.findById(badgeId)).thenReturn(Optional.of(badge));

        // When
        BadgeDto result = badgeService.getBadgeById(badgeId);

        // Then
        assertThat(result.id()).isEqualTo(badgeId);
        assertThat(result.name()).isEqualTo("Test Badge");
        verify(badgeRepository).findById(badgeId);
    }

    @Test
    @DisplayName("Should throw exception when badge not found")
    void getBadgeById_ShouldThrowException_WhenNotFound() {
        // Given
        when(badgeRepository.findById(badgeId)).thenReturn(Optional.empty());

        // When & Then
        assertThatThrownBy(() -> badgeService.getBadgeById(badgeId))
            .isInstanceOf(ResourceNotFoundException.class)
            .hasMessageContaining("Badge not found");
    }

    @Test
    @DisplayName("Should create badge")
    void createBadge_ShouldReturnCreatedBadge() {
        // Given
        BadgeDto dto = new BadgeDto(
            null, "New Badge", "Description", null, "#FF0000",
            Badge.BadgeCategory.EDUCATION, null, null, null, userId, null, null
        );
        when(badgeRepository.save(any(Badge.class))).thenAnswer(i -> i.getArguments()[0]);

        // When
        BadgeDto result = badgeService.createBadge(dto);

        // Then
        assertThat(result.name()).isEqualTo("New Badge");
        assertThat(result.category()).isEqualTo(Badge.BadgeCategory.EDUCATION);
        verify(badgeRepository).save(any(Badge.class));
    }

    @Test
    @DisplayName("Should update badge")
    void updateBadge_ShouldReturnUpdatedBadge() {
        // Given
        when(badgeRepository.findById(badgeId)).thenReturn(Optional.of(badge));
        when(badgeRepository.save(any(Badge.class))).thenAnswer(i -> i.getArguments()[0]);

        BadgeDto updateDto = new BadgeDto(
            null, "Updated Badge", null, null, null,
            Badge.BadgeCategory.COMPLIANCE, null, null, null, null, null, null
        );

        // When
        BadgeDto result = badgeService.updateBadge(badgeId, updateDto);

        // Then
        assertThat(result.name()).isEqualTo("Updated Badge");
        assertThat(result.category()).isEqualTo(Badge.BadgeCategory.COMPLIANCE);
        verify(badgeRepository).save(badge);
    }

    @Test
    @DisplayName("Should delete badge")
    void deleteBadge_ShouldDeleteBadge() {
        // Given
        when(badgeRepository.findById(badgeId)).thenReturn(Optional.of(badge));

        // When
        badgeService.deleteBadge(badgeId);

        // Then
        verify(badgeRepository).delete(badge);
    }

    @Test
    @DisplayName("Should get patient badges")
    void getPatientBadges_ShouldReturnBadges() {
        // Given
        PatientBadge patientBadge = createPatientBadge();
        when(patientBadgeRepository.findByPatientIdOrderByEarnedAtDesc(patientId))
            .thenReturn(List.of(patientBadge));

        // When
        var result = badgeService.getPatientBadges(patientId);

        // Then
        assertThat(result).hasSize(1);
        verify(patientBadgeRepository).findByPatientIdOrderByEarnedAtDesc(patientId);
    }

    @Test
    @DisplayName("Should get unnotified badges")
    void getUnnotifiedBadges_ShouldReturnBadges() {
        // Given
        PatientBadge patientBadge = createPatientBadge();
        patientBadge.setNotified(false);
        when(patientBadgeRepository.findByPatientIdAndNotified(patientId, false))
            .thenReturn(List.of(patientBadge));

        // When
        var result = badgeService.getUnnotifiedBadges(patientId);

        // Then
        assertThat(result).hasSize(1);
        verify(patientBadgeRepository).findByPatientIdAndNotified(patientId, false);
    }

    @Test
    @DisplayName("Should mark badge as notified")
    void markBadgeAsNotified_ShouldMarkNotified() {
        // Given
        UUID patientBadgeId = UUID.randomUUID();
        PatientBadge patientBadge = createPatientBadge();
        patientBadge.setId(patientBadgeId);
        when(patientBadgeRepository.findById(patientBadgeId)).thenReturn(Optional.of(patientBadge));
        when(patientBadgeRepository.save(any(PatientBadge.class)))
            .thenAnswer(i -> i.getArguments()[0]);

        // When
        badgeService.markBadgeAsNotified(patientBadgeId);

        // Then
        verify(patientBadgeRepository).save(patientBadge);
        assertThat(patientBadge.isNotified()).isTrue();
    }

    @Test
    @DisplayName("Should get badge stats")
    void getBadgeStats_ShouldReturnStats() {
        // Given
        when(patientBadgeRepository.countByPatientId(patientId)).thenReturn(5L);
        when(patientBadgeRepository.countByPatientIdAndBadgeCategory(patientId, Badge.BadgeCategory.ENGAGEMENT)).thenReturn(2L);
        when(patientBadgeRepository.countByPatientIdAndBadgeCategory(patientId, Badge.BadgeCategory.COMPLIANCE)).thenReturn(1L);
        when(patientBadgeRepository.countByPatientIdAndBadgeCategory(patientId, Badge.BadgeCategory.EDUCATION)).thenReturn(1L);
        when(patientBadgeRepository.countByPatientIdAndBadgeCategory(patientId, Badge.BadgeCategory.MILESTONE)).thenReturn(1L);

        // When
        var result = badgeService.getBadgeStats(patientId);

        // Then
        assertThat(result.totalBadges()).isEqualTo(5);
        assertThat(result.engagementBadges()).isEqualTo(2);
        assertThat(result.complianceBadges()).isEqualTo(1);
    }

    @Test
    @DisplayName("Should check quiz passed for badge awarding")
    void checkQuizPassed_ShouldAwardBadge() {
        // Given
        BadgeRule rule = BadgeRule.create(badge, BadgeRule.RuleType.QUIZ_PASSED, 1);
        badge.setRules(List.of(rule));

        when(badgeRepository.findByActive(true)).thenReturn(List.of(badge));
        when(patientBadgeRepository.existsByPatientIdAndBadgeId(patientId, badgeId)).thenReturn(false);
        when(patientRepository.findById(patientId)).thenReturn(Optional.of(new Patient()));
        when(patientBadgeRepository.save(any(PatientBadge.class)))
            .thenAnswer(i -> i.getArguments()[0]);

        // When
        badgeService.checkQuizPassed(patientId, UUID.randomUUID());

        // Then
        verify(patientBadgeRepository).save(any(PatientBadge.class));
    }

    private PatientBadge createPatientBadge() {
        PatientBadge pb = new PatientBadge();
        pb.setId(UUID.randomUUID());
        pb.setPatient(new Patient());
        pb.getPatient().setId(patientId);
        pb.setBadge(badge);
        pb.setNotified(true);
        return pb;
    }
}
