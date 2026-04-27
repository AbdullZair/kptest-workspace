package com.kptest.application.service;

import com.kptest.api.dto.BackupHistoryResponse;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;

import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

import static org.junit.jupiter.api.Assertions.*;

/**
 * Additional unit tests for BackupService edge cases.
 */
@DisplayName("BackupService Additional Tests")
class BackupServiceAdditionalTest {

    private BackupService backupService;

    @BeforeEach
    void setUp() {
        backupService = new BackupService();
    }

    @Test
    @DisplayName("Backup history should have database version")
    void shouldHaveDatabaseVersionInHistory() {
        // When
        List<BackupHistoryResponse> history = backupService.getBackupHistory();

        // Then
        assertFalse(history.isEmpty());
        for (BackupHistoryResponse backup : history) {
            assertNotNull(backup.databaseVersion());
            assertFalse(backup.databaseVersion().isBlank());
        }
    }

    @Test
    @DisplayName("Backup history should have creator information")
    void shouldHaveCreatorInHistory() {
        // When
        List<BackupHistoryResponse> history = backupService.getBackupHistory();

        // Then
        assertFalse(history.isEmpty());
        for (BackupHistoryResponse backup : history) {
            assertNotNull(backup.createdBy());
        }
    }

    @Test
    @DisplayName("Backup history should have notes")
    void shouldHaveNotesInHistory() {
        // When
        List<BackupHistoryResponse> history = backupService.getBackupHistory();

        // Then
        assertFalse(history.isEmpty());
        for (BackupHistoryResponse backup : history) {
            assertNotNull(backup.notes());
        }
    }

    @Test
    @DisplayName("Storage usage should be reasonable value")
    void shouldHaveReasonableStorageUsage() {
        // When
        long usage = backupService.getStorageUsage();

        // Then
        assertTrue(usage > 0);
        assertTrue(usage < 1024L * 1024 * 1024 * 100); // Less than 100 GB
    }

    @Test
    @DisplayName("Backup ID should be valid UUID format")
    void shouldHaveValidUuidFormat() {
        // When
        List<BackupHistoryResponse> history = backupService.getBackupHistory();

        // Then
        for (BackupHistoryResponse backup : history) {
            assertDoesNotThrow(() -> UUID.fromString(backup.backupId()));
        }
    }

    @Test
    @DisplayName("Backup creation timestamp should be in the past")
    void shouldHavePastTimestamp() {
        // When
        List<BackupHistoryResponse> history = backupService.getBackupHistory();
        LocalDateTime now = LocalDateTime.now();

        // Then
        for (BackupHistoryResponse backup : history) {
            assertTrue(backup.createdAt().isBefore(now) || backup.createdAt().isEqual(now));
        }
    }

    @Test
    @DisplayName("Backup status should be valid value")
    void shouldHaveValidStatus() {
        // When
        List<BackupHistoryResponse> history = backupService.getBackupHistory();

        // Then
        List<String> validStatuses = List.of("COMPLETED", "FAILED", "IN_PROGRESS", "PENDING");
        for (BackupHistoryResponse backup : history) {
            assertTrue(validStatuses.contains(backup.status()));
        }
    }

    @Test
    @DisplayName("Delete backup should not throw for any UUID")
    void shouldNotThrowForAnyUuidOnDelete() {
        // Given
        UUID[] uuids = new UUID[] {
            UUID.randomUUID(),
            UUID.fromString("00000000-0000-0000-0000-000000000000"),
            UUID.fromString("ffffffff-ffff-ffff-ffff-ffffffffffff")
        };

        // When/Then
        for (UUID uuid : uuids) {
            assertDoesNotThrow(() -> backupService.deleteBackup(uuid));
        }
    }

    @Test
    @DisplayName("Download backup should return non-null for any UUID")
    void shouldReturnNonNullForAnyUuidOnDownload() {
        // Given
        UUID backupId = UUID.randomUUID();

        // When
        byte[] content = backupService.downloadBackup(backupId);

        // Then
        assertNotNull(content);
    }

    @Test
    @DisplayName("Cleanup should process without error multiple times")
    void shouldCleanupMultipleTimes() {
        // When/Then
        assertDoesNotThrow(() -> {
            backupService.cleanupOldBackups();
            backupService.cleanupOldBackups();
            backupService.cleanupOldBackups();
        });
    }
}
