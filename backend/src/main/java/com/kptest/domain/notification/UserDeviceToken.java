package com.kptest.domain.notification;

import jakarta.persistence.*;
import lombok.*;
import org.springframework.data.annotation.CreatedDate;
import org.springframework.data.jpa.domain.support.AuditingEntityListener;

import java.time.Instant;
import java.util.UUID;

/**
 * Entity for storing user device tokens for push notifications.
 */
@Entity
@Table(name = "user_device_tokens")
@EntityListeners(AuditingEntityListener.class)
@Getter
@Setter
@NoArgsConstructor(access = AccessLevel.PROTECTED)
@EqualsAndHashCode(of = "id")
public class UserDeviceToken {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @Column(name = "user_id", nullable = false)
    private UUID userId;

    @Column(nullable = false, columnDefinition = "TEXT")
    private String token;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 10)
    private Platform platform;

    @CreatedDate
    @Column(name = "created_at", nullable = false, updatable = false)
    private Instant createdAt;

    @Column(name = "last_used_at")
    private Instant lastUsedAt;

    /**
     * Platform enum for device types.
     */
    public enum Platform {
        IOS,
        ANDROID
    }

    /**
     * Factory method for creating a new user device token.
     */
    public static UserDeviceToken create(UUID userId, String token, Platform platform) {
        UserDeviceToken deviceToken = new UserDeviceToken();
        deviceToken.userId = userId;
        deviceToken.token = token;
        deviceToken.platform = platform;
        return deviceToken;
    }

    /**
     * Update last used timestamp.
     */
    public void markAsUsed() {
        this.lastUsedAt = Instant.now();
    }
}
