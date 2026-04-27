package com.kptest.api.controller;

import com.kptest.api.dto.BackupHistoryResponse;
import com.kptest.api.dto.BackupResponse;
import com.kptest.api.dto.RestoreBackupRequest;
import com.kptest.application.service.BackupService;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.http.ResponseEntity;

import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;
import java.util.concurrent.CompletableFuture;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

/**
 * Unit tests for BackupController.
 */
@ExtendWith(MockitoExtension.class)
@DisplayName("BackupController Tests")
class BackupControllerTest {

    @Mock
    private BackupService backupService;

    private BackupController backupController;

    @BeforeEach
    void setUp() {
        backupController = new BackupController(backupService);
    }

    @Test
    @DisplayName("Should create backup successfully")
    void shouldCreateBackupSuccessfully() {
        // Given
        BackupResponse response = new BackupResponse(
            UUID.randomUUID().toString(),
            "COMPLETED",
            "backup_test.sql",
            50.0,
            java.time.Instant.now(),
            "Backup created successfully"
        );
        when(backupService.createBackup()).thenReturn(CompletableFuture.completedFuture(response));

        // When
        ResponseEntity<BackupResponse> result = backupController.createBackup();

        // Then
        assertNotNull(result);
        assertEquals(200, result.getStatusCodeValue());
        assertNotNull(result.getBody());
        assertEquals("COMPLETED", result.getBody().status());
    }

    @Test
    @DisplayName("Should handle backup creation failure")
    void shouldHandleBackupCreationFailure() {
        // Given
        when(backupService.createBackup()).thenThrow(new RuntimeException("Backup failed"));

        // When
        ResponseEntity<BackupResponse> result = backupController.createBackup();

        // Then
        assertNotNull(result);
        assertEquals(500, result.getStatusCodeValue());
    }

    @Test
    @DisplayName("Should get backup history")
    void shouldGetBackupHistory() {
        // Given
        List<BackupHistoryResponse> history = List.of(
            new BackupHistoryResponse(
                UUID.randomUUID().toString(),
                LocalDateTime.now(),
                "admin",
                1024,
                "COMPLETED",
                "15.0",
                "Test backup",
                true,
                true
            )
        );
        when(backupService.getBackupHistory()).thenReturn(history);

        // When
        ResponseEntity<List<BackupHistoryResponse>> result = backupController.getBackupHistory();

        // Then
        assertNotNull(result);
        assertEquals(200, result.getStatusCodeValue());
        assertEquals(1, result.getBody().size());
    }

    @Test
    @DisplayName("Should get backup by ID")
    void shouldGetBackupById() {
        // Given
        UUID backupId = UUID.randomUUID();
        BackupHistoryResponse response = new BackupHistoryResponse(
            backupId.toString(),
            LocalDateTime.now(),
            "admin",
            1024,
            "COMPLETED",
            "15.0",
            "Test backup",
            true,
            true
        );
        when(backupService.getBackupById(backupId)).thenReturn(response);

        // When
        ResponseEntity<BackupHistoryResponse> result = backupController.getBackupById(backupId);

        // Then
        assertNotNull(result);
        assertEquals(200, result.getStatusCodeValue());
        assertEquals(backupId.toString(), result.getBody().backupId());
    }

    @Test
    @DisplayName("Should return not found for unknown backup ID")
    void shouldReturnNotFoundForUnknownBackupId() {
        // Given
        UUID backupId = UUID.randomUUID();
        when(backupService.getBackupById(backupId)).thenReturn(null);

        // When
        ResponseEntity<BackupHistoryResponse> result = backupController.getBackupById(backupId);

        // Then
        assertNotNull(result);
        assertEquals(404, result.getStatusCodeValue());
    }

    @Test
    @DisplayName("Should restore backup with confirmation")
    void shouldRestoreBackupWithConfirmation() {
        // Given
        UUID backupId = UUID.randomUUID();
        RestoreBackupRequest request = new RestoreBackupRequest(true, "Test restore");
        BackupResponse response = new BackupResponse(
            backupId.toString(),
            "COMPLETED",
            "backup_restore.sql",
            50.0,
            java.time.Instant.now(),
            "Restore completed successfully"
        );
        when(backupService.restoreBackup(backupId)).thenReturn(CompletableFuture.completedFuture(response));

        // When
        ResponseEntity<BackupResponse> result = backupController.restoreBackup(backupId, request);

        // Then
        assertNotNull(result);
        assertEquals(200, result.getStatusCodeValue());
        assertEquals("COMPLETED", result.getBody().status());
    }

    @Test
    @DisplayName("Should reject restore without confirmation")
    void shouldRejectRestoreWithoutConfirmation() {
        // Given
        UUID backupId = UUID.randomUUID();
        RestoreBackupRequest request = new RestoreBackupRequest(false, "");

        // When
        ResponseEntity<BackupResponse> result = backupController.restoreBackup(backupId, request);

        // Then
        assertNotNull(result);
        assertEquals(400, result.getStatusCodeValue());
    }

    @Test
    @DisplayName("Should handle restore failure")
    void shouldHandleRestoreFailure() {
        // Given
        UUID backupId = UUID.randomUUID();
        RestoreBackupRequest request = new RestoreBackupRequest(true, "Test restore");
        when(backupService.restoreBackup(backupId)).thenThrow(new RuntimeException("Restore failed"));

        // When
        ResponseEntity<BackupResponse> result = backupController.restoreBackup(backupId, request);

        // Then
        assertNotNull(result);
        assertEquals(500, result.getStatusCodeValue());
    }

    @Test
    @DisplayName("Should delete backup")
    void shouldDeleteBackup() {
        // Given
        UUID backupId = UUID.randomUUID();
        doNothing().when(backupService).deleteBackup(backupId);

        // When
        ResponseEntity<Void> result = backupController.deleteBackup(backupId);

        // Then
        assertNotNull(result);
        assertEquals(204, result.getStatusCodeValue());
    }

    @Test
    @DisplayName("Should download backup")
    void shouldDownloadBackup() {
        // Given
        UUID backupId = UUID.randomUUID();
        byte[] content = "backup content".getBytes();
        when(backupService.downloadBackup(backupId)).thenReturn(content);

        // When
        ResponseEntity<byte[]> result = backupController.downloadBackup(backupId);

        // Then
        assertNotNull(result);
        assertEquals(200, result.getStatusCodeValue());
        assertArrayEquals(content, result.getBody());
    }

    @Test
    @DisplayName("Should return not found for unknown backup download")
    void shouldReturnNotFoundForUnknownBackupDownload() {
        // Given
        UUID backupId = UUID.randomUUID();
        when(backupService.downloadBackup(backupId)).thenReturn(null);

        // When
        ResponseEntity<byte[]> result = backupController.downloadBackup(backupId);

        // Then
        assertNotNull(result);
        assertEquals(404, result.getStatusCodeValue());
    }
}
