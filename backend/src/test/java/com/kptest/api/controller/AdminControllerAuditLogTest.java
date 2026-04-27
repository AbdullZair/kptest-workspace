package com.kptest.api.controller;

import com.kptest.api.dto.AuditLogFilters;
import com.kptest.api.dto.AuditLogResponse;
import com.kptest.api.dto.ExportLogsRequest;
import com.kptest.application.service.AdminService;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.core.io.ByteArrayResource;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageImpl;
import org.springframework.http.ResponseEntity;

import java.util.List;
import java.util.UUID;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.*;

/**
 * Unit tests for AdminController audit log endpoints.
 */
@ExtendWith(MockitoExtension.class)
@DisplayName("AdminController Audit Log Tests")
class AdminControllerAuditLogTest {

    @Mock
    private AdminService adminService;

    private AdminController adminController;

    @BeforeEach
    void setUp() {
        adminController = new AdminController(adminService);
    }

    @Test
    @DisplayName("Should get audit logs with filters")
    void shouldGetAuditLogsWithFilters() {
        // Given
        AuditLogResponse log1 = createMockAuditLog("Action 1");
        AuditLogResponse log2 = createMockAuditLog("Action 2");
        Page<AuditLogResponse> page = new PageImpl<>(List.of(log1, log2));
        
        when(adminService.getAuditLogs(any(AuditLogFilters.class))).thenReturn(page);

        // When
        ResponseEntity<AdminController.PageResponse<AuditLogResponse>> result = 
            adminController.getAuditLogs("user123", "LOGIN", "USER", "entity123", 
                "2026-01-01", "2026-04-24", 0, 20);

        // Then
        assertNotNull(result);
        assertEquals(200, result.getStatusCodeValue());
        assertEquals(2, result.getBody().content().size());
    }

    @Test
    @DisplayName("Should get audit log by ID")
    void shouldGetAuditLogById() {
        // Given
        UUID logId = UUID.randomUUID();
        AuditLogResponse log = createMockAuditLogWithId(logId.toString());
        Page<AuditLogResponse> page = new PageImpl<>(List.of(log));
        
        when(adminService.getAuditLogs(any(AuditLogFilters.class))).thenReturn(page);

        // When
        ResponseEntity<AuditLogResponse> result = adminController.getAuditLogById(logId);

        // Then
        assertNotNull(result);
        assertEquals(200, result.getStatusCodeValue());
        assertEquals(logId.toString(), result.getBody().logId());
    }

    @Test
    @DisplayName("Should return not found for unknown audit log ID")
    void shouldReturnNotFoundForUnknownAuditLogId() {
        // Given
        UUID logId = UUID.randomUUID();
        Page<AuditLogResponse> page = new PageImpl<>(List.of());
        
        when(adminService.getAuditLogs(any(AuditLogFilters.class))).thenReturn(page);

        // When
        ResponseEntity<AuditLogResponse> result = adminController.getAuditLogById(logId);

        // Then
        assertNotNull(result);
        assertEquals(404, result.getStatusCodeValue());
    }

    @Test
    @DisplayName("Should export audit logs")
    void shouldExportAuditLogs() {
        // Given
        ByteArrayResource resource = new ByteArrayResource("exported data".getBytes());
        ExportLogsRequest request = new ExportLogsRequest("csv", null);
        
        when(adminService.exportAuditLogs(any(AuditLogFilters.class), eq("csv"))).thenReturn(resource);

        // When
        ResponseEntity<ByteArrayResource> result = adminController.exportAuditLogs(request);

        // Then
        assertNotNull(result);
        assertEquals(200, result.getStatusCodeValue());
        assertNotNull(result.getBody());
    }

    @Test
    @DisplayName("Should export audit logs as JSON")
    void shouldExportAuditLogsAsJson() {
        // Given
        ByteArrayResource resource = new ByteArrayResource("{}".getBytes());
        ExportLogsRequest request = new ExportLogsRequest("json", null);
        
        when(adminService.exportAuditLogs(any(AuditLogFilters.class), eq("json"))).thenReturn(resource);

        // When
        ResponseEntity<ByteArrayResource> result = adminController.exportAuditLogs(request);

        // Then
        assertNotNull(result);
        assertEquals(200, result.getStatusCodeValue());
    }

    private AuditLogResponse createMockAuditLog(String action) {
        return new AuditLogResponse(
            UUID.randomUUID().toString(),
            "user123",
            action,
            "USER",
            "entity123",
            "{}",
            "{}",
            "192.168.1.1",
            "Mozilla/5.0",
            java.time.Instant.now()
        );
    }

    private AuditLogResponse createMockAuditLogWithId(String id) {
        return new AuditLogResponse(
            id,
            "user123",
            "LOGIN",
            "USER",
            "entity123",
            "{}",
            "{}",
            "192.168.1.1",
            "Mozilla/5.0",
            java.time.Instant.now()
        );
    }
}
