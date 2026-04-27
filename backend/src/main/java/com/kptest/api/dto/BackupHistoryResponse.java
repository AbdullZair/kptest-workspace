package com.kptest.api.dto;

import java.time.LocalDateTime;

/**
 * Backup history response DTO.
 */
public record BackupHistoryResponse(
    String backupId,
    LocalDateTime createdAt,
    String createdBy,
    long sizeBytes,
    String status,
    String databaseVersion,
    String notes,
    boolean isDownloadable,
    boolean isRestorable
) {
}
