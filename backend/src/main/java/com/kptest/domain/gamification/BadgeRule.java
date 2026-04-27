package com.kptest.domain.gamification;

import jakarta.persistence.*;
import lombok.*;
import org.springframework.data.annotation.CreatedDate;
import org.springframework.data.annotation.LastModifiedDate;
import org.springframework.data.jpa.domain.support.AuditingEntityListener;

import java.time.Instant;
import java.util.UUID;

/**
 * Badge rule entity defining conditions for earning a badge.
 */
@Entity
@Table(name = "badge_rules")
@EntityListeners(AuditingEntityListener.class)
@Getter
@Setter
@NoArgsConstructor(access = AccessLevel.PROTECTED)
@EqualsAndHashCode(of = "id")
public class BadgeRule {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "badge_id", nullable = false)
    private Badge badge;

    @Enumerated(EnumType.STRING)
    @Column(name = "rule_type", nullable = false)
    private RuleType ruleType;

    @Column(name = "threshold", nullable = false)
    private Integer threshold;

    @Column(name = "event_type", length = 100)
    private String eventType;

    @Column(name = "category_filter", length = 100)
    private String categoryFilter;

    @Column(name = "period_days")
    private Integer periodDays;

    @Column(name = "quiz_id")
    private UUID quizId;

    @Column(name = "created_at", nullable = false, updatable = false)
    @CreatedDate
    private Instant createdAt;

    @Column(name = "updated_at", nullable = false)
    @LastModifiedDate
    private Instant updatedAt;

    /**
     * Rule type enum defining what kind of action triggers the badge.
     */
    public enum RuleType {
        EVENTS_COMPLETED,     // Number of events completed
        COMPLIANCE_THRESHOLD, // Compliance score threshold
        MATERIALS_READ,       // Number of materials read
        QUIZ_PASSED,          // Quiz passed (optionally specific quiz)
        DAYS_STREAK,          // Consecutive days of activity
        STAGE_COMPLETED       // Number of therapy stages completed
    }

    /**
     * Factory method for creating a badge rule.
     */
    public static BadgeRule create(
        Badge badge,
        RuleType ruleType,
        Integer threshold
    ) {
        BadgeRule rule = new BadgeRule();
        rule.badge = badge;
        rule.ruleType = ruleType;
        rule.threshold = threshold;
        return rule;
    }

    /**
     * Set the parent badge.
     */
    public void setBadge(Badge badge) {
        this.badge = badge;
    }

    /**
     * Check if rule has a category filter.
     */
    public boolean hasCategoryFilter() {
        return this.categoryFilter != null && !this.categoryFilter.isBlank();
    }

    /**
     * Check if rule has a time period.
     */
    public boolean hasPeriod() {
        return this.periodDays != null && this.periodDays > 0;
    }

    /**
     * Check if rule is for a specific quiz.
     */
    public boolean isQuizSpecific() {
        return this.ruleType == RuleType.QUIZ_PASSED && this.quizId != null;
    }
}
