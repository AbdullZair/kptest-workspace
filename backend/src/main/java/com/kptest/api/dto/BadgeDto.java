package com.kptest.api.dto;

import com.fasterxml.jackson.annotation.JsonProperty;
import com.kptest.domain.gamification.Badge;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

import java.time.Instant;
import java.util.List;
import java.util.UUID;

/**
 * DTO for Badge entity.
 */
public record BadgeDto(
    @JsonProperty("id")
    UUID id,

    @JsonProperty("name")
    @NotBlank(message = "Badge name is required")
    String name,

    @JsonProperty("description")
    @NotBlank(message = "Badge description is required")
    String description,

    @JsonProperty("icon_url")
    String iconUrl,

    @JsonProperty("color")
    String color,

    @JsonProperty("category")
    @NotNull(message = "Badge category is required")
    Badge.BadgeCategory category,

    @JsonProperty("is_active")
    Boolean active,

    @JsonProperty("is_hidden")
    Boolean hidden,

    @JsonProperty("rules")
    List<BadgeRuleDto> rules,

    @JsonProperty("created_by")
    UUID createdBy,

    @JsonProperty("created_at")
    Instant createdAt,

    @JsonProperty("updated_at")
    Instant updatedAt
) {

    public static BadgeDto fromBadge(Badge badge) {
        List<BadgeRuleDto> ruleDtos = badge.getRules().stream()
            .map(BadgeRuleDto::fromRule)
            .toList();

        return new BadgeDto(
            badge.getId(),
            badge.getName(),
            badge.getDescription(),
            badge.getIconUrl(),
            badge.getColor(),
            badge.getCategory(),
            badge.getActive(),
            badge.getHidden(),
            ruleDtos,
            badge.getCreatedBy(),
            badge.getCreatedAt(),
            badge.getUpdatedAt()
        );
    }

    public static BadgeDto fromBadgeWithoutRules(Badge badge) {
        return new BadgeDto(
            badge.getId(),
            badge.getName(),
            badge.getDescription(),
            badge.getIconUrl(),
            badge.getColor(),
            badge.getCategory(),
            badge.getActive(),
            badge.getHidden(),
            null,
            badge.getCreatedBy(),
            badge.getCreatedAt(),
            badge.getUpdatedAt()
        );
    }

    /**
     * Builder for BadgeDto.
     */
    public static class Builder {
        private UUID id;
        private String name;
        private String description;
        private String iconUrl;
        private String color;
        private Badge.BadgeCategory category;
        private Boolean active;
        private Boolean hidden;
        private List<BadgeRuleDto> rules;
        private UUID createdBy;
        private Instant createdAt;
        private Instant updatedAt;

        public Builder id(UUID id) { this.id = id; return this; }
        public Builder name(String name) { this.name = name; return this; }
        public Builder description(String description) { this.description = description; return this; }
        public Builder iconUrl(String iconUrl) { this.iconUrl = iconUrl; return this; }
        public Builder color(String color) { this.color = color; return this; }
        public Builder category(Badge.BadgeCategory category) { this.category = category; return this; }
        public Builder active(Boolean active) { this.active = active; return this; }
        public Builder hidden(Boolean hidden) { this.hidden = hidden; return this; }
        public Builder rules(List<BadgeRuleDto> rules) { this.rules = rules; return this; }
        public Builder createdBy(UUID createdBy) { this.createdBy = createdBy; return this; }
        public Builder createdAt(Instant createdAt) { this.createdAt = createdAt; return this; }
        public Builder updatedAt(Instant updatedAt) { this.updatedAt = updatedAt; return this; }

        public BadgeDto build() {
            return new BadgeDto(
                id, name, description, iconUrl, color, category, active, hidden, rules, createdBy, createdAt, updatedAt
            );
        }
    }

    public static Builder builder() {
        return new Builder();
    }
}
