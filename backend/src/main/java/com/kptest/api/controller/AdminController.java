package com.kptest.api.controller;

import com.kptest.api.dto.*;
import com.kptest.application.service.AdminService;
import com.kptest.application.service.PatientService;
import com.kptest.infrastructure.scheduler.EventReminderScheduler;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.core.io.ByteArrayResource;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

import java.util.Map;
import java.util.UUID;
import java.util.concurrent.CompletableFuture;

/**
 * Admin REST Controller.
 * Handles all admin panel operations including user management, audit logs, and system operations.
 */
@Slf4j
@RestController
@RequestMapping("/api/v1/admin")
@RequiredArgsConstructor
@Tag(name = "Admin", description = "Admin panel endpoints for user management, audit logs, and system operations")
public class AdminController {

    private final AdminService adminService;
    private final PatientService patientService;
    private final EventReminderScheduler eventReminderScheduler;

    // ==================== USER MANAGEMENT ====================

    /**
     * Get all users with optional filters.
     */
    @GetMapping("/users")
    @PreAuthorize("hasRole('ADMIN')")
    @Operation(summary = "Get all users", description = "Returns a paginated list of all users with optional filters")
    public ResponseEntity<PageResponse<UserAdminDto>> getAllUsers(
        @Parameter(description = "Filter by role")
        @RequestParam(required = false) String role,

        @Parameter(description = "Filter by status")
        @RequestParam(required = false) String status,

        @Parameter(description = "Search by email or phone")
        @RequestParam(required = false) String search,

        @Parameter(description = "Page number")
        @RequestParam(defaultValue = "0") int page,

        @Parameter(description = "Page size")
        @RequestParam(defaultValue = "20") int size
    ) {
        log.info("GET /api/v1/admin/users - role: {}, status: {}, search: {}, page: {}, size: {}", 
            role, status, search, page, size);

        UserFilters filters = new UserFilters(role, status, search, null, null, page, size);
        var userPage = adminService.getAllUsers(filters);

        return ResponseEntity.ok(new PageResponse<>(
            userPage.getContent(),
            userPage.getNumber(),
            userPage.getSize(),
            userPage.getTotalElements(),
            userPage.getTotalPages(),
            userPage.isFirst(),
            userPage.isLast()
        ));
    }

    /**
     * Create a new staff user (US-A-01).
     * Body: email, password, firstName, lastName, phone (optional), role.
     * Hashes the password and creates a Staff entity for staff roles.
     */
    @PostMapping("/users")
    @PreAuthorize("hasRole('ADMIN')")
    @Operation(summary = "Create staff user",
        description = "US-A-01: Creates a new staff user account (ADMIN/DOCTOR/COORDINATOR/NURSE/THERAPIST) with hashed password and Staff profile.")
    public ResponseEntity<UserAdminDto> createStaff(
        @Valid @RequestBody CreateStaffRequest request
    ) {
        log.info("POST /api/v1/admin/users - email: {}, role: {}", request.email(), request.role());

        UserAdminDto created = adminService.createStaff(
            request.email(),
            request.password(),
            request.firstName(),
            request.lastName(),
            request.phone(),
            request.role()
        );

        return ResponseEntity.status(org.springframework.http.HttpStatus.CREATED).body(created);
    }

    /**
     * Get user by ID.
     */
    @GetMapping("/users/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    @Operation(summary = "Get user by ID", description = "Returns detailed information about a specific user")
    public ResponseEntity<UserAdminDto> getUserById(
        @Parameter(description = "User ID")
        @PathVariable UUID id
    ) {
        log.info("GET /api/v1/admin/users/{}", id);

        UserAdminDto user = adminService.getUserById(id);

        return ResponseEntity.ok(user);
    }

    /**
     * Update user role.
     */
    @PutMapping("/users/{id}/role")
    @PreAuthorize("hasRole('ADMIN')")
    @Operation(summary = "Update user role", description = "Changes the role of a specific user")
    public ResponseEntity<UserAdminDto> updateUserRole(
        @Parameter(description = "User ID")
        @PathVariable UUID id,

        @Parameter(description = "New role")
        @Valid @RequestBody UpdateUserRoleRequest request
    ) {
        log.info("PUT /api/v1/admin/users/{}/role - newRole: {}", id, request.newRole());

        UserAdminDto user = adminService.updateUserRole(id, request.newRole());

        return ResponseEntity.ok(user);
    }

    /**
     * Update user status.
     */
    @PutMapping("/users/{id}/status")
    @PreAuthorize("hasRole('ADMIN')")
    @Operation(summary = "Update user status", description = "Changes the status of a specific user")
    public ResponseEntity<UserAdminDto> updateUserStatus(
        @Parameter(description = "User ID")
        @PathVariable UUID id,

        @Parameter(description = "New status")
        @Valid @RequestBody UpdateUserStatusRequest request
    ) {
        log.info("PUT /api/v1/admin/users/{}/status - newStatus: {}", id, request.newStatus());

        UserAdminDto user = adminService.updateUserStatus(id, request.newStatus());

        return ResponseEntity.ok(user);
    }

    /**
     * Reset user password.
     */
    @PutMapping("/users/{id}/reset-password")
    @PreAuthorize("hasRole('ADMIN')")
    @Operation(summary = "Reset user password", description = "Resets the password for a specific user and generates a temporary password")
    public ResponseEntity<ResetPasswordResponse> resetPassword(
        @Parameter(description = "User ID")
        @PathVariable UUID id
    ) {
        log.info("PUT /api/v1/admin/users/{}/reset-password", id);

        ResetPasswordResponse response = adminService.resetPassword(id);

        return ResponseEntity.ok(response);
    }

    /**
     * Delete user.
     */
    @DeleteMapping("/users/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    @Operation(summary = "Delete user", description = "Soft deletes a specific user")
    public ResponseEntity<Void> deleteUser(
        @Parameter(description = "User ID")
        @PathVariable UUID id
    ) {
        log.info("DELETE /api/v1/admin/users/{}", id);

        adminService.deleteUser(id);

        return ResponseEntity.noContent().build();
    }

    /**
     * Force password reset for a user.
     */
    @PostMapping("/users/{id}/force-password-reset")
    @PreAuthorize("hasRole('ADMIN')")
    @Operation(summary = "Force password reset", description = "Forces a password reset for a staff user, invalidates all sessions")
    public ResponseEntity<ResetPasswordResponse> forcePasswordReset(
        @Parameter(description = "User ID")
        @PathVariable UUID id,

        @Parameter(description = "Reset request with reason")
        @Valid @RequestBody ForcePasswordResetRequest request
    ) {
        log.info("POST /api/v1/admin/users/{}/force-password-reset", id);

        ResetPasswordResponse response = adminService.forcePasswordReset(id, request.reason());

        return ResponseEntity.ok(response);
    }

    /**
     * Clear 2FA configuration for a user.
     */
    @PostMapping("/users/{id}/clear-2fa")
    @PreAuthorize("hasRole('ADMIN')")
    @Operation(summary = "Clear 2FA configuration", description = "Clears 2FA secret and backup codes for a user")
    public ResponseEntity<Clear2faResponse> clear2fa(
        @Parameter(description = "User ID")
        @PathVariable UUID id,

        @Parameter(description = "Clear request with reason")
        @RequestParam("reason") String reason,
        @RequestParam("temporaryPassword") String temporaryPassword
    ) {
        log.info("POST /api/v1/admin/users/{}/clear-2fa - reason: {}", id, reason);

        Clear2faResponse response = adminService.clear2fa(id, reason);

        return ResponseEntity.ok(response);
    }

    /**
     * Generate one-time activation code for a patient.
     */
    @PostMapping("/patients/{id}/generate-activation-code")
    @PreAuthorize("hasRole('ADMIN')")
    @Operation(summary = "Generate activation code", description = "Generates an 8-character activation code valid for 72 hours")
    public ResponseEntity<ActivationCodeResponse> generateActivationCode(
        @Parameter(description = "Patient ID")
        @PathVariable UUID id
    ) {
        log.info("POST /api/v1/admin/patients/{}/generate-activation-code", id);

        ActivationCodeResponse response = adminService.generateActivationCode(id);

        return ResponseEntity.ok(response);
    }

    // ==================== AUDIT LOGS ====================

    /**
     * Get audit logs with filters.
     */
    @GetMapping("/audit-logs")
    @PreAuthorize("hasRole('ADMIN')")
    @Operation(summary = "Get audit logs", description = "Returns a paginated list of audit logs with optional filters")
    public ResponseEntity<PageResponse<AuditLogResponse>> getAuditLogs(
        @Parameter(description = "Filter by user ID")
        @RequestParam(required = false) String userId,

        @Parameter(description = "Filter by action")
        @RequestParam(required = false) String action,

        @Parameter(description = "Filter by entity type")
        @RequestParam(required = false) String entityType,

        @Parameter(description = "Filter by entity ID")
        @RequestParam(required = false) String entityId,

        @Parameter(description = "Filter by date from")
        @RequestParam(required = false) String dateFrom,

        @Parameter(description = "Filter by date to")
        @RequestParam(required = false) String dateTo,

        @Parameter(description = "Page number")
        @RequestParam(defaultValue = "0") int page,

        @Parameter(description = "Page size")
        @RequestParam(defaultValue = "20") int size
    ) {
        log.info("GET /api/v1/admin/audit-logs - userId: {}, action: {}, entityType: {}, page: {}, size: {}", 
            userId, action, entityType, page, size);

        AuditLogFilters filters = new AuditLogFilters(userId, action, entityType, entityId, dateFrom, dateTo, page, size);
        var logPage = adminService.getAuditLogs(filters);

        return ResponseEntity.ok(new PageResponse<>(
            logPage.getContent(),
            logPage.getNumber(),
            logPage.getSize(),
            logPage.getTotalElements(),
            logPage.getTotalPages(),
            logPage.isFirst(),
            logPage.isLast()
        ));
    }

    /**
     * Get audit log by ID.
     */
    @GetMapping("/audit-logs/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    @Operation(summary = "Get audit log by ID", description = "Returns detailed information about a specific audit log")
    public ResponseEntity<AuditLogResponse> getAuditLogById(
        @Parameter(description = "Audit log ID")
        @PathVariable UUID id
    ) {
        log.info("GET /api/v1/admin/audit-logs/{}", id);

        // Get all logs and find the one with matching ID (simplified approach)
        AuditLogFilters filters = new AuditLogFilters(null, null, null, null, null, null, 0, 1000);
        var logPage = adminService.getAuditLogs(filters);
        
        var foundLog = logPage.getContent().stream()
            .filter(log -> log.logId().equals(id.toString()))
            .findFirst();

        return foundLog.map(ResponseEntity::ok)
            .orElseGet(() -> ResponseEntity.notFound().build());
    }

    /**
     * Export audit logs.
     */
    @PostMapping("/audit-logs/export")
    @PreAuthorize("hasRole('ADMIN')")
    @Operation(summary = "Export audit logs", description = "Exports audit logs to CSV or JSON format")
    public ResponseEntity<ByteArrayResource> exportAuditLogs(
        @Parameter(description = "Export request")
        @Valid @RequestBody ExportLogsRequest request
    ) {
        log.info("POST /api/v1/admin/audit-logs/export - format: {}", request.format());

        AuditLogFilters filters = new AuditLogFilters(null, null, null, null, null, null, 0, 1000);
        ByteArrayResource resource = adminService.exportAuditLogs(filters, request.format());

        String fileName = "audit_logs_" + java.time.LocalDate.now().toString() + "." + 
            (request.format().equalsIgnoreCase("json") ? "json" : "csv");

        return ResponseEntity.ok()
            .contentType(MediaType.parseMediaType(request.format().equalsIgnoreCase("json") ? "application/json" : "text/csv"))
            .header(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=\"" + fileName + "\"")
            .body(resource);
    }

    // ==================== SYSTEM LOGS ====================

    /**
     * Get system logs with filters.
     */
    @GetMapping("/system-logs")
    @PreAuthorize("hasRole('ADMIN')")
    @Operation(summary = "Get system logs", description = "Returns a paginated list of system logs with optional filters")
    public ResponseEntity<PageResponse<SystemLogResponse>> getSystemLogs(
        @Parameter(description = "Filter by log level")
        @RequestParam(required = false) String level,

        @Parameter(description = "Filter by date from")
        @RequestParam(required = false) String dateFrom,

        @Parameter(description = "Filter by date to")
        @RequestParam(required = false) String dateTo,

        @Parameter(description = "Search in message")
        @RequestParam(required = false) String search,

        @Parameter(description = "Page number")
        @RequestParam(defaultValue = "0") int page,

        @Parameter(description = "Page size")
        @RequestParam(defaultValue = "20") int size
    ) {
        log.info("GET /api/v1/admin/system-logs - level: {}, search: {}, page: {}, size: {}", 
            level, search, page, size);

        SystemLogFilters filters = new SystemLogFilters(level, dateFrom, dateTo, search, page, size);
        var logPage = adminService.getSystemLogs(filters);

        return ResponseEntity.ok(new PageResponse<>(
            logPage.getContent(),
            logPage.getNumber(),
            logPage.getSize(),
            logPage.getTotalElements(),
            logPage.getTotalPages(),
            logPage.isFirst(),
            logPage.isLast()
        ));
    }

    /**
     * Export system logs.
     */
    @PostMapping("/system-logs/export")
    @PreAuthorize("hasRole('ADMIN')")
    @Operation(summary = "Export system logs", description = "Exports system logs to CSV or JSON format")
    public ResponseEntity<ByteArrayResource> exportSystemLogs(
        @Parameter(description = "Export request")
        @Valid @RequestBody ExportLogsRequest request
    ) {
        log.info("POST /api/v1/admin/system-logs/export - format: {}", request.format());

        SystemLogFilters filters = new SystemLogFilters(null, null, null, null, 0, 1000);
        ByteArrayResource resource = adminService.exportSystemLogs(filters, request.format());

        String fileName = "system_logs_" + java.time.LocalDate.now().toString() + "." + 
            (request.format().equalsIgnoreCase("json") ? "json" : "csv");

        return ResponseEntity.ok()
            .contentType(MediaType.parseMediaType(request.format().equalsIgnoreCase("json") ? "application/json" : "text/csv"))
            .header(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=\"" + fileName + "\"")
            .body(resource);
    }

    // ==================== SYSTEM OPERATIONS ====================

    /**
     * Get system health.
     */
    @GetMapping("/system/health")
    @PreAuthorize("hasRole('ADMIN')")
    @Operation(summary = "Get system health", description = "Returns the health status of the system")
    public ResponseEntity<SystemHealthResponse> getSystemHealth() {
        log.info("GET /api/v1/admin/system/health");

        SystemHealthResponse health = adminService.getSystemHealth();

        return ResponseEntity.ok(health);
    }

    /**
     * Get system metrics.
     */
    @GetMapping("/system/metrics")
    @PreAuthorize("hasRole('ADMIN')")
    @Operation(summary = "Get system metrics", description = "Returns system metrics including memory, CPU, and database statistics")
    public ResponseEntity<SystemMetricsResponse> getSystemMetrics() {
        log.info("GET /api/v1/admin/system/metrics");

        SystemMetricsResponse metrics = adminService.getSystemMetrics();

        return ResponseEntity.ok(metrics);
    }

    // ==================== US-A-05: SYSTEM CONFIGURATION ====================

    /**
     * Default in-memory system configuration (US-A-05).
     * <p>
     * NOTE: This is a placeholder for a future feature-flag / settings module
     * backed by a database table. For now we return hardcoded defaults that
     * reflect the documented compliance threshold, default UI language and the
     * notifications toggle. Updates are accepted but not persisted.
     */
    private static final java.util.Map<String, String> DEFAULT_SYSTEM_CONFIG = java.util.Map.of(
        "default.compliance.threshold", "80",
        "default.language", "pl",
        "notifications.enabled", "true"
    );

    /**
     * Get system configuration (US-A-05).
     * Returns a flat key/value map of system-wide settings.
     */
    @GetMapping("/system/config")
    @PreAuthorize("hasRole('ADMIN')")
    @Operation(summary = "Get system configuration",
        description = "US-A-05: Returns global system configuration (compliance threshold, language, notifications). Placeholder backed by hardcoded defaults until a feature-flag store is implemented.")
    public ResponseEntity<Map<String, String>> getSystemConfig() {
        log.info("GET /api/v1/admin/system/config");
        return ResponseEntity.ok(new java.util.HashMap<>(DEFAULT_SYSTEM_CONFIG));
    }

    /**
     * Update system configuration (US-A-05).
     * <p>
     * Accepts a flat key/value map and currently only logs the requested
     * changes. Persistence is intentionally not implemented yet (TODO: feature
     * flags / app_settings table). Returns the merged effective configuration.
     */
    @PutMapping("/system/config")
    @PreAuthorize("hasRole('ADMIN')")
    @Operation(summary = "Update system configuration",
        description = "US-A-05: Accepts a key/value map of settings. Currently logs requested updates but does not persist them (placeholder for feature-flag store).")
    public ResponseEntity<Map<String, String>> updateSystemConfig(
        @RequestBody Map<String, String> updates
    ) {
        log.info("PUT /api/v1/admin/system/config - keys: {}", updates == null ? 0 : updates.size());
        if (updates != null) {
            updates.forEach((k, v) -> log.info("System config update requested: {}={} (NOT persisted - placeholder)", k, v));
        }
        // TODO: persist to app_settings table once feature-flag module ships
        java.util.Map<String, String> merged = new java.util.HashMap<>(DEFAULT_SYSTEM_CONFIG);
        if (updates != null) {
            merged.putAll(updates);
        }
        return ResponseEntity.ok(merged);
    }

    /**
     * Clear cache.
     */
    @PostMapping("/system/cache/clear")
    @PreAuthorize("hasRole('ADMIN')")
    @Operation(summary = "Clear cache", description = "Clears the system cache")
    public ResponseEntity<Map<String, String>> clearCache() {
        log.info("POST /api/v1/admin/system/cache/clear");

        Map<String, String> result = adminService.clearCache();

        return ResponseEntity.ok(result);
    }

    /**
     * Manually trigger event reminders (US-K-25).
     * Runs the same logic as the @Scheduled task and returns counts/eventIds.
     */
    @PostMapping("/system/notifications/run-reminders")
    @PreAuthorize("hasRole('ADMIN')")
    @Operation(
        summary = "Run event reminders manually",
        description = "US-K-25: Triggers the event reminder scan for the 24h-ahead window. Returns count + event IDs that matched."
    )
    public ResponseEntity<Map<String, Object>> runEventReminders() {
        log.info("POST /api/v1/admin/system/notifications/run-reminders");
        EventReminderScheduler.ReminderRunResult result = eventReminderScheduler.runReminders();
        return ResponseEntity.ok(Map.of(
            "count", result.getCount(),
            "events", result.getEventIds(),
            "notifications_created", result.getNotificationsCreated()
        ));
    }

    /**
     * Create backup.
     */
    @PostMapping("/system/backup")
    @PreAuthorize("hasRole('ADMIN')")
    @Operation(summary = "Create backup", description = "Creates a system backup")
    public ResponseEntity<BackupResponse> createBackup() {
        log.info("POST /api/v1/admin/system/backup");

        try {
            BackupResponse response = adminService.createBackup().join();
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            log.error("Failed to create backup", e);
            return ResponseEntity.internalServerError().build();
        }
    }

    // ==================== RODO: PATIENT DATA MANAGEMENT ====================

    /**
     * Anonymize patient data (US-A-10).
     * Replaces personal data with anonymized values while preserving ID and relationships.
     */
    @PostMapping("/patients/{id}/anonymize")
    @PreAuthorize("hasRole('ADMIN')")
    @Operation(summary = "Anonymize patient data", description = "US-A-10: Anonymizes patient personal data (RODO Art. 17). Replaces PESEL, name, email, phone, date of birth, and address with anonymized values.")
    public ResponseEntity<AnonymizationResponse> anonymizePatient(
        @Parameter(description = "Patient ID")
        @PathVariable UUID id
    ) {
        log.info("POST /api/v1/admin/patients/{}/anonymize", id);

        UUID currentUserId = getCurrentUserId();
        AnonymizationResponse response = adminService.anonymizePatient(id, currentUserId);

        return ResponseEntity.ok(response);
    }

    /**
     * Export patient data (US-A-11).
     * Exports all personal data and related entities in JSON or PDF format.
     */
    @GetMapping("/patients/{id}/export-data")
    @PreAuthorize("hasRole('ADMIN')")
    @Operation(summary = "Export patient data", description = "US-A-11: Exports all patient data (RODO Art. 20 - right to data portability). Includes personal data, projects, messages, materials, events, quiz attempts, badges, and audit logs.")
    public ResponseEntity<byte[]> exportPatientData(
        @Parameter(description = "Patient ID")
        @PathVariable UUID id,

        @Parameter(description = "Export format: json or pdf")
        @RequestParam(defaultValue = "json") String format
    ) {
        log.info("GET /api/v1/admin/patients/{}/export-data?format={}", id, format);

        Object result = adminService.exportPatientData(id, format);

        if (result instanceof ResponseEntity) {
            return (ResponseEntity<byte[]>) result;
        }

        return ResponseEntity.internalServerError().build();
    }

    /**
     * Erase patient data (US-A-12).
     * Hard-deletes patient data after 30-day cooling period (RODO Art. 17 - right to be forgotten).
     */
    @DeleteMapping("/patients/{id}/erase")
    @PreAuthorize("hasRole('ADMIN')")
    @Operation(summary = "Erase patient data", description = "US-A-12: Hard-deletes patient data (RODO Art. 17 - right to be forgotten). Requires patient to be in deleted state for at least 30 days (cooling period).")
    public ResponseEntity<Void> erasePatient(
        @Parameter(description = "Patient ID")
        @PathVariable UUID id,

        @Parameter(description = "Erasure request with reason")
        @Valid @RequestBody ErasureRequest request,

        @Parameter(description = "Force erasure without cooling period (requires super-admin)")
        @RequestParam(defaultValue = "false") boolean force
    ) {
        log.info("DELETE /api/v1/admin/patients/{}/erase - force: {}", id, force);

        UUID currentUserId = getCurrentUserId();
        adminService.erasePatient(id, request, currentUserId, force);

        return ResponseEntity.noContent().build();
    }

    /**
     * Get erasure logs for a patient.
     */
    @GetMapping("/patients/{id}/erasure-logs")
    @PreAuthorize("hasRole('ADMIN')")
    @Operation(summary = "Get patient erasure logs", description = "Returns erasure audit trail for a patient.")
    public ResponseEntity<java.util.List<ErasureLogResponse>> getErasureLogs(
        @Parameter(description = "Patient ID")
        @PathVariable UUID id
    ) {
        log.info("GET /api/v1/admin/patients/{}/erasure-logs", id);

        var logs = adminService.getErasureLogs(id);

        return ResponseEntity.ok(logs);
    }

    // ==================== US-NH-01: Staff verification of HIS-registered patients ====================

    /**
     * List patients awaiting staff verification (US-NH-01).
     * Sorted by created_at DESC. Visible to ADMIN, COORDINATOR, and DOCTOR roles.
     */
    @GetMapping("/patients/pending")
    @PreAuthorize("hasAnyRole('ADMIN', 'COORDINATOR', 'DOCTOR')")
    @Operation(summary = "List pending verifications",
        description = "US-NH-01: Returns patients with verification_status = PENDING, sorted by created_at DESC.")
    public ResponseEntity<PageResponse<PendingVerificationDto>> getPendingVerifications(
        @Parameter(description = "Page number") @RequestParam(defaultValue = "0") int page,
        @Parameter(description = "Page size") @RequestParam(defaultValue = "20") int size
    ) {
        log.info("GET /api/v1/admin/patients/pending - page={}, size={}", page, size);

        var result = patientService.findPendingVerifications(page, size);

        return ResponseEntity.ok(new PageResponse<>(
            result.content(),
            result.pageNumber(),
            result.pageSize(),
            result.totalElements(),
            result.totalPages(),
            result.isFirst(),
            result.isLast()
        ));
    }

    /**
     * Approve a pending patient verification (US-NH-01).
     * Method = HIS triggers a HIS lookup; method = MANUAL requires a reason of at least 10 characters.
     */
    @PostMapping("/patients/{id}/approve")
    @PreAuthorize("hasAnyRole('ADMIN', 'COORDINATOR', 'DOCTOR')")
    @Operation(summary = "Approve patient verification",
        description = "US-NH-01: Approves a pending patient verification using HIS lookup or manual override with justification.")
    public ResponseEntity<VerificationDecisionResponse> approveVerification(
        @Parameter(description = "Patient ID") @PathVariable UUID id,
        @Valid @RequestBody ApproveVerificationRequest request
    ) {
        log.info("POST /api/v1/admin/patients/{}/approve - method={}", id, request.method());

        UUID currentUserId = getCurrentUserId();
        VerificationDecisionResponse response = patientService.approveVerification(id, request, currentUserId);

        return ResponseEntity.ok(response);
    }

    /**
     * Reject a pending patient verification (US-NH-01).
     * Requires a non-empty reason (min 10 characters). Rejection is irreversible.
     */
    @PostMapping("/patients/{id}/reject")
    @PreAuthorize("hasAnyRole('ADMIN', 'COORDINATOR', 'DOCTOR')")
    @Operation(summary = "Reject patient verification",
        description = "US-NH-01: Rejects a pending patient verification with a mandatory justification (min 10 characters).")
    public ResponseEntity<VerificationDecisionResponse> rejectVerification(
        @Parameter(description = "Patient ID") @PathVariable UUID id,
        @Valid @RequestBody RejectVerificationRequest request
    ) {
        log.info("POST /api/v1/admin/patients/{}/reject", id);

        UUID currentUserId = getCurrentUserId();
        VerificationDecisionResponse response = patientService.rejectVerification(id, request, currentUserId);

        return ResponseEntity.ok(response);
    }

    /**
     * Get current user ID from security context.
     * All endpoints in this controller are @PreAuthorize-protected and the resolved
     * user ID is recorded in audit logs for RODO Art. 17/20/30 operations — silently
     * returning null would attribute these critical actions to "unknown", so we fail
     * fast instead.
     */
    private UUID getCurrentUserId() {
        var authentication = SecurityContextHolder.getContext().getAuthentication();
        if (authentication == null || !authentication.isAuthenticated()) {
            throw new IllegalStateException("No authenticated user in security context");
        }
        String userId = authentication.getName();
        try {
            return UUID.fromString(userId);
        } catch (IllegalArgumentException e) {
            log.warn("Failed to parse user ID from security context: {}", userId);
            throw new IllegalStateException(
                "Authenticated principal is not a valid user UUID: " + userId, e);
        }
    }

    // ==================== HELPER CLASSES ====================

    /**
     * Page response wrapper.
     */
    public record PageResponse<T>(
        java.util.List<T> content,
        int pageNumber,
        int pageSize,
        long totalElements,
        int totalPages,
        boolean isFirst,
        boolean isLast
    ) {
    }
}
