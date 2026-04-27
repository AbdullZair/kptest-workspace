package com.kptest.api.dto;

import com.fasterxml.jackson.annotation.JsonProperty;
import com.kptest.domain.gamification.BadgeRule;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

import java.time.Instant;
import java.util.UUID;

/**
 * DTO for BadgeRule entity.
 */
public record BadgeRuleDto(
    @JsonProperty("id")
    UUID id,

    @JsonProperty("badge_id")
    UUID badgeId,

    @JsonProperty("rule_type")
    @NotNull(message = "Rule type is required")
    BadgeRule.RuleType ruleType,

    @JsonProperty("threshold")
    @NotNull(message = "Threshold is required")
    Integer threshold,

    @JsonProperty("event_type")
    String eventType,

    @JsonProperty("category_filter")
    String categoryFilter,

    @JsonProperty("period_days")
    Integer periodDays,

    @JsonProperty("quiz_id")
    UUID quizId,

    @JsonProperty("created_at")
    Instant createdAt,

    @JsonProperty("updated_at")
    Instant updatedAt
) {

    public static BadgeRuleDto fromRule(BadgeRule rule) {
        return new BadgeRuleDto(
            rule.getId(),
            rule.getBadge() != null ? rule.getBadge().getId() : null,
            rule.getRuleType(),
            rule.getThreshold(),
            rule.getEventType(),
            rule.getCategoryFilter(),
            rule.getPeriodDays(),
            rule.getQuizId(),
            rule.getCreatedAt(),
            rule.getUpdatedAt()
        );
    }

    /**
     * Builder for BadgeRuleDto.
     */
    public static class Builder {
        private UUID id;
        private UUID badgeId;
        private BadgeRule.RuleType ruleType;
        private Integer threshold;
        private String eventType;
        private String categoryFilter;
        private Integer periodDays;
        private UUID quizId;
        private Instant createdAt;
        private Instant updatedAt;

        public Builder id(UUID id) { this.id = id; return this; }
        public Builder badgeId(UUID badgeId) { this.badgeId = badgeId; return this; }
        public Builder ruleType(BadgeRule.RuleType ruleType) { this.ruleType = ruleType; return this; }
        public Builder threshold(Integer threshold) { this.threshold = threshold; return this; }
        public Builder eventType(String eventType) { this.eventType = eventType; return this; }
        public Builder categoryFilter(String categoryFilter) { this.categoryFilter = categoryFilter; return this; }
        public Builder periodDays(Integer periodDays) { this.periodDays = periodDays; return this; }
        public Builder quizId(UUID quizId) { this.quizId = quizId; return this; }
        public Builder createdAt(Instant createdAt) { this.createdAt = createdAt; return this; }
        public Builder updatedAt(Instant updatedAt) { this.updatedAt = updatedAt; return this; }

        public BadgeRuleDto build() {
            return new BadgeRuleDto(
                id, badgeId, ruleType, threshold, eventType, categoryFilter, periodDays, quizId, createdAt, updatedAt
            );
        }
    }

    public static Builder builder() {
        return new Builder();
    }
}
