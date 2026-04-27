package com.kptest.api.dto;

import com.fasterxml.jackson.annotation.JsonProperty;
import com.kptest.domain.gamification.PatientBadge;

import java.time.Instant;
import java.util.UUID;

/**
 * DTO for PatientBadge entity.
 */
public record PatientBadgeDto(
    @JsonProperty("id")
    UUID id,

    @JsonProperty("patient_id")
    UUID patientId,

    @JsonProperty("badge_id")
    UUID badgeId,

    @JsonProperty("badge_name")
    String badgeName,

    @JsonProperty("badge_description")
    String badgeDescription,

    @JsonProperty("badge_icon_url")
    String badgeIconUrl,

    @JsonProperty("badge_color")
    String badgeColor,

    @JsonProperty("badge_category")
    String badgeCategory,

    @JsonProperty("earned_at")
    Instant earnedAt,

    @JsonProperty("notified")
    Boolean notified,

    @JsonProperty("created_at")
    Instant createdAt
) {

    public static PatientBadgeDto fromPatientBadge(PatientBadge patientBadge) {
        return new PatientBadgeDto(
            patientBadge.getId(),
            patientBadge.getPatient().getId(),
            patientBadge.getBadge().getId(),
            patientBadge.getBadge().getName(),
            patientBadge.getBadge().getDescription(),
            patientBadge.getBadge().getIconUrl(),
            patientBadge.getBadge().getColor(),
            patientBadge.getBadge().getCategory() != null ? patientBadge.getBadge().getCategory().name() : null,
            patientBadge.getEarnedAt(),
            patientBadge.getNotified(),
            patientBadge.getCreatedAt()
        );
    }

    /**
     * Builder for PatientBadgeDto.
     */
    public static class Builder {
        private UUID id;
        private UUID patientId;
        private UUID badgeId;
        private String badgeName;
        private String badgeDescription;
        private String badgeIconUrl;
        private String badgeColor;
        private String badgeCategory;
        private Instant earnedAt;
        private Boolean notified;
        private Instant createdAt;

        public Builder id(UUID id) { this.id = id; return this; }
        public Builder patientId(UUID patientId) { this.patientId = patientId; return this; }
        public Builder badgeId(UUID badgeId) { this.badgeId = badgeId; return this; }
        public Builder badgeName(String badgeName) { this.badgeName = badgeName; return this; }
        public Builder badgeDescription(String badgeDescription) { this.badgeDescription = badgeDescription; return this; }
        public Builder badgeIconUrl(String badgeIconUrl) { this.badgeIconUrl = badgeIconUrl; return this; }
        public Builder badgeColor(String badgeColor) { this.badgeColor = badgeColor; return this; }
        public Builder badgeCategory(String badgeCategory) { this.badgeCategory = badgeCategory; return this; }
        public Builder earnedAt(Instant earnedAt) { this.earnedAt = earnedAt; return this; }
        public Builder notified(Boolean notified) { this.notified = notified; return this; }
        public Builder createdAt(Instant createdAt) { this.createdAt = createdAt; return this; }

        public PatientBadgeDto build() {
            return new PatientBadgeDto(
                id, patientId, badgeId, badgeName, badgeDescription, badgeIconUrl,
                badgeColor, badgeCategory, earnedAt, notified, createdAt
            );
        }
    }

    public static Builder builder() {
        return new Builder();
    }
}
