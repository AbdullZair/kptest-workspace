package com.kptest.service;

import com.kptest.AbstractIntegrationTest;
import com.kptest.api.dto.PatientDto;
import com.kptest.application.service.PatientService;
import com.kptest.domain.patient.Patient;
import com.kptest.domain.user.User;
import com.kptest.domain.user.UserRole;
import com.kptest.domain.user.VerificationStatus;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Nested;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.test.context.jdbc.Sql;
import org.springframework.test.web.servlet.MockMvc;

import java.time.LocalDate;
import java.util.List;
import java.util.UUID;

import static org.assertj.core.api.Assertions.*;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

/**
 * Integration tests for PatientService using TestContainers.
 * These tests run against a real PostgreSQL database and Redis instance.
 */
@AutoConfigureMockMvc
class PatientServiceIntegrationTest extends AbstractIntegrationTest {

    @Autowired
    private PatientService patientService;

    @Autowired
    private MockMvc mockMvc;

    private Patient testPatient;
    private User testUser;
    private static final String TEST_PESEL = "90010112345";
    private static final String TEST_FIRST_NAME = "Jan";
    private static final String TEST_LAST_NAME = "Kowalski";
    private static final String TEST_EMAIL = "jan.kowalski@example.com";

    @BeforeEach
    void setUp() {
        testUser = createTestUser();
        testPatient = createTestPatient(testUser);
    }

    private User createTestUser() {
        User user = User.create(TEST_EMAIL, "passwordHash", UserRole.PATIENT);
        return user;
    }

    private Patient createTestPatient(User user) {
        Patient patient = Patient.create(
            user,
            TEST_PESEL,
            TEST_FIRST_NAME,
            TEST_LAST_NAME
        );
        patient.setDateOfBirth(LocalDate.of(1990, 1, 1));
        patient.setGender(Patient.Gender.MALE);
        patient.setVerificationStatus(VerificationStatus.APPROVED);
        return patient;
    }

    @Nested
    @DisplayName("Create Patient Integration Tests")
    class CreatePatientIntegrationTests {

        @Test
        @DisplayName("shouldCreatePatient_WhenValidData")
        void shouldCreatePatient_WhenValidData() {
            // given
            PatientDto request = new PatientDto(
                null,
                "92050512345",
                "Anna",
                "Nowak",
                LocalDate.of(1992, 5, 5),
                Patient.Gender.FEMALE,
                "anna.nowak@example.com",
                "+48123456789",
                "ul. Testowa 1",
                "Warszawa",
                "00-001",
                null,
                null,
                null,
                null
            );

            // when
            PatientDto result = patientService.create(request);

            // then
            assertThat(result).isNotNull();
            assertThat(result.id()).isNotNull();
            assertThat(result.firstName()).isEqualTo("Anna");
            assertThat(result.lastName()).isEqualTo("Nowak");
            assertThat(result.pesel()).isEqualTo("92050512345");
        }

        @Test
        @DisplayName("shouldThrowException_WhenPeselAlreadyExists")
        void shouldThrowException_WhenPeselAlreadyExists() {
            // given
            PatientDto firstPatient = new PatientDto(
                null,
                TEST_PESEL,
                "First",
                "Patient",
                LocalDate.of(1990, 1, 1),
                Patient.Gender.MALE,
                "first@example.com",
                "+48123456789",
                null,
                null,
                null,
                null,
                null,
                null,
                null
            );
            patientService.create(firstPatient);

            PatientDto duplicatePatient = new PatientDto(
                null,
                TEST_PESEL,
                "Duplicate",
                "Patient",
                LocalDate.of(1995, 1, 1),
                Patient.Gender.FEMALE,
                "duplicate@example.com",
                "+48987654321",
                null,
                null,
                null,
                null,
                null,
                null,
                null
            );

            // when & then
            assertThatThrownBy(() -> patientService.create(duplicatePatient))
                .isInstanceOf(IllegalArgumentException.class)
                .hasMessageContaining("already exists");
        }
    }

    @Nested
    @DisplayName("Find Patient Integration Tests")
    class FindPatientIntegrationTests {

        @Test
        @DisplayName("shouldFindPatientById_WhenPatientExists")
        void shouldFindPatientById_WhenPatientExists() {
            // given
            PatientDto created = patientService.create(new PatientDto(
                null,
                "91010112345",
                "Test",
                "Patient",
                LocalDate.of(1991, 1, 1),
                Patient.Gender.MALE,
                "test@example.com",
                "+48123456789",
                null,
                null,
                null,
                null,
                null,
                null,
                null
            ));

            // when
            PatientDto found = patientService.findById(created.id());

            // then
            assertThat(found).isNotNull();
            assertThat(found.id()).isEqualTo(created.id());
            assertThat(found.pesel()).isEqualTo("91010112345");
        }

        @Test
        @DisplayName("shouldFindAllPatients_WithDefaultFilters")
        void shouldFindAllPatients_WithDefaultFilters() {
            // given - create multiple patients
            patientService.create(new PatientDto(
                null,
                "93010112345",
                "Patient",
                "One",
                LocalDate.of(1993, 1, 1),
                Patient.Gender.MALE,
                "one@example.com",
                "+48123456789",
                null,
                null,
                null,
                null,
                null,
                null,
                null
            ));
            patientService.create(new PatientDto(
                null,
                "94010112345",
                "Patient",
                "Two",
                LocalDate.of(1994, 1, 1),
                Patient.Gender.FEMALE,
                "two@example.com",
                "+48123456789",
                null,
                null,
                null,
                null,
                null,
                null,
                null
            ));

            // when
            var filters = com.kptest.api.dto.PatientSearchRequest.builder()
                .page(0)
                .size(20)
                .sort("name")
                .sortOrder("asc")
                .build();
            var response = patientService.findAll(filters);

            // then
            assertThat(response.data()).hasSizeGreaterThanOrEqualTo(2);
            assertThat(response.total()).isGreaterThanOrEqualTo(2);
        }
    }

    @Nested
    @DisplayName("Update Patient Integration Tests")
    class UpdatePatientIntegrationTests {

        @Test
        @DisplayName("shouldUpdatePatient_WhenPatientExists")
        void shouldUpdatePatient_WhenPatientExists() {
            // given
            PatientDto created = patientService.create(new PatientDto(
                null,
                "95010112345",
                "Original",
                "Name",
                LocalDate.of(1995, 1, 1),
                Patient.Gender.MALE,
                "original@example.com",
                "+48123456789",
                "Original Street",
                "Original City",
                "00-001",
                null,
                null,
                null,
                null
            ));

            PatientDto updateRequest = new PatientDto(
                created.id(),
                created.pesel(),
                "Updated",
                "Name",
                null,
                null,
                null,
                null,
                "Updated Street",
                null,
                null,
                null,
                null,
                null,
                null
            );

            // when
            PatientDto updated = patientService.update(created.id(), updateRequest);

            // then
            assertThat(updated).isNotNull();
            assertThat(updated.firstName()).isEqualTo("Updated");
            assertThat(updated.lastName()).isEqualTo("Name");
            assertThat(updated.addressStreet()).isEqualTo("Updated Street");
        }
    }

    @Nested
    @DisplayName("Delete Patient Integration Tests")
    class DeletePatientIntegrationTests {

        @Test
        @DisplayName("shouldSoftDeletePatient_WhenPatientExists")
        void shouldSoftDeletePatient_WhenPatientExists() {
            // given
            PatientDto created = patientService.create(new PatientDto(
                null,
                "96010112345",
                "To",
                "Delete",
                LocalDate.of(1996, 1, 1),
                Patient.Gender.MALE,
                "todelete@example.com",
                "+48123456789",
                null,
                null,
                null,
                null,
                null,
                null,
                null
            ));

            // when
            patientService.delete(created.id());

            // then
            assertThatThrownBy(() -> patientService.findById(created.id()))
                .isInstanceOf(com.kptest.exception.ResourceNotFoundException.class);
        }
    }

    @Nested
    @DisplayName("Search Patient Integration Tests")
    class SearchPatientIntegrationTests {

        @Test
        @DisplayName("shouldSearchPatients_WhenQueryProvided")
        void shouldSearchPatients_WhenQueryProvided() {
            // given
            patientService.create(new PatientDto(
                null,
                "97010112345",
                "Searchable",
                "Patient",
                LocalDate.of(1997, 1, 1),
                Patient.Gender.MALE,
                "searchable@example.com",
                "+48123456789",
                null,
                null,
                null,
                null,
                null,
                null,
                null
            ));

            // when
            List<PatientDto> results = patientService.search("Searchable");

            // then
            assertThat(results).isNotEmpty();
            assertThat(results.get(0).firstName()).isEqualTo("Searchable");
        }

        @Test
        @DisplayName("shouldReturnEmptyList_WhenNoResultsFound")
        void shouldReturnEmptyList_WhenNoResultsFound() {
            // when
            List<PatientDto> results = patientService.search("NonExistentPatient");

            // then
            assertThat(results).isEmpty();
        }
    }

    @Nested
    @DisplayName("Verify With HIS Integration Tests")
    class VerifyWithHISIntegrationTests {

        @Test
        @DisplayName("shouldVerifyPatient_WhenValidPesel")
        void shouldVerifyPatient_WhenValidPesel() {
            // given
            String validPesel = "90010112345";
            String cartNumber = "CART123";

            // when
            var response = patientService.verifyWithHIS(validPesel, cartNumber);

            // then
            assertThat(response).isNotNull();
            assertThat(response.verified()).isTrue();
            assertThat(response.pesel()).isEqualTo(validPesel);
        }

        @Test
        @DisplayName("shouldReturnError_WhenInvalidPeselFormat")
        void shouldReturnError_WhenInvalidPeselFormat() {
            // given
            String invalidPesel = "123";
            String cartNumber = "CART123";

            // when
            var response = patientService.verifyWithHIS(invalidPesel, cartNumber);

            // then
            assertThat(response.verified()).isFalse();
            assertThat(response.message()).contains("Invalid PESEL");
        }
    }
}
