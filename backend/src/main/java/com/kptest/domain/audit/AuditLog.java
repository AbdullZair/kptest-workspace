package com.kptest.domain.audit;

import jakarta.persistence.*;
import lombok.*;
import org.springframework.data.annotation.CreatedDate;
import org.springframework.data.jpa.domain.support.AuditingEntityListener;

import java.time.Instant;
import java.util.UUID;

/**
 * Audit log entity for tracking user actions in the system.
 */
@Entity
@Table(name = "audit_logs")
@EntityListeners(AuditingEntityListener.class)
@Getter
@Setter
@NoArgsConstructor(access = AccessLevel.PROTECTED)
@EqualsAndHashCode(of = "id")
public class AuditLog {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @Column(name = "user_id", nullable = false)
    private UUID userId;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 20)
    private AuditAction action;

    @Column(name = "entity_type", nullable = false, length = 100)
    private String entityType;

    @Column(name = "entity_id")
    private UUID entityId;

    @Column(name = "old_value", columnDefinition = "jsonb")
    @org.hibernate.annotations.JdbcTypeCode(org.hibernate.type.SqlTypes.JSON)
    private String oldValue;

    @Column(name = "new_value", columnDefinition = "jsonb")
    @org.hibernate.annotations.JdbcTypeCode(org.hibernate.type.SqlTypes.JSON)
    private String newValue;

    @Column(name = "ip_address", length = 45)
    private String ipAddress;

    @Column(name = "user_agent", length = 500)
    private String userAgent;

    @CreatedDate
    @Column(name = "created_at", nullable = false, updatable = false)
    private Instant createdAt;

    /**
     * Audit action types.
     */
    public enum AuditAction {
        CREATE,
        UPDATE,
        DELETE,
        VIEW,
        LOGIN,
        LOGOUT,
        PASSWORD_CHANGED
    }

    /**
     * Factory method for creating an audit log.
     */
    public static AuditLog create(UUID userId, AuditAction action, String entityType, UUID entityId) {
        AuditLog log = new AuditLog();
        log.userId = userId;
        log.action = action;
        log.entityType = entityType;
        log.entityId = entityId;
        return log;
    }

    /**
     * Set old and new values for the audit log.
     */
    public AuditLog withValues(String oldValue, String newValue) {
        this.oldValue = oldValue;
        this.newValue = newValue;
        return this;
    }

    /**
     * Set IP address and user agent.
     */
    public AuditLog withRequestInfo(String ipAddress, String userAgent) {
        this.ipAddress = ipAddress;
        this.userAgent = userAgent;
        return this;
    }
}
