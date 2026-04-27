package com.kptest.application.service;

import com.kptest.api.dto.BackupHistoryResponse;
import com.kptest.api.dto.BackupResponse;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;

import java.util.List;
import java.util.UUID;
import java.util.concurrent.CompletableFuture;
import java.util.concurrent.ExecutionException;

import static org.junit.jupiter.api.Assertions.*;

/**
 * Unit tests for BackupService.
 * Tests backup management functionality (ww.68).
 */
@DisplayName("BackupService Tests")
class BackupServiceTest {

    private BackupService backupService;

    @BeforeEach
    void setUp() {
        backupService = new BackupService();
    }

    @Test
    @DisplayName("Should create backup successfully")
    void shouldCreateBackupSuccessfully() throws ExecutionException, InterruptedException {
        // When
        CompletableFuture<BackupResponse> future = backupService.createBackup();
        BackupResponse response = future.get();

        // Then
        assertNotNull(response);
        assertNotNull(response.backupId());
        assertEquals("COMPLETED", response.status());
        assertTrue(response.message().contains("successfully"));
    }

    @Test
    @DisplayName("Should return backup history")
    void shouldGetBackupHistory() {
        // When
        List<BackupHistoryResponse> history = backupService.getBackupHistory();

        // Then
        assertNotNull(history);
        assertFalse(history.isEmpty());
        
        BackupHistoryResponse first = history.get(0);
        assertNotNull(first.backupId());
        assertNotNull(first.createdAt());
        assertNotNull(first.status());
        assertTrue(first.sizeBytes() > 0);
    }

    @Test
    @DisplayName("Should get backup by ID")
    void shouldGetBackupById() {
        // Given
        UUID backupId = UUID.randomUUID();

        // When
        BackupHistoryResponse backup = backupService.getBackupById(backupId);

        // Then
        assertNotNull(backup);
        assertNotNull(backup.backupId());
        assertEquals("COMPLETED", backup.status());
        assertTrue(backup.isDownloadable());
        assertTrue(backup.isRestorable());
    }

    @Test
    @DisplayName("Should restore backup successfully")
    void shouldRestoreBackupSuccessfully() throws ExecutionException, InterruptedException {
        // Given
        UUID backupId = UUID.randomUUID();

        // When
        CompletableFuture<BackupResponse> future = backupService.restoreBackup(backupId);
        BackupResponse response = future.get();

        // Then
        assertNotNull(response);
        assertEquals("COMPLETED", response.status());
        assertTrue(response.message().contains("successfully"));
    }

    @Test
    @DisplayName("Should delete backup without error")
    void shouldDeleteBackupWithoutError() {
        // Given
        UUID backupId = UUID.randomUUID();

        // When/Then - should not throw
        assertDoesNotThrow(() -> backupService.deleteBackup(backupId));
    }

    @Test
    @DisplayName("Should download backup content")
    void shouldDownloadBackup() {
        // Given
        UUID backupId = UUID.randomUUID();

        // When
        byte[] content = backupService.downloadBackup(backupId);

        // Then
        assertNotNull(content);
        assertTrue(content.length > 0);
        String contentStr = new String(content);
        assertTrue(contentStr.contains("KPTEST Backup"));
    }

    @Test
    @DisplayName("Should return storage usage")
    void shouldGetStorageUsage() {
        // When
        long usage = backupService.getStorageUsage();

        // Then
        assertTrue(usage > 0);
    }

    @Test
    @DisplayName("Should cleanup old backups without error")
    void shouldCleanupOldBackupsWithoutError() {
        // When/Then - should not throw
        assertDoesNotThrow(() -> backupService.cleanupOldBackups());
    }

    @Test
    @DisplayName("Should schedule daily backup without error")
    void shouldScheduleDailyBackupWithoutError() {
        // When/Then - should not throw
        assertDoesNotThrow(() -> backupService.scheduleDailyBackup());
    }

    @Test
    @DisplayName("Backup response should have correct fields")
    void shouldHaveCorrectFieldsInResponse() throws ExecutionException, InterruptedException {
        // When
        CompletableFuture<BackupResponse> future = backupService.createBackup();
        BackupResponse response = future.get();

        // Then
        assertNotNull(response.backupId());
        assertNotNull(response.status());
        assertNotNull(response.message());
        assertNotNull(response.createdAt());
    }

    @Test
    @DisplayName("Backup history should contain size information")
    void shouldHaveSizeInfoInHistory() {
        // When
        List<BackupHistoryResponse> history = backupService.getBackupHistory();

        // Then
        for (BackupHistoryResponse backup : history) {
            assertTrue(backup.sizeBytes() > 0, "Backup size should be positive");
            assertNotNull(backup.createdAt());
            assertNotNull(backup.status());
        }
    }

    @Test
    @DisplayName("Backup should be marked as downloadable and restorable")
    void shouldMarkBackupAsDownloadableAndRestorable() {
        // Given
        UUID backupId = UUID.randomUUID();

        // When
        BackupHistoryResponse backup = backupService.getBackupById(backupId);

        // Then
        assertTrue(backup.isDownloadable());
        assertTrue(backup.isRestorable());
    }
}
