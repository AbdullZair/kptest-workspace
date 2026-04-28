package com.kptest.api.controller;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.kptest.api.dto.CreateDataProcessingActivityRequest;
import com.kptest.api.dto.DataProcessingActivityDto;
import com.kptest.api.dto.UpdateDataProcessingActivityRequest;
import com.kptest.domain.audit.DataProcessingActivity;
import com.kptest.domain.audit.repository.DataProcessingActivityRepository;
import com.kptest.support.WebMvcMockBeansConfig;
import com.kptest.support.WebMvcTestConfig;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.autoconfigure.ImportAutoConfiguration;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.context.annotation.Import;
import org.springframework.test.context.ContextConfiguration;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.PageRequest;
import org.springframework.http.MediaType;
import org.springframework.security.test.context.support.WithMockUser;
import org.springframework.test.web.servlet.MockMvc;

import java.time.Instant;
import java.util.List;
import java.util.UUID;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.BDDMockito.given;
import static org.mockito.BDDMockito.willDoNothing;
import static org.springframework.security.test.web.servlet.request.SecurityMockMvcRequestPostProcessors.csrf;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

/**
 * Controller tests for DataProcessingController.
 */
@WebMvcTest(DataProcessingController.class)
@ContextConfiguration(classes = WebMvcTestConfig.class)
@Import(WebMvcMockBeansConfig.class)
@org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc(addFilters = false)
@DisplayName("DataProcessingController")
class DataProcessingControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ObjectMapper objectMapper;

    @MockBean
    private DataProcessingActivityRepository dataProcessingActivityRepository;

    private DataProcessingActivity testActivity;
    private UUID testId;

    @BeforeEach
    void setUp() {
        testId = UUID.randomUUID();
        testActivity = DataProcessingActivity.create(
            "Test Processing Activity",
            "Testing data processing for compliance",
            DataProcessingActivity.LegalBasis.CONSENT,
            UUID.randomUUID()
        );
        testActivity.setId(testId);
        testActivity.setCreatedAt(Instant.now());
        testActivity.setUpdatedAt(Instant.now());
    }

    @Test
    @DisplayName("should get all data processing activities")
    @WithMockUser(roles = "ADMIN")
    void shouldGetAllDataProcessingActivities() throws Exception {
        // given
        Page<DataProcessingActivity> page = new PageImpl<>(List.of(testActivity));
        given(dataProcessingActivityRepository.findAll(any(PageRequest.class))).willReturn(page);

        // when & then
        mockMvc.perform(get("/api/v1/admin/data-processing-activities"))
            .andExpect(status().isOk())
            .andExpect(jsonPath("$.content").isArray())
            .andExpect(jsonPath("$.content[0].name").value("Test Processing Activity"));
    }

    @Test
    @DisplayName("should get data processing activity by ID")
    @WithMockUser(roles = "ADMIN")
    void shouldGetDataProcessingActivityById() throws Exception {
        // given
        given(dataProcessingActivityRepository.findById(testId)).willReturn(java.util.Optional.of(testActivity));

        // when & then
        mockMvc.perform(get("/api/v1/admin/data-processing-activities/{id}", testId))
            .andExpect(status().isOk())
            .andExpect(jsonPath("$.name").value("Test Processing Activity"))
            .andExpect(jsonPath("$.legalBasis").value("CONSENT"));
    }

    @Test
    @DisplayName("should create data processing activity")
    @WithMockUser(roles = "ADMIN")
    void shouldCreateDataProcessingActivity() throws Exception {
        // given
        CreateDataProcessingActivityRequest request = new CreateDataProcessingActivityRequest(
            "New Activity",
            "Purpose for new activity",
            DataProcessingActivity.LegalBasis.CONTRACT,
            List.of("patients"),
            List.of("internal"),
            "5 years",
            "Security measures",
            "Controller",
            "Processor"
        );

        DataProcessingActivity saved = DataProcessingActivity.create(
            request.name(),
            request.purpose(),
            request.legalBasis(),
            UUID.randomUUID()
        );
        saved.setId(testId);

        given(dataProcessingActivityRepository.save(any())).willReturn(saved);

        // when & then
        mockMvc.perform(post("/api/v1/admin/data-processing-activities")
                .with(csrf())
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(request)))
            .andExpect(status().isCreated())
            .andExpect(header().exists("Location"))
            .andExpect(jsonPath("$.name").value("New Activity"));
    }

    @Test
    @DisplayName("should update data processing activity")
    @WithMockUser(roles = "ADMIN")
    void shouldUpdateDataProcessingActivity() throws Exception {
        // given
        UpdateDataProcessingActivityRequest request = new UpdateDataProcessingActivityRequest(
            "Updated Name",
            null,
            null,
            null,
            null,
            "10 years",
            null,
            null,
            null
        );

        given(dataProcessingActivityRepository.findById(testId)).willReturn(java.util.Optional.of(testActivity));
        given(dataProcessingActivityRepository.save(any())).willReturn(testActivity);

        // when & then
        mockMvc.perform(put("/api/v1/admin/data-processing-activities/{id}", testId)
                .with(csrf())
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(request)))
            .andExpect(status().isOk())
            .andExpect(jsonPath("$.name").value("Updated Name"));
    }

    @Test
    @DisplayName("should delete data processing activity")
    @WithMockUser(roles = "ADMIN")
    void shouldDeleteDataProcessingActivity() throws Exception {
        // given
        given(dataProcessingActivityRepository.existsById(testId)).willReturn(true);
        willDoNothing().given(dataProcessingActivityRepository).deleteById(testId);

        // when & then
        mockMvc.perform(delete("/api/v1/admin/data-processing-activities/{id}", testId)
                .with(csrf()))
            .andExpect(status().isNoContent());
    }
}
