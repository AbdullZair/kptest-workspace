package com.kptest.api.dto;

/**
 * Restore backup request DTO.
 */
public record RestoreBackupRequest(
    boolean confirm,
    String notes
) {
}
