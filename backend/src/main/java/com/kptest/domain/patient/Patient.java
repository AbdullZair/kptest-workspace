package com.kptest.domain.patient;

import com.kptest.domain.user.User;
import com.kptest.domain.user.VerificationStatus;
import jakarta.persistence.*;
import lombok.*;
import org.springframework.data.annotation.CreatedDate;
import org.springframework.data.annotation.LastModifiedDate;
import org.springframework.data.jpa.domain.support.AuditingEntityListener;

import java.time.LocalDate;
import java.time.Instant;
import java.util.UUID;

/**
 * Patient entity containing medical and demographic data.
 */
@Entity
@Table(name = "patients")
@EntityListeners(AuditingEntityListener.class)
@Getter
@Setter
@NoArgsConstructor(access = AccessLevel.PROTECTED)
@ToString(exclude = "user")
@EqualsAndHashCode(of = "id")
public class Patient {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @OneToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false, unique = true)
    private User user;

    @Column(nullable = false, unique = true, length = 11)
    private String pesel;

    @Column(name = "first_name", nullable = false, length = 100)
    private String firstName;

    @Column(name = "last_name", nullable = false, length = 100)
    private String lastName;

    @Column(name = "date_of_birth")
    private LocalDate dateOfBirth;

    @Enumerated(EnumType.STRING)
    private Gender gender;

    @Column(name = "his_patient_id", length = 100)
    private String hisPatientId;

    @Enumerated(EnumType.STRING)
    @Column(name = "verification_status", nullable = false)
    private VerificationStatus verificationStatus;

    @Column(name = "verified_at")
    private Instant verifiedAt;

    @Column(name = "verified_by")
    private UUID verifiedBy;

    @Column(name = "verification_method", length = 50)
    private String verificationMethod;

    @Column(name = "address_street", length = 255)
    private String addressStreet;

    @Column(name = "address_city", length = 100)
    private String addressCity;

    @Column(name = "address_postal_code", length = 20)
    private String addressPostalCode;

    @CreatedDate
    @Column(name = "created_at", nullable = false, updatable = false)
    private Instant createdAt;

    @LastModifiedDate
    @Column(name = "updated_at", nullable = false)
    private Instant updatedAt;

    /**
     * Gender enum.
     */
    public enum Gender {
        MALE,
        FEMALE,
        OTHER,
        UNKNOWN
    }

    /**
     * Factory method for creating a patient.
     */
    public static Patient create(User user, String pesel, String firstName, String lastName) {
        Patient patient = new Patient();
        patient.user = user;
        patient.pesel = pesel;
        patient.firstName = firstName;
        patient.lastName = lastName;
        patient.verificationStatus = VerificationStatus.PENDING;
        return patient;
    }

    /**
     * Mark patient as verified.
     */
    public void verify(UUID verifiedBy, String verificationMethod) {
        this.verificationStatus = VerificationStatus.APPROVED;
        this.verifiedAt = Instant.now();
        this.verifiedBy = verifiedBy;
        this.verificationMethod = verificationMethod;
    }

    /**
     * Mark patient as rejected.
     */
    public void reject() {
        this.verificationStatus = VerificationStatus.REJECTED;
    }

    /**
     * Check if patient is verified.
     */
    public boolean isVerified() {
        return verificationStatus == VerificationStatus.APPROVED;
    }
}
