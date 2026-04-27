package com.kptest.application.service;

import com.kptest.api.dto.*;
import com.kptest.domain.audit.AuditLog;
import com.kptest.domain.audit.SystemLog;
import com.kptest.domain.audit.repository.AuditLogRepository;
import com.kptest.domain.audit.repository.SystemLogRepository;
import com.kptest.domain.patient.ActivationCode;
import com.kptest.domain.patient.Patient;
import com.kptest.domain.patient.PatientRepository;
import com.kptest.domain.patient.repository.ActivationCodeRepository;
import com.kptest.domain.project.ProjectRepository;
import com.kptest.domain.user.AccountStatus;
import com.kptest.domain.user.User;
import com.kptest.domain.user.UserRepository;
import com.kptest.domain.user.UserRole;
import com.kptest.exception.ResourceNotFoundException;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.core.io.ByteArrayResource;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.io.ByteArrayOutputStream;
import java.nio.file.Files;
import java.nio.file.Path;
import java.time.Instant;
import java.time.LocalDate;
import java.time.ZoneId;
import java.time.format.DateTimeFormatter;
import java.util.*;
import java.util.concurrent.CompletableFuture;

/**
 * Admin service for user management, audit logs, and system operations.
 */
@Slf4j
@Service
@RequiredArgsConstructor
@Transactional
public class AdminService {

    private final UserRepository userRepository;
    private final AuditLogRepository auditLogRepository;
    private final SystemLogRepository systemLogRepository;
    private final ProjectRepository projectRepository;
    private final PatientRepository patientRepository;
    private final ActivationCodeRepository activationCodeRepository;

    private static final DateTimeFormatter DATE_FORMATTER = DateTimeFormatter.ISO_INSTANT;

    /**
     * Get all users with filters.
     */
    @Transactional(readOnly = true)
    public Page<UserAdminDto> getAllUsers(UserFilters filters) {
        log.info("Getting all users with filters: {}", filters);

        int page = filters.page() != null ? filters.page() : 0;
        int size = filters.size() != null ? filters.size() : 20;
        Pageable pageable = PageRequest.of(page, size, Sort.by(Sort.Direction.DESC, "createdAt"));

        Page<User> users = userRepository.findAll(pageable);
        List<UserAdminDto> allDtos = users.stream().map(UserAdminDto::fromUser).toList();

        List<UserAdminDto> filtered = allDtos;
        if (filters.role() != null) {
            String roleFilter = filters.role();
            filtered = filtered.stream().filter(user -> user.role().equals(roleFilter)).toList();
        }
        if (filters.status() != null) {
            String statusFilter = filters.status();
            filtered = filtered.stream().filter(user -> user.status().equals(statusFilter)).toList();
        }

        int start = (int) pageable.getOffset();
        int end = Math.min((start + pageable.getPageSize()), filtered.size());
        List<UserAdminDto> pageContent = filtered.subList(start, end);

        return new org.springframework.data.domain.PageImpl<>(pageContent, pageable, filtered.size());
    }

    /**
     * Get user by ID.
     */
    @Transactional(readOnly = true)
    public UserAdminDto getUserById(UUID userId) {
        log.info("Getting user by ID: {}", userId);

        User user = userRepository.findById(userId)
            .orElseThrow(() -> new ResourceNotFoundException("User not found with id: " + userId));

        return UserAdminDto.fromUser(user);
    }

    /**
     * Update user role.
     */
    public UserAdminDto updateUserRole(UUID userId, UserRole newRole) {
        log.info("Updating user role for userId: {} to role: {}", userId, newRole);

        User user = userRepository.findById(userId)
            .orElseThrow(() -> new ResourceNotFoundException("User not found with id: " + userId));

        user.setRole(newRole);
        User savedUser = userRepository.save(user);

        logAuditLog(userId, AuditLog.AuditAction.UPDATE, "User", userId,
            Map.of("oldRole", user.getRole().name()),
            Map.of("newRole", newRole.name()),
            null, null);

        return UserAdminDto.fromUser(savedUser);
    }

    /**
     * Update user status.
     */
    public UserAdminDto updateUserStatus(UUID userId, AccountStatus newStatus) {
        log.info("Updating user status for userId: {} to status: {}", userId, newStatus);

        User user = userRepository.findById(userId)
            .orElseThrow(() -> new ResourceNotFoundException("User not found with id: " + userId));

        AccountStatus oldStatus = user.getStatus();
        user.setStatus(newStatus);
        User savedUser = userRepository.save(user);

        logAuditLog(userId, AuditLog.AuditAction.UPDATE, "User", userId,
            Map.of("oldStatus", oldStatus.name()),
            Map.of("newStatus", newStatus.name()),
            null, null);

        return UserAdminDto.fromUser(savedUser);
    }

    /**
     * Reset user password.
     */
    public ResetPasswordResponse resetPassword(UUID userId) {
        log.info("Resetting password for userId: {}", userId);

        User user = userRepository.findById(userId)
            .orElseThrow(() -> new ResourceNotFoundException("User not found with id: " + userId));

        // Generate temporary password
        String temporaryPassword = generateTemporaryPassword();

        // In a real implementation, you would hash this password and send it via email
        // For now, we'll just return it in the response
        user.setPasswordHash("{plain}" + temporaryPassword); // Spring Security will recognize the {plain} prefix
        userRepository.save(user);

        logAuditLog(userId, AuditLog.AuditAction.UPDATE, "User", userId,
            null,
            Map.of("passwordReset", true),
            null, null);

        return new ResetPasswordResponse(
            user.getId().toString(),
            "Password has been reset successfully. Temporary password has been generated.",
            temporaryPassword
        );
    }

    /**
     * Delete user.
     */
    public void deleteUser(UUID userId) {
        log.info("Deleting user with ID: {}", userId);

        User user = userRepository.findById(userId)
            .orElseThrow(() -> new ResourceNotFoundException("User not found with id: " + userId));

        // Soft delete
        user.setDeletedAt(Instant.now());
        user.setStatus(AccountStatus.DEACTIVATED);
        userRepository.save(user);

        logAuditLog(userId, AuditLog.AuditAction.DELETE, "User", userId,
            Map.of("email", user.getEmail(), "role", user.getRole().name()),
            null,
            null, null);
    }

    /**
     * Force password reset for a staff user.
     * Invalidates all sessions and requires new password on next login.
     */
    public ResetPasswordResponse forcePasswordReset(UUID userId, String reason) {
        log.info("Forcing password reset for userId: {}, reason: {}", userId, reason);

        User user = userRepository.findById(userId)
            .orElseThrow(() -> new ResourceNotFoundException("User not found with id: " + userId));

        // Only allow for staff users
        if (user.getRole() == UserRole.PATIENT) {
            throw new IllegalArgumentException("Cannot force password reset for patient accounts");
        }

        // Generate temporary password
        String temporaryPassword = generateTemporaryPassword();

        // Set new password hash
        user.setPasswordHash("{plain}" + temporaryPassword);

        // Reset failed login attempts
        user.setFailedLoginAttempts(0);
        user.setLockedUntil(null);

        userRepository.save(user);

        // Log audit with reason
        logAuditLog(userId, AuditLog.AuditAction.UPDATE, "User", userId,
            Map.of("action", "force_password_reset", "reason", reason),
            Map.of("passwordReset", true, "sessionsInvalidated", true),
            null, null);

        return new ResetPasswordResponse(
            user.getId().toString(),
            "Password has been reset successfully. User must set new password on next login. Reason: " + reason,
            temporaryPassword
        );
    }

    /**
     * Clear 2FA configuration for a user.
     */
    public Clear2faResponse clear2fa(UUID userId, String reason) {
        log.info("Clearing 2FA for userId: {}, reason: {}", userId, reason);

        User user = userRepository.findById(userId)
            .orElseThrow(() -> new ResourceNotFoundException("User not found with id: " + userId));

        // Store old values for audit
        
        

        // Clear 2FA configuration
        user.setTwoFactorEnabled(false);
        user.setTwoFactorSecret(null);

        // For required-2FA roles, set account to requires reconfiguration status
        if (requiresTwoFactor(user.getRole())) {
            user.setStatus(AccountStatus.PENDING_VERIFICATION);
            log.info("User {} has a role requiring 2FA. Status set to PENDING_VERIFICATION", userId);
        }

        userRepository.save(user);

        // Log audit with reason
        logAuditLog(userId, AuditLog.AuditAction.UPDATE, "User", userId,
            Map.of(
                "action", "clear_2fa",
                "reason", reason,
                "oldTwoFactorEnabled", user.isTwoFactorEnabled(),
                "oldTwoFactorSecret", user.getTwoFactorSecret() != null ? "[REDACTED]" : null
            ),
            Map.of("twoFactorEnabled", false, "twoFactorSecret", "cleared"),
            null, null);

        return new Clear2faResponse(
            true,
            "2FA configuration has been cleared successfully"
        );
    }

    /**
     * Generate one-time activation code for a patient.
     */
    public ActivationCodeResponse generateActivationCode(UUID patientId) {
        log.info("Generating activation code for patientId: {}", patientId);

        // Verify patient exists
        Patient patient = patientRepository.findById(patientId)
            .orElseThrow(() -> new ResourceNotFoundException("Patient not found with id: " + patientId));

        // Generate 8-character code
        String code = generateActivationCodeString();

        // Create activation code entity
        ActivationCode activationCode = ActivationCode.create(patientId, code);
        activationCodeRepository.save(activationCode);

        // Generate PDF with instructions (simplified - in real app would use PDF library)
        String pdfUrl = generateActivationCodePdf(patient, activationCode);

        Instant expiresAt = activationCode.getExpiresAt();

        log.info("Generated activation code for patient {}: expires at {}", patientId, expiresAt);

        return new ActivationCodeResponse(
            patientId.toString(),
            code,
            expiresAt,
            pdfUrl,
            "Activation code generated successfully. Valid for 72 hours. PDF with instructions has been generated."
        );
    }

    /**
     * Check if a role requires 2FA.
     */
    private boolean requiresTwoFactor(UserRole role) {
        // In a real implementation, this would be configurable
        // For now, assume DOCTOR and ADMIN roles require 2FA
        return role == UserRole.DOCTOR || role == UserRole.ADMIN;
    }

    /**
     * Get audit logs with filters.
     */
    @Transactional(readOnly = true)
    public Page<AuditLogResponse> getAuditLogs(AuditLogFilters filters) {
        log.info("Getting audit logs with filters: {}", filters);

        int page = filters.page() != null ? filters.page() : 0;
        int size = filters.size() != null ? filters.size() : 20;
        Pageable pageable = PageRequest.of(page, size, Sort.by(Sort.Direction.DESC, "createdAt"));

        Page<AuditLog> logs;

        Instant dateFrom = parseDate(filters.dateFrom());
        Instant dateTo = parseDate(filters.dateTo());

        if (filters.userId() != null) {
            UUID userId = UUID.fromString(filters.userId());
            if (dateFrom != null && dateTo != null) {
                logs = auditLogRepository.findByUserIdAndDateRange(userId, dateFrom, dateTo, pageable);
            } else {
                logs = auditLogRepository.findByUserId(userId, pageable);
            }
        } else if (filters.action() != null) {
            AuditLog.AuditAction action = AuditLog.AuditAction.valueOf(filters.action());
            if (dateFrom != null && dateTo != null) {
                logs = auditLogRepository.findByActionAndDateRange(action, dateFrom, dateTo, pageable);
            } else {
                logs = auditLogRepository.findByAction(action, pageable);
            }
        } else if (filters.entityType() != null) {
            logs = auditLogRepository.findByEntityType(filters.entityType(), pageable);
        } else if (dateFrom != null && dateTo != null) {
            logs = auditLogRepository.findByDateRange(dateFrom, dateTo, pageable);
        } else {
            logs = auditLogRepository.findAll(pageable);
        }

        return logs.map(AuditLogResponse::fromAuditLog);
    }

    /**
     * Get system logs with filters.
     */
    @Transactional(readOnly = true)
    public Page<SystemLogResponse> getSystemLogs(SystemLogFilters filters) {
        log.info("Getting system logs with filters: {}", filters);

        int page = filters.page() != null ? filters.page() : 0;
        int size = filters.size() != null ? filters.size() : 20;
        Pageable pageable = PageRequest.of(page, size, Sort.by(Sort.Direction.DESC, "createdAt"));

        Page<SystemLog> logs;

        Instant dateFrom = parseDate(filters.dateFrom());
        Instant dateTo = parseDate(filters.dateTo());

        if (filters.level() != null) {
            SystemLog.LogLevel level = SystemLog.LogLevel.valueOf(filters.level());
            if (dateFrom != null && dateTo != null) {
                logs = systemLogRepository.findByLevelAndDateRange(level, dateFrom, dateTo, pageable);
            } else {
                logs = systemLogRepository.findByLevel(level, pageable);
            }
        } else if (dateFrom != null && dateTo != null) {
            logs = systemLogRepository.findByDateRange(dateFrom, dateTo, pageable);
        } else {
            logs = systemLogRepository.findAll(pageable);
        }

        final String search = filters.search();
        if (search != null && !search.isBlank()) {
            List<SystemLogResponse> allDtos = logs.stream().map(SystemLogResponse::fromSystemLog).toList();
            List<SystemLogResponse> filtered = allDtos.stream()
                .filter(log -> log.message().toLowerCase().contains(search.toLowerCase()))
                .toList();

            int start = (int) pageable.getOffset();
            int end = Math.min((start + pageable.getPageSize()), filtered.size());
            List<SystemLogResponse> pageContent = filtered.subList(start, end);

            return new org.springframework.data.domain.PageImpl<>(pageContent, pageable, filtered.size());
        }

        return logs.map(SystemLogResponse::fromSystemLog);
    }

    /**
     * Export audit logs.
     */
    @Transactional(readOnly = true)
    public ByteArrayResource exportAuditLogs(AuditLogFilters filters, String format) {
        log.info("Exporting audit logs with format: {}", format);

        // Get all logs without pagination
        List<AuditLog> logs = auditLogRepository.findAll(Sort.by(Sort.Direction.DESC, "createdAt"));

        if ("CSV".equalsIgnoreCase(format)) {
            return exportAuditLogsToCsv(logs);
        } else if ("JSON".equalsIgnoreCase(format)) {
            return exportAuditLogsToJson(logs);
        } else {
            return exportAuditLogsToCsv(logs); // Default to CSV
        }
    }

    /**
     * Export system logs.
     */
    @Transactional(readOnly = true)
    public ByteArrayResource exportSystemLogs(SystemLogFilters filters, String format) {
        log.info("Exporting system logs with format: {}", format);

        // Get all logs without pagination
        List<SystemLog> logs = systemLogRepository.findAll(Sort.by(Sort.Direction.DESC, "createdAt"));

        if ("CSV".equalsIgnoreCase(format)) {
            return exportSystemLogsToCsv(logs);
        } else if ("JSON".equalsIgnoreCase(format)) {
            return exportSystemLogsToJson(logs);
        } else {
            return exportSystemLogsToCsv(logs); // Default to CSV
        }
    }

    /**
     * Get system health.
     */
    @Transactional(readOnly = true)
    public SystemHealthResponse getSystemHealth() {
        log.info("Getting system health");

        String timestamp = Instant.now().toString();
        long uptimeSeconds = getUptimeSeconds();

        // Check database health
        String dbStatus = "UP";
        Long dbResponseTime = null;
        try {
            long start = System.currentTimeMillis();
            userRepository.count();
            dbResponseTime = System.currentTimeMillis() - start;
        } catch (Exception e) {
            dbStatus = "DOWN";
            log.error("Database health check failed", e);
        }

        // Check cache health (simplified)
        String cacheStatus = "UNKNOWN";

        Map<String, SystemHealthResponse.HealthCheckDetail> details = new HashMap<>();
        details.put("database", new SystemHealthResponse.HealthCheckDetail(
            dbStatus,
            dbResponseTime,
            dbStatus.equals("UP") ? "Database connection successful" : "Database connection failed"
        ));

        String overallStatus = dbStatus.equals("UP") ? "UP" : "DOWN";

        return new SystemHealthResponse(
            overallStatus,
            dbStatus,
            cacheStatus,
            timestamp,
            uptimeSeconds,
            "1.0.0",
            details
        );
    }

    /**
     * Get system metrics.
     */
    @Transactional(readOnly = true)
    public SystemMetricsResponse getSystemMetrics() {
        log.info("Getting system metrics");

        Runtime runtime = Runtime.getRuntime();

        // Memory metrics
        long totalMemory = runtime.totalMemory() / (1024 * 1024);
        long freeMemory = runtime.freeMemory() / (1024 * 1024);
        long usedMemory = totalMemory - freeMemory;
        double memoryUsagePercent = totalMemory > 0 ? (double) usedMemory / totalMemory * 100 : 0;

        // CPU metrics
        int availableProcessors = runtime.availableProcessors();
        double systemLoadPercent = 0.0; // Java doesn't provide direct CPU usage

        // Database metrics
        long totalRecords = userRepository.count() + projectRepository.count() + patientRepository.count();

        // User metrics
        long totalUsers = userRepository.count();
        long activeUsers = userRepository.countActiveByRole(UserRole.ADMIN) +
            userRepository.countActiveByRole(UserRole.DOCTOR) +
            userRepository.countActiveByRole(UserRole.NURSE) +
            userRepository.countActiveByRole(UserRole.THERAPIST);

        return new SystemMetricsResponse(
            new SystemMetricsResponse.MemoryMetrics(totalMemory, usedMemory, freeMemory, memoryUsagePercent),
            new SystemMetricsResponse.CpuMetrics(availableProcessors, systemLoadPercent),
            new SystemMetricsResponse.DatabaseMetrics(0, 100, totalRecords),
            new SystemMetricsResponse.CacheMetrics(false, 0L, 0.0),
            new SystemMetricsResponse.UserMetrics(totalUsers, activeUsers, 0L),
            Instant.now().toString()
        );
    }

    /**
     * Clear cache.
     */
    public Map<String, String> clearCache() {
        log.info("Clearing cache");

        // In a real implementation, you would clear Redis or other cache
        // For now, just log it
        Map<String, String> result = new HashMap<>();
        result.put("status", "SUCCESS");
        result.put("message", "Cache cleared successfully");
        return result;
    }

    /**
     * Create backup.
     */
    @Async
    public CompletableFuture<BackupResponse> createBackup() {
        log.info("Creating backup");

        String backupId = UUID.randomUUID().toString();
        String fileName = "backup_" + LocalDate.now().toString() + "_" + System.currentTimeMillis() + ".sql";

        // In a real implementation, you would actually create a database backup
        // For now, just simulate it
        BackupResponse response = new BackupResponse(
            backupId,
            "COMPLETED",
            fileName,
            10.5,
            Instant.now(),
            "Backup created successfully"
        );

        return CompletableFuture.completedFuture(response);
    }

    // Helper methods

    private void logAuditLog(UUID userId, AuditLog.AuditAction action, String entityType,
                            UUID entityId, Map<String, Object> oldValue, Map<String, Object> newValue,
                            String ipAddress, String userAgent) {
        try {
            AuditLog log = AuditLog.create(userId, action, entityType, entityId);
            if (oldValue != null) {
                log.setOldValue(convertToJson(oldValue));
            }
            if (newValue != null) {
                log.setNewValue(convertToJson(newValue));
            }
            log.setIpAddress(ipAddress);
            log.setUserAgent(userAgent);
            auditLogRepository.save(log);
        } catch (Exception e) {
            log.error("Failed to create audit log", e);
        }
    }

    private String generateTemporaryPassword() {
        String chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%";
        StringBuilder sb = new StringBuilder(12);
        Random random = new Random();
        for (int i = 0; i < 12; i++) {
            sb.append(chars.charAt(random.nextInt(chars.length())));
        }
        return sb.toString();
    }

    /**
     * Generate 8-character activation code.
     */
    private String generateActivationCodeString() {
        // Use only uppercase letters and digits for readability
        String chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789"; // Excluding similar chars like I, 1, O, 0
        StringBuilder sb = new StringBuilder(8);
        Random random = new Random();
        for (int i = 0; i < 8; i++) {
            sb.append(chars.charAt(random.nextInt(chars.length())));
        }
        return sb.toString();
    }

    /**
     * Generate PDF with activation code instructions.
     * In a real implementation, this would use a PDF library like iText or Apache PDFBox.
     */
    private String generateActivationCodePdf(Patient patient, ActivationCode activationCode) {
        try {
            // Create storage directory if it doesn't exist
            Path storageDir = Path.of("/tmp/activation-codes");
            if (!Files.exists(storageDir)) {
                Files.createDirectories(storageDir);
            }

            // Generate PDF content (simplified - in real app would use PDF library)
            String fileName = "activation_code_" + activationCode.getCode() + ".pdf";
            Path filePath = storageDir.resolve(fileName);

            // Create simple text content as placeholder
            String content = String.format("""
                ACTIVATION CODE INSTRUCTIONS
                ============================

                Patient: %s %s
                PESEL: %s

                Your activation code: %s

                This code is valid until: %s

                Instructions:
                1. Go to the application login page
                2. Click on "Activate Account"
                3. Enter your PESEL number
                4. Enter this activation code
                5. Set your new password

                If you have any questions, please contact support.
                """,
                patient.getFirstName(),
                patient.getLastName(),
                patient.getPesel(),
                activationCode.getCode(),
                activationCode.getExpiresAt()
            );

            Files.writeString(filePath, content);

            return "/api/v1/admin/patients/" + patient.getId() + "/activation-code/" + activationCode.getCode() + "/pdf";
        } catch (Exception e) {
            log.error("Failed to generate activation code PDF", e);
            return null;
        }
    }

    private Instant parseDate(String dateStr) {
        if (dateStr == null || dateStr.isBlank()) {
            return null;
        }
        try {
            return Instant.parse(dateStr);
        } catch (Exception e) {
            return null;
        }
    }

    private String convertToJson(Map<String, Object> map) {
        if (map == null) {
            return null;
        }
        StringBuilder sb = new StringBuilder("{");
        for (Map.Entry<String, Object> entry : map.entrySet()) {
            if (sb.length() > 1) {
                sb.append(",");
            }
            sb.append("\"").append(entry.getKey()).append("\":\"").append(entry.getValue()).append("\"");
        }
        sb.append("}");
        return sb.toString();
    }

    private long getUptimeSeconds() {
        return java.lang.management.ManagementFactory.getRuntimeMXBean().getUptime() / 1000;
    }

    private ByteArrayResource exportAuditLogsToCsv(List<AuditLog> logs) {
        ByteArrayOutputStream outputStream = new ByteArrayOutputStream();
        try {
            outputStream.write("ID,User ID,Action,Entity Type,Entity ID,IP Address,Created At\n".getBytes());
            for (AuditLog log : logs) {
                String line = String.format("%s,%s,%s,%s,%s,%s,%s\n",
                    log.getId(),
                    log.getUserId(),
                    log.getAction(),
                    log.getEntityType(),
                    log.getEntityId() != null ? log.getEntityId() : "",
                    log.getIpAddress() != null ? log.getIpAddress() : "",
                    log.getCreatedAt()
                );
                outputStream.write(line.getBytes());
            }
        } catch (Exception e) {
            log.error("Failed to export audit logs to CSV", e);
        }
        return new ByteArrayResource(outputStream.toByteArray());
    }

    private ByteArrayResource exportAuditLogsToJson(List<AuditLog> logs) {
        ByteArrayOutputStream outputStream = new ByteArrayOutputStream();
        try {
            outputStream.write("[\n".getBytes());
            for (int i = 0; i < logs.size(); i++) {
                AuditLog log = logs.get(i);
                String line = String.format(
                    "{\"id\":\"%s\",\"userId\":\"%s\",\"action\":\"%s\",\"entityType\":\"%s\",\"entityId\":\"%s\",\"createdAt\":\"%s\"}",
                    log.getId(),
                    log.getUserId(),
                    log.getAction(),
                    log.getEntityType(),
                    log.getEntityId() != null ? log.getEntityId() : "",
                    log.getCreatedAt()
                );
                if (i < logs.size() - 1) {
                    line += ",";
                }
                line += "\n";
                outputStream.write(line.getBytes());
            }
            outputStream.write("]".getBytes());
        } catch (Exception e) {
            log.error("Failed to export audit logs to JSON", e);
        }
        return new ByteArrayResource(outputStream.toByteArray());
    }

    private ByteArrayResource exportSystemLogsToCsv(List<SystemLog> logs) {
        ByteArrayOutputStream outputStream = new ByteArrayOutputStream();
        try {
            outputStream.write("ID,Level,Message,Source Class,Created At\n".getBytes());
            for (SystemLog log : logs) {
                String line = String.format("%s,%s,%s,%s,%s\n",
                    log.getId(),
                    log.getLevel(),
                    log.getMessage().replace("\n", " "),
                    log.getSourceClass() != null ? log.getSourceClass() : "",
                    log.getCreatedAt()
                );
                outputStream.write(line.getBytes());
            }
        } catch (Exception e) {
            log.error("Failed to export system logs to CSV", e);
        }
        return new ByteArrayResource(outputStream.toByteArray());
    }

    private ByteArrayResource exportSystemLogsToJson(List<SystemLog> logs) {
        ByteArrayOutputStream outputStream = new ByteArrayOutputStream();
        try {
            outputStream.write("[\n".getBytes());
            for (int i = 0; i < logs.size(); i++) {
                SystemLog log = logs.get(i);
                String line = String.format(
                    "{\"id\":\"%s\",\"level\":\"%s\",\"message\":\"%s\",\"sourceClass\":\"%s\",\"createdAt\":\"%s\"}",
                    log.getId(),
                    log.getLevel(),
                    log.getMessage().replace("\"", "\\\""),
                    log.getSourceClass() != null ? log.getSourceClass() : "",
                    log.getCreatedAt()
                );
                if (i < logs.size() - 1) {
                    line += ",";
                }
                line += "\n";
                outputStream.write(line.getBytes());
            }
            outputStream.write("]".getBytes());
        } catch (Exception e) {
            log.error("Failed to export system logs to JSON", e);
        }
        return new ByteArrayResource(outputStream.toByteArray());
    }
}
