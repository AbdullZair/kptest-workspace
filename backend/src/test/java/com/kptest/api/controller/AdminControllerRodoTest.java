package com.kptest.api.controller;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.kptest.api.dto.AnonymizationResponse;
import com.kptest.api.dto.PatientDataExportDto;
import com.kptest.application.service.AdminService;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.setup.MockMvcBuilders;

import java.time.Instant;
import java.util.UUID;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.*;
import static org.springframework.security.test.web.servlet.request.SecurityMockMvcRequestPostProcessors.user;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

/**
 * Unit tests for AdminController RODO endpoints (US-A-10 and US-A-11).
 */
@ExtendWith(MockitoExtension.class)
@DisplayName("AdminController RODO Tests - US-A-10 Anonymize & US-A-11 Export")
class AdminControllerRodoTest {

    @Mock
    private AdminService adminService;

    private MockMvc mockMvc;
    private ObjectMapper objectMapper;

    @BeforeEach
    void setUp() {
        AdminController adminController = new AdminController(adminService);
        mockMvc = MockMvcBuilders.standaloneSetup(adminController).build();
        objectMapper = new ObjectMapper();
    }

    // ==================== US-A-10: Anonymize Patient Tests ====================

    @Test
    @DisplayName("US-A-10: Should anonymize patient successfully")
    void shouldAnonymizePatientSuccessfully() throws Exception {
        // Given
        UUID patientId = UUID.randomUUID();
        UUID auditLogId = UUID.randomUUID();
        Instant anonymizedAt = Instant.now();

        AnonymizationResponse response = AnonymizationResponse.of(patientId, anonymizedAt, auditLogId);
        when(adminService.anonymizePatient(eq(patientId), any(UUID.class))).thenReturn(response);

        // When & Then
        mockMvc.perform(post("/api/v1/admin/patients/{id}/anonymize", patientId)
                .with(user("admin").roles("ADMIN"))
                .contentType(MediaType.APPLICATION_JSON))
            .andExpect(status().isOk())
            .andExpect(content().contentType(MediaType.APPLICATION_JSON))
            .andExpect(jsonPath("$.patient_id").value(patientId.toString()))
            .andExpect(jsonPath("$.audit_log_id").value(auditLogId.toString()));

        verify(adminService).anonymizePatient(eq(patientId), any(UUID.class));
    }

    @Test
    @DisplayName("US-A-10: Should return 403 for non-admin user")
    void shouldReturn403ForNonAdminUser() throws Exception {
        // Given
        UUID patientId = UUID.randomUUID();

        // When & Then
        mockMvc.perform(post("/api/v1/admin/patients/{id}/anonymize", patientId)
                .with(user("user").roles("USER"))
                .contentType(MediaType.APPLICATION_JSON))
            .andExpect(status().isForbidden());

        verify(adminService, never()).anonymizePatient(any(), any());
    }

    @Test
    @DisplayName("US-A-10: Should return 404 for non-existent patient")
    void shouldReturn404ForNonExistentPatient() throws Exception {
        // Given
        UUID patientId = UUID.randomUUID();
        when(adminService.anonymizePatient(eq(patientId), any(UUID.class)))
            .thenThrow(new com.kptest.exception.ResourceNotFoundException("Patient not found"));

        // When & Then
        mockMvc.perform(post("/api/v1/admin/patients/{id}/anonymize", patientId)
                .with(user("admin").roles("ADMIN"))
                .contentType(MediaType.APPLICATION_JSON))
            .andExpect(status().isNotFound());
    }

    // ==================== US-A-11: Export Patient Data Tests ====================

    @Test
    @DisplayName("US-A-11: Should export patient data as JSON successfully")
    void shouldExportPatientDataAsJsonSuccessfully() throws Exception {
        // Given
        UUID patientId = UUID.randomUUID();
        byte[] jsonData = "{\"patient_id\":\"" + patientId + "\",\"patient_data\":{}}".getBytes();

        ResponseEntity<byte[]> responseEntity = ResponseEntity.ok()
            .contentType(MediaType.APPLICATION_JSON)
            .body(jsonData);

        when(adminService.exportPatientData(eq(patientId), eq("json"))).thenReturn(responseEntity);

        // When & Then
        mockMvc.perform(get("/api/v1/admin/patients/{id}/export-data", patientId)
                .with(user("admin").roles("ADMIN"))
                .param("format", "json"))
            .andExpect(status().isOk())
            .andExpect(content().contentType(MediaType.APPLICATION_JSON))
            .andExpect(header().string("Content-Disposition", org.mockito.ArgumentMatchers.contains("attachment")));

        verify(adminService).exportPatientData(eq(patientId), eq("json"));
    }

    @Test
    @DisplayName("US-A-11: Should export patient data as PDF successfully")
    void shouldExportPatientDataAsPdfSuccessfully() throws Exception {
        // Given
        UUID patientId = UUID.randomUUID();
        byte[] pdfData = "PATIENT DATA EXPORT".getBytes();

        ResponseEntity<byte[]> responseEntity = ResponseEntity.ok()
            .contentType(MediaType.parseMediaType("application/pdf"))
            .body(pdfData);

        when(adminService.exportPatientData(eq(patientId), eq("pdf"))).thenReturn(responseEntity);

        // When & Then
        mockMvc.perform(get("/api/v1/admin/patients/{id}/export-data", patientId)
                .with(user("admin").roles("ADMIN"))
                .param("format", "pdf"))
            .andExpect(status().isOk())
            .andExpect(content().contentType("application/pdf"))
            .andExpect(header().string("Content-Disposition", org.mockito.ArgumentMatchers.contains("attachment")));

        verify(adminService).exportPatientData(eq(patientId), eq("pdf"));
    }

    @Test
    @DisplayName("US-A-11: Should default to JSON format when not specified")
    void shouldDefaultToJsonFormatWhenNotSpecified() throws Exception {
        // Given
        UUID patientId = UUID.randomUUID();
        byte[] jsonData = "{\"patient_id\":\"" + patientId + "\"}".getBytes();

        ResponseEntity<byte[]> responseEntity = ResponseEntity.ok()
            .contentType(MediaType.APPLICATION_JSON)
            .body(jsonData);

        when(adminService.exportPatientData(eq(patientId), eq("json"))).thenReturn(responseEntity);

        // When & Then
        mockMvc.perform(get("/api/v1/admin/patients/{id}/export-data", patientId)
                .with(user("admin").roles("ADMIN")))
            .andExpect(status().isOk())
            .andExpect(content().contentType(MediaType.APPLICATION_JSON));

        verify(adminService).exportPatientData(eq(patientId), eq("json"));
    }

    @Test
    @DisplayName("US-A-11: Should return 403 for non-admin user")
    void shouldReturn403ForNonAdminUserOnExport() throws Exception {
        // Given
        UUID patientId = UUID.randomUUID();

        // When & Then
        mockMvc.perform(get("/api/v1/admin/patients/{id}/export-data", patientId)
                .with(user("user").roles("USER")))
            .andExpect(status().isForbidden());

        verify(adminService, never()).exportPatientData(any(), any());
    }

    @Test
    @DisplayName("US-A-11: Should return 404 for non-existent patient")
    void shouldReturn404ForNonExistentPatientOnExport() throws Exception {
        // Given
        UUID patientId = UUID.randomUUID();
        when(adminService.exportPatientData(eq(patientId), any()))
            .thenThrow(new com.kptest.exception.ResourceNotFoundException("Patient not found"));

        // When & Then
        mockMvc.perform(get("/api/v1/admin/patients/{id}/export-data", patientId)
                .with(user("admin").roles("ADMIN"))
                .param("format", "json"))
            .andExpect(status().isNotFound());
    }
}
