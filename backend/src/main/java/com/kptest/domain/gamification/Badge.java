package com.kptest.domain.gamification;

import jakarta.persistence.*;
import lombok.*;
import org.springframework.data.annotation.CreatedDate;
import org.springframework.data.annotation.LastModifiedDate;
import org.springframework.data.jpa.domain.support.AuditingEntityListener;

import java.time.Instant;
import java.util.ArrayList;
import java.util.List;
import java.util.UUID;

/**
 * Badge entity representing a gamification achievement.
 */
@Entity
@Table(name = "badges")
@EntityListeners(AuditingEntityListener.class)
@Getter
@Setter
@NoArgsConstructor(access = AccessLevel.PROTECTED)
@EqualsAndHashCode(of = "id")
public class Badge {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @Column(nullable = false, length = 200)
    private String name;

    @Column(columnDefinition = "TEXT")
    private String description;

    @Column(name = "icon_url", length = 500)
    private String iconUrl;

    @Column(name = "badge_color", length = 20)
    private String color;

    @Enumerated(EnumType.STRING)
    @Column(name = "badge_category", length = 50)
    private BadgeCategory category;

    @Column(name = "is_active", nullable = false)
    private Boolean active;

    @Column(name = "is_hidden", nullable = false)
    private Boolean hidden;

    @OneToMany(mappedBy = "badge", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<BadgeRule> rules = new ArrayList<>();

    @Column(name = "created_by", nullable = false)
    private UUID createdBy;

    @Column(name = "created_at", nullable = false, updatable = false)
    @CreatedDate
    private Instant createdAt;

    @Column(name = "updated_at", nullable = false)
    @LastModifiedDate
    private Instant updatedAt;

    /**
     * Badge category enum.
     */
    public enum BadgeCategory {
        ENGAGEMENT,     // Participation and activity
        COMPLIANCE,     // Adherence to therapy
        EDUCATION,      // Learning and quiz achievements
        MILESTONE,      // Special achievements
        STREAK          // Consecutive activity
    }

    /**
     * Factory method for creating a badge.
     */
    public static Badge create(
        String name,
        String description,
        BadgeCategory category,
        String iconUrl,
        String color,
        UUID createdBy
    ) {
        Badge badge = new Badge();
        badge.name = name;
        badge.description = description;
        badge.category = category;
        badge.iconUrl = iconUrl;
        badge.color = color;
        badge.createdBy = createdBy;
        badge.active = true;
        badge.hidden = false;
        return badge;
    }

    /**
     * Add a rule to the badge.
     */
    public void addRule(BadgeRule rule) {
        this.rules.add(rule);
        rule.setBadge(this);
    }

    /**
     * Remove a rule from the badge.
     */
    public void removeRule(BadgeRule rule) {
        this.rules.remove(rule);
        rule.setBadge(null);
    }

    /**
     * Deactivate the badge.
     */
    public void deactivate() {
        this.active = false;
    }

    /**
     * Activate the badge.
     */
    public void activate() {
        this.active = true;
    }

    /**
     * Hide the badge from patients.
     */
    public void hide() {
        this.hidden = true;
    }

    /**
     * Show the badge to patients.
     */
    public void show() {
        this.hidden = false;
    }
}
