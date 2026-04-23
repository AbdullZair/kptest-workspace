package com.kptest.domain.staff;

import com.kptest.domain.user.User;
import jakarta.persistence.*;
import lombok.*;
import org.springframework.data.annotation.CreatedDate;
import org.springframework.data.annotation.LastModifiedDate;
import org.springframework.data.jpa.domain.support.AuditingEntityListener;

import java.time.Instant;
import java.util.UUID;

/**
 * Staff member entity for medical personnel.
 */
@Entity
@Table(name = "staff")
@EntityListeners(AuditingEntityListener.class)
@Getter
@Setter
@NoArgsConstructor(access = AccessLevel.PROTECTED)
@ToString(exclude = "user")
@EqualsAndHashCode(of = "id")
public class Staff {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @OneToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false, unique = true)
    private User user;

    @Column(name = "employee_id", length = 50)
    private String employeeId;

    @Column(name = "first_name", nullable = false, length = 100)
    private String firstName;

    @Column(name = "last_name", nullable = false, length = 100)
    private String lastName;

    @Column(length = 100)
    private String specialization;

    @Column(length = 20)
    private String phone;

    @Column(length = 255)
    private String email;

    @Column(name = "hired_at")
    private Instant hiredAt;

    @Column(nullable = false)
    private boolean active;

    @CreatedDate
    @Column(name = "created_at", nullable = false, updatable = false)
    private Instant createdAt;

    @LastModifiedDate
    @Column(name = "updated_at", nullable = false)
    private Instant updatedAt;

    /**
     * Factory method for creating a staff member.
     */
    public static Staff create(User user, String firstName, String lastName, 
                               String employeeId, String specialization) {
        Staff staff = new Staff();
        staff.user = user;
        staff.firstName = firstName;
        staff.lastName = lastName;
        staff.employeeId = employeeId;
        staff.specialization = specialization;
        staff.active = true;
        return staff;
    }

    /**
     * Deactivate staff member.
     */
    public void deactivate() {
        this.active = false;
    }
}
