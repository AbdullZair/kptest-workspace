package com.kptest.domain.audit;

import jakarta.persistence.*;
import lombok.*;
import org.springframework.data.annotation.CreatedDate;
import org.springframework.data.jpa.domain.support.AuditingEntityListener;

import java.time.Instant;
import java.util.UUID;

/**
 * System log entity for tracking application events and errors.
 */
@Entity
@Table(name = "system_logs")
@EntityListeners(AuditingEntityListener.class)
@Getter
@Setter
@NoArgsConstructor(access = AccessLevel.PROTECTED)
@EqualsAndHashCode(of = "id")
public class SystemLog {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 10)
    private LogLevel level;

    @Column(nullable = false, columnDefinition = "text")
    private String message;

    @Column(name = "stack_trace", columnDefinition = "text")
    private String stackTrace;

    @Column(name = "source_class", length = 255)
    private String sourceClass;

    @Column(name = "source_method", length = 255)
    private String sourceMethod;

    @CreatedDate
    @Column(name = "created_at", nullable = false, updatable = false)
    private Instant createdAt;

    /**
     * Log level enumeration.
     */
    public enum LogLevel {
        DEBUG,
        INFO,
        WARN,
        ERROR
    }

    /**
     * Factory method for creating a system log.
     */
    public static SystemLog create(LogLevel level, String message) {
        SystemLog log = new SystemLog();
        log.level = level;
        log.message = message;
        return log;
    }

    /**
     * Set stack trace for the log.
     */
    public SystemLog withStackTrace(String stackTrace) {
        this.stackTrace = stackTrace;
        return this;
    }

    /**
     * Set source information.
     */
    public SystemLog withSource(String sourceClass, String sourceMethod) {
        this.sourceClass = sourceClass;
        this.sourceMethod = sourceMethod;
        return this;
    }
}
