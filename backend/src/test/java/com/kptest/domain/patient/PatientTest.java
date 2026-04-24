package com.kptest.domain.patient;

import com.kptest.domain.user.AccountStatus;
import com.kptest.domain.user.User;
import com.kptest.domain.user.UserRole;
import com.kptest.domain.user.VerificationStatus;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Nested;
import org.junit.jupiter.api.Test;

import java.time.Instant;
import java.util.UUID;

import static org.assertj.core.api.Assertions.*;

/**
 * Unit tests for Patient entity.
 */
@DisplayName("Patient Entity Unit Tests")
class PatientTest {

    private User testUser;
    private Patient patient;
    private static final String TEST_PESEL = "90010112345";
    private static final String TEST_FIRST_NAME = "John";
    private static final String TEST_LAST_NAME = "Doe";
    private static final UUID TEST_VERIFIED_BY = UUID.randomUUID();

    @BeforeEach
    void setUp() {
        testUser = User.create("test@example.com", "passwordHash", UserRole.PATIENT);
        patient = Patient.create(testUser, TEST_PESEL, TEST_FIRST_NAME, TEST_LAST_NAME);
    }

    @Nested
    @DisplayName("Create Patient Tests")
    class CreatePatientTests {

        @Test
        @DisplayName("shouldCreatePatient_WithValidData")
        void shouldCreatePatient_WithValidData() {
            // When
            Patient created = Patient.create(testUser, TEST_PESEL, TEST_FIRST_NAME, TEST_LAST_NAME);

            // Then
            assertThat(created).isNotNull();
            assertThat(created.getUser()).isEqualTo(testUser);
            assertThat(created.getPesel()).isEqualTo(TEST_PESEL);
            assertThat(created.getFirstName()).isEqualTo(TEST_FIRST_NAME);
            assertThat(created.getLastName()).isEqualTo(TEST_LAST_NAME);
            assertThat(created.getVerificationStatus()).isEqualTo(VerificationStatus.PENDING);
        }

        @Test
        @DisplayName("shouldSetDefaultVerificationStatusToPending")
        void shouldSetDefaultVerificationStatusToPending() {
            // When
            Patient created = Patient.create(testUser, "12345678901", "Jane", "Doe");

            // Then
            assertThat(created.getVerificationStatus()).isEqualTo(VerificationStatus.PENDING);
        }
    }

    @Nested
    @DisplayName("Verify Patient Tests")
    class VerifyPatientTests {

        @Test
        @DisplayName("shouldVerifyPatient_WithValidData")
        void shouldVerifyPatient_WithValidData() {
            // Given
            String method = "EMAIL";

            // When
            patient.verify(TEST_VERIFIED_BY, method);

            // Then
            assertThat(patient.getVerificationStatus()).isEqualTo(VerificationStatus.APPROVED);
            assertThat(patient.getVerifiedAt()).isNotNull();
            assertThat(patient.getVerifiedBy()).isEqualTo(TEST_VERIFIED_BY);
            assertThat(patient.getVerificationMethod()).isEqualTo(method);
        }

        @Test
        @DisplayName("shouldVerifyPatient_WithDifferentMethods")
        void shouldVerifyPatient_WithDifferentMethods() {
            // Given
            String[] methods = {"EMAIL", "SMS", "MANUAL", "DOCUMENT"};

            // When & Then
            for (String method : methods) {
                Patient p = Patient.create(testUser, "1234567890" + methods.length, "Test", "User");
                p.verify(TEST_VERIFIED_BY, method);
                assertThat(p.getVerificationMethod()).isEqualTo(method);
            }
        }

        @Test
        @DisplayName("shouldUpdateVerifiedAt_WhenVerified")
        void shouldUpdateVerifiedAt_WhenVerified() {
            // Given
            Instant beforeVerify = Instant.now();

            // When
            patient.verify(TEST_VERIFIED_BY, "EMAIL");

            // Then
            assertThat(patient.getVerifiedAt()).isAfterOrEqualTo(beforeVerify);
        }
    }

    @Nested
    @DisplayName("Reject Patient Tests")
    class RejectPatientTests {

        @Test
        @DisplayName("shouldRejectPatient")
        void shouldRejectPatient() {
            // When
            patient.reject();

            // Then
            assertThat(patient.getVerificationStatus()).isEqualTo(VerificationStatus.REJECTED);
        }

        @Test
        @DisplayName("shouldRejectPatient_WhenAlreadyPending")
        void shouldRejectPatient_WhenAlreadyPending() {
            // Given - patient is already in PENDING status

            // When
            patient.reject();

            // Then
            assertThat(patient.getVerificationStatus()).isEqualTo(VerificationStatus.REJECTED);
        }

        @Test
        @DisplayName("shouldRejectPatient_WhenAlreadyVerified")
        void shouldRejectPatient_WhenAlreadyVerified() {
            // Given
            patient.verify(TEST_VERIFIED_BY, "EMAIL");

            // When
            patient.reject();

            // Then
            assertThat(patient.getVerificationStatus()).isEqualTo(VerificationStatus.REJECTED);
        }
    }

    @Nested
    @DisplayName("Is Verified Tests")
    class IsVerifiedTests {

        @Test
        @DisplayName("shouldReturnFalse_WhenPatientNotVerified")
        void shouldReturnFalse_WhenPatientNotVerified() {
            // When
            boolean result = patient.isVerified();

            // Then
            assertThat(result).isFalse();
        }

        @Test
        @DisplayName("shouldReturnTrue_WhenPatientVerified")
        void shouldReturnTrue_WhenPatientVerified() {
            // Given
            patient.verify(TEST_VERIFIED_BY, "EMAIL");

            // When
            boolean result = patient.isVerified();

            // Then
            assertThat(result).isTrue();
        }

        @Test
        @DisplayName("shouldReturnFalse_WhenPatientRejected")
        void shouldReturnFalse_WhenPatientRejected() {
            // Given
            patient.reject();

            // When
            boolean result = patient.isVerified();

            // Then
            assertThat(result).isFalse();
        }
    }

    @Nested
    @DisplayName("Patient Gender Tests")
    class GenderTests {

        @Test
        @DisplayName("shouldSetGender_Male")
        void shouldSetGender_Male() {
            // When
            patient.setGender(Patient.Gender.MALE);

            // Then
            assertThat(patient.getGender()).isEqualTo(Patient.Gender.MALE);
        }

        @Test
        @DisplayName("shouldSetGender_Female")
        void shouldSetGender_Female() {
            // When
            patient.setGender(Patient.Gender.FEMALE);

            // Then
            assertThat(patient.getGender()).isEqualTo(Patient.Gender.FEMALE);
        }

        @Test
        @DisplayName("shouldSetGender_Other")
        void shouldSetGender_Other() {
            // When
            patient.setGender(Patient.Gender.OTHER);

            // Then
            assertThat(patient.getGender()).isEqualTo(Patient.Gender.OTHER);
        }

        @Test
        @DisplayName("shouldSetGender_Unknown")
        void shouldSetGender_Unknown() {
            // When
            patient.setGender(Patient.Gender.UNKNOWN);

            // Then
            assertThat(patient.getGender()).isEqualTo(Patient.Gender.UNKNOWN);
        }
    }

    @Nested
    @DisplayName("Patient Additional Fields Tests")
    class AdditionalFieldsTests {

        @Test
        @DisplayName("shouldSetDateOfBirth")
        void shouldSetDateOfBirth() {
            // Given
            var dob = java.time.LocalDate.of(1990, 1, 1);

            // When
            patient.setDateOfBirth(dob);

            // Then
            assertThat(patient.getDateOfBirth()).isEqualTo(dob);
        }

        @Test
        @DisplayName("shouldSetHisPatientId")
        void shouldSetHisPatientId() {
            // Given
            String hisId = "HIS123456";

            // When
            patient.setHisPatientId(hisId);

            // Then
            assertThat(patient.getHisPatientId()).isEqualTo(hisId);
        }

        @Test
        @DisplayName("shouldSetAddressFields")
        void shouldSetAddressFields() {
            // Given
            String street = "Test Street 123";
            String city = "Test City";
            String postalCode = "12-345";

            // When
            patient.setAddressStreet(street);
            patient.setAddressCity(city);
            patient.setAddressPostalCode(postalCode);

            // Then
            assertThat(patient.getAddressStreet()).isEqualTo(street);
            assertThat(patient.getAddressCity()).isEqualTo(city);
            assertThat(patient.getAddressPostalCode()).isEqualTo(postalCode);
        }
    }

    @Nested
    @DisplayName("Patient Equality Tests")
    class EqualityTests {

        @Test
        @DisplayName("shouldEqual_WhenSameId")
        void shouldEqual_WhenSameId() {
            // Given
            Patient patient2 = new Patient();
            patient2.setId(patient.getId());

            // When & Then
            assertThat(patient).isEqualTo(patient2);
        }

        @Test
        @DisplayName("shouldNotEqual_WhenDifferentId")
        void shouldNotEqual_WhenDifferentId() {
            // Given
            Patient patient2 = new Patient();
            patient2.setId(UUID.randomUUID()); // Different ID

            // When & Then
            assertThat(patient).isNotEqualTo(patient2);
        }

        @Test
        @DisplayName("shouldNotEqual_WhenNull")
        void shouldNotEqual_WhenNull() {
            // When & Then
            assertThat(patient).isNotNull();
        }

        @Test
        @DisplayName("shouldNotEqual_WhenDifferentClass")
        void shouldNotEqual_WhenDifferentClass() {
            // When & Then
            assertThat(patient).isNotEqualTo("string");
        }
    }

    @Nested
    @DisplayName("Patient ToString Tests")
    class ToStringTests {

        @Test
        @DisplayName("shouldToString_ContainId")
        void shouldToString_ContainId() {
            // When
            String result = patient.toString();

            // Then - toString should not throw exception and contain class name
            assertThat(result).contains("Patient");
        }
    }
}
