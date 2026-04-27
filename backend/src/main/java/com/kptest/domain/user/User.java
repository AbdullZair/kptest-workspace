package com.kptest.domain.user;

import com.kptest.domain.patient.Patient;
import com.kptest.domain.staff.Staff;
import jakarta.persistence.*;
import lombok.*;
import org.springframework.data.annotation.CreatedDate;
import org.springframework.data.annotation.LastModifiedDate;
import org.springframework.data.jpa.domain.support.AuditingEntityListener;

import java.time.Instant;
import java.util.UUID;

/**
 * Base user entity for all system users.
 * Contains authentication data and common attributes.
 */
@Entity
@Table(name = "users")
@EntityListeners(AuditingEntityListener.class)
@Getter
@Setter
@NoArgsConstructor(access = AccessLevel.PROTECTED)
@ToString(exclude = {"patient", "staff"})
@EqualsAndHashCode(of = "id")
public class User {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @Column(nullable = false, unique = true, length = 255)
    private String email;

    @Column(unique = true, length = 20)
    private String phone;

    @Column(nullable = false)
    private String passwordHash;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private UserRole role;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private AccountStatus status;

    @Column(name = "two_factor_enabled", nullable = false)
    private boolean twoFactorEnabled;

    @Column(name = "two_factor_secret", length = 255)
    private String twoFactorSecret;

    @Column(name = "failed_login_attempts", nullable = false)
    private int failedLoginAttempts;

    @Column(name = "locked_until")
    private Instant lockedUntil;

    @Column(name = "last_login_at")
    private Instant lastLoginAt;

    @Column(name = "password_changed_at")
    private Instant passwordChangedAt;

    @CreatedDate
    @Column(name = "created_at", nullable = false, updatable = false)
    private Instant createdAt;

    @LastModifiedDate
    @Column(name = "updated_at", nullable = false)
    private Instant updatedAt;

    @Column(name = "deleted_at")
    private Instant deletedAt;

    // One-to-one relationships
    @OneToOne(mappedBy = "user", cascade = CascadeType.ALL, orphanRemoval = true)
    private Patient patient;

    @OneToOne(mappedBy = "user", cascade = CascadeType.ALL, orphanRemoval = true)
    private Staff staff;

    /**
     * Factory method for creating a new user.
     */
    public static User create(String email, String passwordHash, UserRole role) {
        User user = new User();
        user.email = email;
        user.passwordHash = passwordHash;
        user.role = role;
        user.status = AccountStatus.ACTIVE;
        user.twoFactorEnabled = false;
        user.failedLoginAttempts = 0;
        return user;
    }

    /**
     * Check if account is locked.
     */
    public boolean isLocked() {
        if (lockedUntil == null) {
            return false;
        }
        return Instant.now().isBefore(lockedUntil);
    }

    /**
     * Check if account is active.
     */
    public boolean isActive() {
        return status == AccountStatus.ACTIVE && !isLocked() && deletedAt == null;
    }

    /**
     * Increment failed login attempts and lock if threshold reached.
     */
    public void incrementFailedLoginAttempts(int maxAttempts, int lockoutMinutes) {
        this.failedLoginAttempts++;
        if (this.failedLoginAttempts >= maxAttempts) {
            this.lockedUntil = Instant.now().plusSeconds(lockoutMinutes * 60L);
            this.status = AccountStatus.BLOCKED;
        }
    }

    /**
     * Reset failed login attempts after successful login.
     */
    public void resetFailedLoginAttempts() {
        this.failedLoginAttempts = 0;
        this.lockedUntil = null;
        if (this.status == AccountStatus.BLOCKED) {
            this.status = AccountStatus.ACTIVE;
        }
        this.lastLoginAt = Instant.now();
    }

    /**
     * Soft delete the user.
     */
    public void deactivate() {
        this.deletedAt = Instant.now();
        this.status = AccountStatus.DEACTIVATED;
    }
}
