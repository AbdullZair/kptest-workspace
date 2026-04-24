package com.kptest.api.dto;

import com.fasterxml.jackson.annotation.JsonProperty;

import java.time.Instant;

/**
 * Backup response DTO.
 */
public record BackupResponse(
    @JsonProperty("backup_id")
    String backupId,

    String status,

    @JsonProperty("file_name")
    String fileName,

    @JsonProperty("file_size_mb")
    Double fileSizeMb,

    @JsonProperty("created_at")
    Instant createdAt,

    String message
) {
}
