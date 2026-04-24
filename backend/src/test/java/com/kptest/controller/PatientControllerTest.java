package com.kptest.controller;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.kptest.api.controller.PatientController;
import com.kptest.api.dto.*;
import com.kptest.application.service.PatientService;
import com.kptest.domain.patient.Patient;
import com.kptest.domain.user.VerificationStatus;
import com.kptest.exception.ResourceNotFoundException;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Nested;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.boot.autoconfigure.ImportAutoConfiguration;
import org.springframework.http.MediaType;
import org.springframework.security.test.context.support.WithMockUser;
import org.springframework.test.web.servlet.MockMvc;

import java.time.LocalDate;
import java.util.List;
import java.util.Map;
import java.util.UUID;

import static org.mockito.ArgumentMatchers.*;
import static org.mockito.BDDMockito.*;
import static org.springframework.security.test.web.servlet.request.SecurityMockMvcRequestPostProcessors.csrf;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

/**
 * Integration tests for PatientController.
 */
@WebMvcTest(
    controllers = PatientController.class,
    excludeAutoConfiguration = {
        org.springframework.boot.autoconfigure.security.servlet.SecurityAutoConfiguration.class,
        org.springframework.boot.autoconfigure.security.servlet.SecurityFilterAutoConfiguration.class,
        org.springframework.boot.autoconfigure.security.servlet.UserDetailsServiceAutoConfiguration.class,
        org.springframework.boot.autoconfigure.data.jpa.JpaRepositoriesAutoConfiguration.class,
        org.springframework.boot.autoconfigure.orm.jpa.HibernateJpaAutoConfiguration.class
    }
)
@ImportAutoConfiguration(exclude = {
    com.kptest.infrastructure.config.JpaConfig.class
})
@DisplayName("PatientController Integration Tests")
class PatientControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ObjectMapper objectMapper;

    @MockBean
    private PatientService patientService;

    @MockBean
    private com.kptest.infrastructure.security.JwtService jwtService;

    @MockBean
    private com.kptest.infrastructure.security.JwtAuthenticationFilter jwtAuthenticationFilter;

    private PatientDto testPatientDto;
    private UUID testPatientId;

    @BeforeEach
    void setUp() {
        testPatientId = UUID.randomUUID();
        testPatientDto = new PatientDto(
            testPatientId,
            "90010112345",
            "Jan",
            "Kowalski",
            LocalDate.of(1990, 1, 1),
            Patient.Gender.MALE,
            "jan.kowalski@example.com",
            "+48123456789",
            "ul. Testowa 1",
            "Warszawa",
            "00-001",
            "HIS-123",
            VerificationStatus.APPROVED,
            null,
            null
        );
    }

    @Nested
    @DisplayName("GET /api/v1/patients")
    class GetPatientsTests {

        @Test
        @WithMockUser(roles = {"DOCTOR"})
        @DisplayName("shouldReturnPatients_WithDefaultParameters")
        void shouldReturnPatients_WithDefaultParameters() throws Exception {
            // Given
            PatientSearchResponse response = PatientSearchResponse.fromPage(
                List.of(testPatientDto),
                1L,
                0,
                20
            );

            given(patientService.findAll(any(PatientSearchRequest.class))).willReturn(response);

            // When & Then
            mockMvc.perform(get("/api/v1/patients"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.data").isArray())
                .andExpect(jsonPath("$.data[0].pesel").value("90010112345"))
                .andExpect(jsonPath("$.total").value(1));
        }

        @Test
        @WithMockUser(roles = {"NURSE"})
        @DisplayName("shouldReturnPatients_WithFilters")
        void shouldReturnPatients_WithFilters() throws Exception {
            // Given
            PatientSearchResponse response = PatientSearchResponse.fromPage(
                List.of(testPatientDto),
                1L,
                0,
                10
            );

            given(patientService.findAll(any(PatientSearchRequest.class))).willReturn(response);

            // When & Then
            mockMvc.perform(get("/api/v1/patients")
                    .param("pesel", "90010112345")
                    .param("page", "0")
                    .param("size", "10")
                    .param("sort", "name")
                    .param("sort_order", "asc"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.data").isArray())
                .andExpect(jsonPath("$.page").value(0))
                .andExpect(jsonPath("$.size").value(10));
        }

        @Test
        @WithMockUser(roles = {"RECEPTIONIST"})
        @DisplayName("shouldReturnEmptyList_WhenNoPatientsFound")
        void shouldReturnEmptyList_WhenNoPatientsFound() throws Exception {
            // Given
            PatientSearchResponse response = PatientSearchResponse.fromPage(
                List.of(),
                0L,
                0,
                20
            );

            given(patientService.findAll(any(PatientSearchRequest.class))).willReturn(response);

            // When & Then
            mockMvc.perform(get("/api/v1/patients")
                    .param("pesel", "99999999999"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.data").isArray())
                .andExpect(jsonPath("$.data").isEmpty())
                .andExpect(jsonPath("$.total").value(0));
        }
    }

    @Nested
    @DisplayName("GET /api/v1/patients/{id}")
    class GetPatientByIdTests {

        @Test
        @WithMockUser(roles = {"DOCTOR"})
        @DisplayName("shouldReturnPatient_WhenPatientExists")
        void shouldReturnPatient_WhenPatientExists() throws Exception {
            // Given
            given(patientService.findById(testPatientId)).willReturn(testPatientDto);

            // When & Then
            mockMvc.perform(get("/api/v1/patients/{id}", testPatientId))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.pesel").value("90010112345"))
                .andExpect(jsonPath("$.first_name").value("Jan"))
                .andExpect(jsonPath("$.last_name").value("Kowalski"));
        }

        @Test
        @WithMockUser(roles = {"ADMIN"})
        @DisplayName("shouldReturnNotFound_WhenPatientDoesNotExist")
        void shouldReturnNotFound_WhenPatientDoesNotExist() throws Exception {
            // Given
            UUID nonExistentId = UUID.randomUUID();
            given(patientService.findById(nonExistentId))
                .willThrow(new ResourceNotFoundException("Patient not found"));

            // When & Then
            mockMvc.perform(get("/api/v1/patients/{id}", nonExistentId))
                .andExpect(status().isNotFound());
        }
    }

    @Nested
    @DisplayName("POST /api/v1/patients")
    class CreatePatientTests {

        @Test
        @WithMockUser(roles = {"RECEPTIONIST"})
        @DisplayName("shouldCreatePatient_WhenValidData")
        void shouldCreatePatient_WhenValidData() throws Exception {
            // Given
            PatientDto createdPatient = new PatientDto(
                testPatientId,
                "92050512345",
                "Anna",
                "Nowak",
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

            given(patientService.create(any(PatientDto.class))).willReturn(createdPatient);

            // When & Then
            mockMvc.perform(post("/api/v1/patients")
                    .with(csrf())
                    .contentType(MediaType.APPLICATION_JSON)
                    .content(objectMapper.writeValueAsString(Map.of(
                        "pesel", "92050512345",
                        "first_name", "Anna",
                        "last_name", "Nowak"
                    ))))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.pesel").value("92050512345"))
                .andExpect(jsonPath("$.first_name").value("Anna"));
        }

        @Test
        @WithMockUser(roles = {"DOCTOR"})
        @DisplayName("shouldReturnBadRequest_WhenInvalidData")
        void shouldReturnBadRequest_WhenInvalidData() throws Exception {
            // When & Then
            mockMvc.perform(post("/api/v1/patients")
                    .with(csrf())
                    .contentType(MediaType.APPLICATION_JSON)
                    .content(objectMapper.writeValueAsString(Map.of(
                        "pesel", "123", // Invalid PESEL
                        "first_name", "",
                        "last_name", ""
                    ))))
                .andExpect(status().isBadRequest());
        }
    }

    @Nested
    @DisplayName("PUT /api/v1/patients/{id}")
    class UpdatePatientTests {

        @Test
        @WithMockUser(roles = {"DOCTOR"})
        @DisplayName("shouldUpdatePatient_WhenPatientExists")
        void shouldUpdatePatient_WhenPatientExists() throws Exception {
            // Given
            PatientDto updatedPatient = new PatientDto(
                testPatientId,
                "90010112345",
                "Jan Updated",
                "Kowalski Updated",
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

            given(patientService.update(eq(testPatientId), any(PatientDto.class)))
                .willReturn(updatedPatient);

            // When & Then
            mockMvc.perform(put("/api/v1/patients/{id}", testPatientId)
                    .with(csrf())
                    .contentType(MediaType.APPLICATION_JSON)
                    .content(objectMapper.writeValueAsString(Map.of(
                        "first_name", "Jan Updated",
                        "last_name", "Kowalski Updated"
                    ))))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.first_name").value("Jan Updated"))
                .andExpect(jsonPath("$.last_name").value("Kowalski Updated"));
        }

        @Test
        @WithMockUser(roles = {"ADMIN"})
        @DisplayName("shouldReturnNotFound_WhenPatientDoesNotExist")
        void shouldReturnNotFound_WhenPatientDoesNotExist() throws Exception {
            // Given
            UUID nonExistentId = UUID.randomUUID();
            given(patientService.update(eq(nonExistentId), any(PatientDto.class)))
                .willThrow(new ResourceNotFoundException("Patient not found"));

            // When & Then
            mockMvc.perform(put("/api/v1/patients/{id}", nonExistentId)
                    .with(csrf())
                    .contentType(MediaType.APPLICATION_JSON)
                    .content(objectMapper.writeValueAsString(Map.of(
                        "first_name", "Test"
                    ))))
                .andExpect(status().isNotFound());
        }
    }

    @Nested
    @DisplayName("DELETE /api/v1/patients/{id}")
    class DeletePatientTests {

        @Test
        @WithMockUser(roles = {"ADMIN"})
        @DisplayName("shouldDeletePatient_WhenPatientExists")
        void shouldDeletePatient_WhenPatientExists() throws Exception {
            // Given
            willDoNothing().given(patientService).delete(testPatientId);

            // When & Then
            mockMvc.perform(delete("/api/v1/patients/{id}", testPatientId)
                    .with(csrf()))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.message").value("Patient deleted successfully"))
                .andExpect(jsonPath("$.id").value(testPatientId.toString()));
        }

        @Test
        @WithMockUser(roles = {"DOCTOR"})
        @DisplayName("shouldReturnForbidden_WhenUserIsNotAdmin")
        void shouldReturnForbidden_WhenUserIsNotAdmin() throws Exception {
            // When & Then
            mockMvc.perform(delete("/api/v1/patients/{id}", testPatientId)
                    .with(csrf()))
                .andExpect(status().isForbidden());
        }
    }

    @Nested
    @DisplayName("POST /api/v1/patients/verify")
    class VerifyPatientTests {

        @Test
        @WithMockUser(roles = {"DOCTOR"})
        @DisplayName("shouldVerifyPatient_WhenValidPesel")
        void shouldVerifyPatient_WhenValidPesel() throws Exception {
            // Given
            PatientVerifyResponse response = PatientVerifyResponse.success(
                "HIS-123",
                "90010112345",
                "Jan",
                "Kowalski",
                "1990-01-01"
            );

            given(patientService.verifyWithHIS(anyString(), anyString())).willReturn(response);

            // When & Then
            mockMvc.perform(post("/api/v1/patients/verify")
                    .with(csrf())
                    .contentType(MediaType.APPLICATION_JSON)
                    .content(objectMapper.writeValueAsString(Map.of(
                        "pesel", "90010112345",
                        "cart_number", "CART123"
                    ))))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.verified").value(true))
                .andExpect(jsonPath("$.his_patient_id").value("HIS-123"));
        }

        @Test
        @WithMockUser(roles = {"NURSE"})
        @DisplayName("shouldReturnNotFound_WhenPatientNotInHIS")
        void shouldReturnNotFound_WhenPatientNotInHIS() throws Exception {
            // Given
            PatientVerifyResponse response = PatientVerifyResponse.notFound("99999999999");

            given(patientService.verifyWithHIS(anyString(), anyString())).willReturn(response);

            // When & Then
            mockMvc.perform(post("/api/v1/patients/verify")
                    .with(csrf())
                    .contentType(MediaType.APPLICATION_JSON)
                    .content(objectMapper.writeValueAsString(Map.of(
                        "pesel", "99999999999",
                        "cart_number", "CART123"
                    ))))
                .andExpect(status().isNotFound())
                .andExpect(jsonPath("$.verified").value(false));
        }

        @Test
        @WithMockUser(roles = {"RECEPTIONIST"})
        @DisplayName("shouldReturnBadRequest_WhenInvalidPesel")
        void shouldReturnBadRequest_WhenInvalidPesel() throws Exception {
            // When & Then
            mockMvc.perform(post("/api/v1/patients/verify")
                    .with(csrf())
                    .contentType(MediaType.APPLICATION_JSON)
                    .content(objectMapper.writeValueAsString(Map.of(
                        "pesel", "123", // Invalid PESEL
                        "cart_number", "CART123"
                    ))))
                .andExpect(status().isBadRequest());
        }
    }

    @Nested
    @DisplayName("GET /api/v1/patients/search")
    class SearchPatientsTests {

        @Test
        @WithMockUser(roles = {"DOCTOR"})
        @DisplayName("shouldReturnSearchResults_WhenQueryProvided")
        void shouldReturnSearchResults_WhenQueryProvided() throws Exception {
            // Given
            List<PatientDto> results = List.of(testPatientDto);
            given(patientService.search("Kowalski")).willReturn(results);

            // When & Then
            mockMvc.perform(get("/api/v1/patients/search")
                    .param("query", "Kowalski"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$").isArray())
                .andExpect(jsonPath("$[0].last_name").value("Kowalski"));
        }

        @Test
        @WithMockUser(roles = {"NURSE"})
        @DisplayName("shouldReturnEmptyList_WhenNoResultsFound")
        void shouldReturnEmptyList_WhenNoResultsFound() throws Exception {
            // Given
            given(patientService.search("NonExistent")).willReturn(List.of());

            // When & Then
            mockMvc.perform(get("/api/v1/patients/search")
                    .param("query", "NonExistent"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$").isArray())
                .andExpect(jsonPath("$").isEmpty());
        }
    }
}
