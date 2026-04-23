package com.kptest.service;

import com.kptest.api.dto.*;
import com.kptest.application.service.PatientService;
import com.kptest.domain.patient.Patient;
import com.kptest.domain.patient.PatientRepository;
import com.kptest.domain.user.User;
import com.kptest.domain.user.UserRepository;
import com.kptest.domain.user.UserRole;
import com.kptest.domain.user.VerificationStatus;
import com.kptest.exception.ResourceNotFoundException;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Nested;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.ArgumentCaptor;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Sort;

import java.time.LocalDate;
import java.util.*;

import static org.assertj.core.api.Assertions.*;
import static org.mockito.ArgumentMatchers.*;
import static org.mockito.BDDMockito.*;

/**
 * Unit tests for PatientService.
 */
@ExtendWith(MockitoExtension.class)
@DisplayName("PatientService Unit Tests")
class PatientServiceTest {

    @Mock
    private PatientRepository patientRepository;

    @Mock
    private UserRepository userRepository;

    private PatientService patientService;

    private Patient testPatient;
    private User testUser;
    private static final UUID TEST_PATIENT_ID = UUID.randomUUID();
    private static final String TEST_PESEL = "90010112345";
    private static final String TEST_FIRST_NAME = "Jan";
    private static final String TEST_LAST_NAME = "Kowalski";
    private static final String TEST_EMAIL = "jan.kowalski@example.com";

    @BeforeEach
    void setUp() {
        patientService = new PatientService(patientRepository, userRepository);
        testUser = createTestUser();
        testPatient = createTestPatient();
    }

    private User createTestUser() {
        User user = User.create(TEST_EMAIL, "passwordHash", UserRole.PATIENT);
        user.setId(UUID.randomUUID());
        return user;
    }

    private Patient createTestPatient() {
        Patient patient = new Patient();
        patient.setId(TEST_PATIENT_ID);
        patient.setUser(testUser);
        patient.setPesel(TEST_PESEL);
        patient.setFirstName(TEST_FIRST_NAME);
        patient.setLastName(TEST_LAST_NAME);
        patient.setDateOfBirth(LocalDate.of(1990, 1, 1));
        patient.setGender(Patient.Gender.MALE);
        patient.setVerificationStatus(VerificationStatus.PENDING);
        return patient;
    }

    @Nested
    @DisplayName("Find All Patients Tests")
    class FindAllTests {

        @Test
        @DisplayName("shouldFindAllPatients_WithDefaultFilters")
        void shouldFindAllPatients_WithDefaultFilters() {
            // Given
            PatientSearchRequest filters = PatientSearchRequest.builder()
                .page(0)
                .size(20)
                .sort("name")
                .sortOrder("asc")
                .build();

            given(patientRepository.findAllWithFilters(any(), any(), any(), any(), any(), any(), any()))
                .willReturn(List.of(testPatient));
            given(patientRepository.countWithFilters(any(), any(), any(), any(), any(), any()))
                .willReturn(1L);

            // When
            PatientSearchResponse response = patientService.findAll(filters);

            // Then
            assertThat(response).isNotNull();
            assertThat(response.data()).hasSize(1);
            assertThat(response.total()).isEqualTo(1);
            assertThat(response.page()).isEqualTo(0);
            assertThat(response.size()).isEqualTo(20);
            assertThat(response.data().get(0).pesel()).isEqualTo(TEST_PESEL);

            then(patientRepository).should().findAllWithFilters(
                null, null, null, null, null, null,
                PageRequest.of(0, 20, Sort.by(Sort.Direction.ASC, "lastName"))
            );
        }

        @Test
        @DisplayName("shouldFindAllPatients_WithPeselFilter")
        void shouldFindAllPatients_WithPeselFilter() {
            // Given
            String filterPesel = "90010112345";
            PatientSearchRequest filters = PatientSearchRequest.builder()
                .pesel(filterPesel)
                .page(0)
                .size(10)
                .build();

            given(patientRepository.findAllWithFilters(any(), any(), any(), any(), any(), any(), any()))
                .willReturn(List.of(testPatient));
            given(patientRepository.countWithFilters(any(), any(), any(), any(), any(), any()))
                .willReturn(1L);

            // When
            PatientSearchResponse response = patientService.findAll(filters);

            // Then
            assertThat(response.data()).hasSize(1);
            then(patientRepository).should().findAllWithFilters(
                eq(filterPesel), any(), any(), any(), any(), any(), any()
            );
        }

        @Test
        @DisplayName("shouldReturnEmptyList_WhenNoPatientsFound")
        void shouldReturnEmptyList_WhenNoPatientsFound() {
            // Given
            PatientSearchRequest filters = PatientSearchRequest.builder()
                .pesel("99999999999")
                .build();

            given(patientRepository.findAllWithFilters(any(), any(), any(), any(), any(), any(), any()))
                .willReturn(Collections.emptyList());
            given(patientRepository.countWithFilters(any(), any(), any(), any(), any(), any()))
                .willReturn(0L);

            // When
            PatientSearchResponse response = patientService.findAll(filters);

            // Then
            assertThat(response.data()).isEmpty();
            assertThat(response.total()).isEqualTo(0);
        }
    }

    @Nested
    @DisplayName("Find Patient By ID Tests")
    class FindByIdTests {

        @Test
        @DisplayName("shouldFindPatientById_WhenPatientExists")
        void shouldFindPatientById_WhenPatientExists() {
            // Given
            given(patientRepository.findById(TEST_PATIENT_ID)).willReturn(Optional.of(testPatient));

            // When
            PatientDto result = patientService.findById(TEST_PATIENT_ID);

            // Then
            assertThat(result).isNotNull();
            assertThat(result.pesel()).isEqualTo(TEST_PESEL);
            assertThat(result.firstName()).isEqualTo(TEST_FIRST_NAME);
            assertThat(result.lastName()).isEqualTo(TEST_LAST_NAME);
        }

        @Test
        @DisplayName("shouldThrowResourceNotFoundException_WhenPatientNotFound")
        void shouldThrowResourceNotFoundException_WhenPatientNotFound() {
            // Given
            UUID nonExistentId = UUID.randomUUID();
            given(patientRepository.findById(nonExistentId)).willReturn(Optional.empty());

            // When & Then
            assertThatThrownBy(() -> patientService.findById(nonExistentId))
                .isInstanceOf(ResourceNotFoundException.class)
                .hasMessageContaining("Patient not found");
        }
    }

    @Nested
    @DisplayName("Create Patient Tests")
    class CreatePatientTests {

        @Test
        @DisplayName("shouldCreatePatient_WhenValidData")
        void shouldCreatePatient_WhenValidData() {
            // Given
            PatientDto patientDto = new PatientDto(
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

            User newUser = createTestUser();
            newUser.setEmail("anna.nowak@example.com");

            given(patientRepository.existsByPesel(patientDto.pesel())).willReturn(false);
            given(userRepository.save(any(User.class))).willReturn(newUser);
            given(patientRepository.save(any(Patient.class))).willReturn(testPatient);

            // When
            PatientDto result = patientService.create(patientDto);

            // Then
            assertThat(result).isNotNull();
            then(patientRepository).should().save(any(Patient.class));
            then(userRepository).should().save(any(User.class));
        }

        @Test
        @DisplayName("shouldThrowException_WhenPeselAlreadyExists")
        void shouldThrowException_WhenPeselAlreadyExists() {
            // Given
            PatientDto patientDto = new PatientDto(
                null,
                TEST_PESEL,
                "Duplicate",
                "Patient",
                null,
                null,
                null,
                null,
                null,
                null,
                null,
                null,
                null,
                null,
                null
            );

            given(patientRepository.existsByPesel(TEST_PESEL)).willReturn(true);

            // When & Then
            assertThatThrownBy(() -> patientService.create(patientDto))
                .isInstanceOf(IllegalArgumentException.class)
                .hasMessageContaining("already exists");
        }
    }

    @Nested
    @DisplayName("Update Patient Tests")
    class UpdatePatientTests {

        @Test
        @DisplayName("shouldUpdatePatient_WhenPatientExists")
        void shouldUpdatePatient_WhenPatientExists() {
            // Given
            PatientDto updateDto = new PatientDto(
                TEST_PATIENT_ID,
                TEST_PESEL,
                "Updated",
                "Name",
                null,
                null,
                null,
                null,
                "New Street",
                null,
                null,
                null,
                null,
                null,
                null
            );

            given(patientRepository.findById(TEST_PATIENT_ID)).willReturn(Optional.of(testPatient));
            given(patientRepository.save(any(Patient.class))).willReturn(testPatient);

            // When
            PatientDto result = patientService.update(TEST_PATIENT_ID, updateDto);

            // Then
            assertThat(result).isNotNull();
            assertThat(testPatient.getFirstName()).isEqualTo("Updated");
            assertThat(testPatient.getLastName()).isEqualTo("Name");
            assertThat(testPatient.getAddressStreet()).isEqualTo("New Street");
            then(patientRepository).should().save(testPatient);
        }

        @Test
        @DisplayName("shouldThrowResourceNotFoundException_WhenPatientNotFoundForUpdate")
        void shouldThrowResourceNotFoundException_WhenPatientNotFoundForUpdate() {
            // Given
            UUID nonExistentId = UUID.randomUUID();
            given(patientRepository.findById(nonExistentId)).willReturn(Optional.empty());

            // When & Then
            assertThatThrownBy(() -> patientService.update(nonExistentId, new PatientDto(
                null, TEST_PESEL, "First", "Last", null, null, null, null, null, null, null, null, null, null, null
            )))
            .isInstanceOf(ResourceNotFoundException.class);
        }
    }

    @Nested
    @DisplayName("Delete Patient Tests")
    class DeletePatientTests {

        @Test
        @DisplayName("shouldSoftDeletePatient_WhenPatientExists")
        void shouldSoftDeletePatient_WhenPatientExists() {
            // Given
            given(patientRepository.findById(TEST_PATIENT_ID)).willReturn(Optional.of(testPatient));
            willDoNothing().given(patientRepository).delete(testPatient);

            // When
            patientService.delete(TEST_PATIENT_ID);

            // Then
            then(patientRepository).should().delete(testPatient);
            assertThat(testUser.getDeletedAt()).isNotNull();
        }

        @Test
        @DisplayName("shouldThrowResourceNotFoundException_WhenPatientNotFoundForDelete")
        void shouldThrowResourceNotFoundException_WhenPatientNotFoundForDelete() {
            // Given
            UUID nonExistentId = UUID.randomUUID();
            given(patientRepository.findById(nonExistentId)).willReturn(Optional.empty());

            // When & Then
            assertThatThrownBy(() -> patientService.delete(nonExistentId))
                .isInstanceOf(ResourceNotFoundException.class);
        }
    }

    @Nested
    @DisplayName("Verify With HIS Tests")
    class VerifyWithHISTests {

        @Test
        @DisplayName("shouldVerifyPatient_WhenValidPesel")
        void shouldVerifyPatient_WhenValidPesel() {
            // Given
            String validPesel = "90010112345";
            String cartNumber = "CART123";

            // When
            PatientVerifyResponse response = patientService.verifyWithHIS(validPesel, cartNumber);

            // Then
            assertThat(response).isNotNull();
            assertThat(response.verified()).isTrue();
            assertThat(response.pesel()).isEqualTo(validPesel);
            assertThat(response.message()).contains("verified successfully");
        }

        @Test
        @DisplayName("shouldReturnError_WhenInvalidPeselFormat")
        void shouldReturnError_WhenInvalidPeselFormat() {
            // Given
            String invalidPesel = "123"; // Too short
            String cartNumber = "CART123";

            // When
            PatientVerifyResponse response = patientService.verifyWithHIS(invalidPesel, cartNumber);

            // Then
            assertThat(response.verified()).isFalse();
            assertThat(response.message()).contains("Invalid PESEL");
        }

        @Test
        @DisplayName("shouldReturnSuccess_WhenPatientExistsInDatabase")
        void shouldReturnSuccess_WhenPatientExistsInDatabase() {
            // Given
            given(patientRepository.findByPesel(TEST_PESEL)).willReturn(Optional.of(testPatient));

            // When
            PatientVerifyResponse response = patientService.verifyWithHIS(TEST_PESEL, "CART123");

            // Then
            assertThat(response.verified()).isTrue();
            assertThat(response.firstName()).isEqualTo(TEST_FIRST_NAME);
            assertThat(response.lastName()).isEqualTo(TEST_LAST_NAME);
        }
    }

    @Nested
    @DisplayName("Search Patients Tests")
    class SearchPatientsTests {

        @Test
        @DisplayName("shouldSearchPatients_WhenQueryProvided")
        void shouldSearchPatients_WhenQueryProvided() {
            // Given
            String query = "Kowalski";
            given(patientRepository.search(query)).willReturn(List.of(testPatient));

            // When
            List<PatientDto> results = patientService.search(query);

            // Then
            assertThat(results).hasSize(1);
            assertThat(results.get(0).lastName()).isEqualTo(TEST_LAST_NAME);
            then(patientRepository).should().search(query);
        }

        @Test
        @DisplayName("shouldReturnEmptyList_WhenQueryIsNull")
        void shouldReturnEmptyList_WhenQueryIsNull() {
            // When
            List<PatientDto> results = patientService.search(null);

            // Then
            assertThat(results).isEmpty();
        }

        @Test
        @DisplayName("shouldReturnEmptyList_WhenQueryIsEmpty")
        void shouldReturnEmptyList_WhenQueryIsEmpty() {
            // When
            List<PatientDto> results = patientService.search("   ");

            // Then
            assertThat(results).isEmpty();
        }

        @Test
        @DisplayName("shouldReturnEmptyList_WhenNoResultsFound")
        void shouldReturnEmptyList_WhenNoResultsFound() {
            // Given
            String query = "NonExistent";
            given(patientRepository.search(query)).willReturn(Collections.emptyList());

            // When
            List<PatientDto> results = patientService.search(query);

            // Then
            assertThat(results).isEmpty();
        }
    }

    @Nested
    @DisplayName("Find By PESEL Tests")
    class FindByPeselTests {

        @Test
        @DisplayName("shouldFindPatientByPesel_WhenPatientExists")
        void shouldFindPatientByPesel_WhenPatientExists() {
            // Given
            given(patientRepository.findByPesel(TEST_PESEL)).willReturn(Optional.of(testPatient));

            // When
            Optional<PatientDto> result = patientService.findByPesel(TEST_PESEL);

            // Then
            assertThat(result).isPresent();
            assertThat(result.get().pesel()).isEqualTo(TEST_PESEL);
        }

        @Test
        @DisplayName("shouldReturnEmpty_WhenPatientNotFoundByPesel")
        void shouldReturnEmpty_WhenPatientNotFoundByPesel() {
            // Given
            given(patientRepository.findByPesel(TEST_PESEL)).willReturn(Optional.empty());

            // When
            Optional<PatientDto> result = patientService.findByPesel(TEST_PESEL);

            // Then
            assertThat(result).isEmpty();
        }
    }
}
