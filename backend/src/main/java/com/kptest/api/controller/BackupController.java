package com.kptest.api.controller;

import com.kptest.api.dto.BackupHistoryResponse;
import com.kptest.api.dto.BackupResponse;
import com.kptest.api.dto.RestoreBackupRequest;
import com.kptest.application.service.BackupService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;
import java.util.concurrent.CompletableFuture;

/**
 * Backup REST Controller.
 * Handles backup management operations including create, restore, and history.
 * Implements ww.68: Backup management functionality.
 */
@Slf4j
@RestController
@RequestMapping("/api/v1/admin/backup")
@RequiredArgsConstructor
@Tag(name = "Backup Management", description = "Backup management endpoints for system administrators")
public class BackupController {

    private final BackupService backupService;

    /**
     * Create a new system backup.
     * Implements ww.68: Manual backup creation.
     * 
     * @return Backup response with backup ID and status
     */
    @PostMapping("/create")
    @PreAuthorize("hasRole('ADMIN')")
    @Operation(summary = "Create backup", description = "Creates a new system backup. Implements ww.68")
    public ResponseEntity<BackupResponse> createBackup() {
        log.info("POST /api/v1/admin/backup/create - Initiating backup creation");

        try {
            CompletableFuture<BackupResponse> future = backupService.createBackup();
            BackupResponse response = future.join();
            
            log.info("Backup created successfully: {}", response.backupId());
            return ResponseEntity.ok(response);
            
        } catch (Exception e) {
            log.error("Failed to create backup", e);
            return ResponseEntity.internalServerError().build();
        }
    }

    /**
     * Get backup history.
     * Implements ww.68: View backup history.
     * 
     * @return List of backup history entries
     */
    @GetMapping("/history")
    @PreAuthorize("hasRole('ADMIN')")
    @Operation(summary = "Get backup history", description = "Returns list of all backups with their status. Implements ww.68")
    public ResponseEntity<List<BackupHistoryResponse>> getBackupHistory() {
        log.info("GET /api/v1/admin/backup/history");

        List<BackupHistoryResponse> history = backupService.getBackupHistory();

        return ResponseEntity.ok(history);
    }

    /**
     * Get backup by ID.
     * 
     * @param backupId Backup ID
     * @return Backup details
     */
    @GetMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    @Operation(summary = "Get backup by ID", description = "Returns detailed information about a specific backup")
    public ResponseEntity<BackupHistoryResponse> getBackupById(
        @Parameter(description = "Backup ID")
        @PathVariable UUID id
    ) {
        log.info("GET /api/v1/admin/backup/{}", id);

        BackupHistoryResponse backup = backupService.getBackupById(id);

        if (backup == null) {
            return ResponseEntity.notFound().build();
        }

        return ResponseEntity.ok(backup);
    }

    /**
     * Restore system from backup.
     * Implements ww.68: Restore data from backup.
     * 
     * @param backupId Backup ID to restore from
     * @param request Restore request with confirmation
     * @return Backup response with restore status
     */
    @PostMapping("/restore/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    @Operation(summary = "Restore from backup", description = "Restores system from a specific backup. Implements ww.68")
    public ResponseEntity<BackupResponse> restoreBackup(
        @Parameter(description = "Backup ID to restore from")
        @PathVariable UUID id,

        @Parameter(description = "Restore confirmation")
        @RequestBody RestoreBackupRequest request
    ) {
        log.info("POST /api/v1/admin/backup/restore/{} - confirm: {}", id, request.confirm());

        if (!request.confirm()) {
            log.warn("Backup restore attempted without confirmation: {}", id);
            return ResponseEntity.badRequest().build();
        }

        try {
            CompletableFuture<BackupResponse> future = backupService.restoreBackup(id);
            BackupResponse response = future.join();
            
            log.info("Backup restore initiated: {}", response.backupId());
            return ResponseEntity.ok(response);
            
        } catch (Exception e) {
            log.error("Failed to restore backup: {}", id, e);
            return ResponseEntity.internalServerError().build();
        }
    }

    /**
     * Delete old backup.
     * 
     * @param backupId Backup ID to delete
     * @return No content response
     */
    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    @Operation(summary = "Delete backup", description = "Deletes an old backup to free up storage space")
    public ResponseEntity<Void> deleteBackup(
        @Parameter(description = "Backup ID to delete")
        @PathVariable UUID id
    ) {
        log.info("DELETE /api/v1/admin/backup/{}", id);

        backupService.deleteBackup(id);

        return ResponseEntity.noContent().build();
    }

    /**
     * Download backup file.
     * 
     * @param backupId Backup ID to download
     * @return Backup file as download
     */
    @GetMapping("/{id}/download")
    @PreAuthorize("hasRole('ADMIN')")
    @Operation(summary = "Download backup", description = "Downloads backup file for offline storage")
    public ResponseEntity<byte[]> downloadBackup(
        @Parameter(description = "Backup ID to download")
        @PathVariable UUID id
    ) {
        log.info("GET /api/v1/admin/backup/{}/download", id);

        byte[] backupContent = backupService.downloadBackup(id);

        if (backupContent == null) {
            return ResponseEntity.notFound().build();
        }

        return ResponseEntity.ok()
            .header("Content-Disposition", "attachment; filename=\"backup_" + id + ".sql\"")
            .body(backupContent);
    }
}
