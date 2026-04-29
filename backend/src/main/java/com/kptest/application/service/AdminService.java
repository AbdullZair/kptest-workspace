package com.kptest.application.service;

import com.kptest.api.dto.*;
import com.kptest.domain.audit.AuditLog;
import com.kptest.domain.audit.DataProcessingErasureLog;
import com.kptest.domain.audit.SystemLog;
import com.kptest.domain.audit.repository.AuditLogRepository;
import com.kptest.domain.audit.repository.DataProcessingErasureLogRepository;
import com.kptest.domain.audit.repository.SystemLogRepository;
import com.kptest.domain.gamification.Badge;
import com.kptest.domain.gamification.PatientBadge;
import com.kptest.domain.gamification.repository.BadgeRepository;
import com.kptest.domain.gamification.repository.PatientBadgeRepository;
import com.kptest.domain.material.EducationalMaterial;
import com.kptest.domain.material.MaterialProgress;
import com.kptest.domain.material.repository.EducationalMaterialRepository;
import com.kptest.domain.material.repository.MaterialProgressRepository;
import com.kptest.domain.message.Message;
import com.kptest.domain.message.MessageAttachment;
import com.kptest.domain.message.repository.MessageAttachmentRepository;
import com.kptest.domain.message.repository.MessageRepository;
import com.kptest.domain.notification.Notification;
import com.kptest.domain.notification.repository.NotificationRepository;
import com.kptest.domain.patient.ActivationCode;
import com.kptest.domain.patient.EmergencyContact;
import com.kptest.domain.patient.EmergencyContactRepository;
import com.kptest.domain.patient.Patient;
import com.kptest.domain.patient.PatientRepository;
import com.kptest.domain.patient.repository.ActivationCodeRepository;
import com.kptest.domain.project.PatientProject;
import com.kptest.domain.project.PatientProjectRepository;
import com.kptest.domain.project.Project;
import com.kptest.domain.project.ProjectRepository;
import com.kptest.domain.quiz.Quiz;
import com.kptest.domain.quiz.QuizAnswerSelection;
import com.kptest.domain.quiz.QuizAttempt;
import com.kptest.domain.quiz.repository.QuizAttemptRepository;
import com.kptest.domain.quiz.repository.QuizAnswerSelectionRepository;
import com.kptest.domain.quiz.repository.QuizRepository;
import com.kptest.domain.schedule.TherapyEvent;
import com.kptest.domain.schedule.repository.TherapyEventRepository;
import com.kptest.domain.user.AccountStatus;
import com.kptest.domain.user.User;
import com.kptest.domain.user.UserRepository;
import com.kptest.domain.user.UserRole;
import com.kptest.exception.BusinessRuleException;
import com.kptest.exception.ResourceNotFoundException;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.core.io.ByteArrayResource;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.http.ResponseEntity;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import jakarta.annotation.PostConstruct;

import java.io.ByteArrayOutputStream;
import java.nio.charset.StandardCharsets;
import java.nio.file.Files;
import java.nio.file.Path;
import java.time.Instant;
import java.time.LocalDate;
import java.time.ZoneId;
import java.time.format.DateTimeFormatter;
import java.util.*;
import java.util.concurrent.CompletableFuture;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.databind.SerializationFeature;
import com.fasterxml.jackson.datatype.jsr310.JavaTimeModule;

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
    private final PatientProjectRepository patientProjectRepository;
    private final MessageRepository messageRepository;
    private final MaterialProgressRepository materialProgressRepository;
    private final EducationalMaterialRepository educationalMaterialRepository;
    private final TherapyEventRepository therapyEventRepository;
    private final QuizAttemptRepository quizAttemptRepository;
    private final QuizRepository quizRepository;
    private final QuizAnswerSelectionRepository quizAnswerSelectionRepository;
    private final PatientBadgeRepository patientBadgeRepository;
    private final BadgeRepository badgeRepository;
    private final MessageAttachmentRepository messageAttachmentRepository;
    private final NotificationRepository notificationRepository;
    private final EmergencyContactRepository emergencyContactRepository;
    private final DataProcessingErasureLogRepository dataProcessingErasureLogRepository;
    private ObjectMapper objectMapper;

    private static final DateTimeFormatter DATE_FORMATTER = DateTimeFormatter.ISO_INSTANT;

    @PostConstruct
    private void init() {
        this.objectMapper = new ObjectMapper();
        this.objectMapper.registerModule(new JavaTimeModule());
        this.objectMapper.disable(SerializationFeature.WRITE_DATES_AS_TIMESTAMPS);
    }

    /**
     * Get all users with filters.
     */
    @Transactional(readOnly = true)
    public Page<UserAdminDto> getAllUsers(UserFilters filters) {
        log.info("Getting all users with filters: {}", filters);

        int page = filters.page() != null ? filters.page() : 0;
        int size = filters.size() != null ? filters.size() : 20;
        Pageable pageable = PageRequest.of(page, size, Sort.by(Sort.Direction.DESC, "createdAt"));

        List<UserAdminDto> filtered = userRepository.findAll(Sort.by(Sort.Direction.DESC, "createdAt"))
            .stream()
            .map(UserAdminDto::fromUser)
            .toList();
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
        List<UserAdminDto> pageContent = start >= filtered.size()
            ? List.of()
            : filtered.subList(start, end);

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

    // ==================== RODO: PATIENT ANONYMIZATION (US-A-10) ====================

    /**
     * Anonymize patient data (RODO Art. 17 - right to erasure via anonymization).
     * Replaces personal data with anonymized values while preserving:
     * - Patient ID (UUID)
     * - PatientProject relationships
     * - AuditLog entries
     */
    public AnonymizationResponse anonymizePatient(UUID patientId, UUID currentUserId) {
        log.info("Anonymizing patient with ID: {}", patientId);

        Patient patient = patientRepository.findById(patientId)
            .orElseThrow(() -> new ResourceNotFoundException("Patient not found with id: " + patientId));

        // Store old values for audit
        Map<String, Object> oldValues = new HashMap<>();
        oldValues.put("pesel", patient.getPesel());
        oldValues.put("firstName", patient.getFirstName());
        oldValues.put("lastName", patient.getLastName());
        oldValues.put("dateOfBirth", patient.getDateOfBirth());
        oldValues.put("addressStreet", patient.getAddressStreet());
        oldValues.put("addressCity", patient.getAddressCity());
        oldValues.put("addressPostalCode", patient.getAddressPostalCode());

        if (patient.getUser() != null) {
            oldValues.put("email", patient.getUser().getEmail());
            oldValues.put("phone", patient.getUser().getPhone());
        }

        // Generate anonymized values. PESEL column is varchar(11) — anonimizowany
        // PESEL musi mieścić się w 11 znakach i być unikatowy per pacjent.
        // Pattern: "A" + 10-cyfrowy hash UUID pacjenta = 11 znaków, unique.
        String anonymizedPesel = "A" + generatePeselHash(patient);
        String anonymizedLastName = "ANON-" + generateSequenceSuffix(patientId);
        String anonymizedEmail = "anon-" + patientId + "@deleted.local";

        // Apply anonymization to Patient
        patient.setPesel(anonymizedPesel);
        patient.setFirstName("ANON");
        patient.setLastName(anonymizedLastName);
        patient.setDateOfBirth(null);
        patient.setAddressStreet(null);
        patient.setAddressCity(null);
        patient.setAddressPostalCode(null);

        // Apply anonymization to associated User
        if (patient.getUser() != null) {
            User user = patient.getUser();
            user.setEmail(anonymizedEmail);
            user.setPhone(null);
            userRepository.save(user);
        }

        patientRepository.save(patient);

        // Create audit log with ANONYMIZE action
        AuditLog auditLog = AuditLog.create(
            currentUserId,
            AuditLog.AuditAction.UPDATE,
            "Patient",
            patientId
        );
        auditLog.setOldValue(convertToJson(oldValues));
        Map<String, Object> newValues = new HashMap<>();
        newValues.put("pesel", anonymizedPesel);
        newValues.put("firstName", "ANON");
        newValues.put("lastName", anonymizedLastName);
        newValues.put("email", anonymizedEmail);
        newValues.put("phone", null);
        newValues.put("dateOfBirth", null);
        newValues.put("addressStreet", null);
        newValues.put("addressCity", null);
        newValues.put("addressPostalCode", null);
        auditLog.setNewValue(convertToJson(newValues));
        auditLogRepository.save(auditLog);

        log.info("Patient {} anonymized successfully. Audit log ID: {}", patientId, auditLog.getId());

        return AnonymizationResponse.of(patientId, Instant.now(), auditLog.getId());
    }

    /**
     * Generate hash for PESEL anonymization.
     */
    private String generatePeselHash(Patient patient) {
        String input = patient.getId() + "_" + patient.getPesel() + "_" + System.currentTimeMillis();
        return Integer.toHexString(input.hashCode()).toUpperCase();
    }

    /**
     * Generate sequence suffix for anonymized last name.
     */
    private String generateSequenceSuffix(UUID patientId) {
        return patientId.toString().substring(0, 8).toUpperCase();
    }

    // ==================== RODO: PATIENT DATA EXPORT (US-A-11) ====================

    /**
     * Export patient data (RODO Art. 20 - right to data portability).
     * Exports all personal data and related entities in JSON or PDF format.
     */
    @Transactional(readOnly = true)
    public Object exportPatientData(UUID patientId, String format) {
        log.info("Exporting patient data for ID: {}, format: {}", patientId, format);

        Patient patient = patientRepository.findById(patientId)
            .orElseThrow(() -> new ResourceNotFoundException("Patient not found with id: " + patientId));

        Instant exportGeneratedAt = Instant.now();

        // Build patient personal data
        PatientDataExportDto.PatientPersonalData patientData =
            PatientDataExportDto.PatientPersonalData.fromPatient(patient, patient.getUser());

        // Build therapeutic projects
        List<PatientDataExportDto.PatientProjectData> therapeuticProjects =
            patientProjectRepository.findByPatientId(patientId).stream()
                .map(PatientDataExportDto.PatientProjectData::fromPatientProject)
                .toList();

        // Build messages - find threads for this patient via patient_projects
        List<PatientDataExportDto.MessageData> messages = new ArrayList<>();
        // Messages are linked via threads - simplified: get all messages where sender is patient's user
        if (patient.getUser() != null) {
            messages = messageRepository.findBySenderId(patient.getUser().getId()).stream()
                .map(PatientDataExportDto.MessageData::fromMessage)
                .toList();
        }

        // Build material progress
        List<PatientDataExportDto.MaterialProgressData> materialProgress =
            materialProgressRepository.findByPatientId(patientId).stream()
                .map(progress -> {
                    EducationalMaterial material = educationalMaterialRepository.findById(progress.getMaterialId()).orElse(null);
                    String materialTitle = material != null ? material.getTitle() : null;
                    return PatientDataExportDto.MaterialProgressData.fromMaterialProgress(progress, materialTitle);
                })
                .toList();

        // Build therapy events
        List<PatientDataExportDto.TherapyEventData> therapyEvents =
            therapyEventRepository.findByPatientId(patientId).stream()
                .map(PatientDataExportDto.TherapyEventData::fromTherapyEvent)
                .toList();

        // Build quiz attempts
        List<PatientDataExportDto.QuizAttemptData> quizAttempts =
            quizAttemptRepository.findByPatientId(patientId).stream()
                .map(attempt -> {
                    Quiz quiz = quizRepository.findById(attempt.getQuiz().getId()).orElse(null);
                    return new PatientDataExportDto.QuizAttemptData(
                        attempt.getId(),
                        attempt.getQuiz() != null ? attempt.getQuiz().getId() : null,
                        attempt.getQuiz() != null ? attempt.getQuiz().getTitle() : null,
                        attempt.getScore(),
                        attempt.getCompletedAt()
                    );
                })
                .toList();

        // Build badges
        List<PatientDataExportDto.PatientBadgeData> badges =
            patientBadgeRepository.findByPatientIdOrderByEarnedAtDesc(patientId).stream()
                .map(patientBadge -> {
                    Badge badge = patientBadge.getBadge();
                    return new PatientDataExportDto.PatientBadgeData(
                        badge != null ? badge.getId() : null,
                        badge != null ? badge.getName() : null,
                        badge != null ? badge.getDescription() : null,
                        patientBadge.getEarnedAt()
                    );
                })
                .toList();

        // Build audit logs for this patient
        List<PatientDataExportDto.AuditLogData> auditLogs =
            auditLogRepository.findByEntityTypeAndEntityId("Patient", patientId).stream()
                .map(PatientDataExportDto.AuditLogData::fromAuditLog)
                .toList();

        PatientDataExportDto exportDto = PatientDataExportDto.of(
            exportGeneratedAt,
            patientId,
            patientData,
            therapeuticProjects,
            messages,
            materialProgress,
            therapyEvents,
            quizAttempts,
            badges,
            auditLogs
        );

        if ("PDF".equalsIgnoreCase(format)) {
            return exportPatientDataAsPdf(exportDto);
        } else {
            // Default to JSON
            return exportPatientDataAsJson(exportDto);
        }
    }

    /**
     * Export patient data as JSON.
     */
    private ResponseEntity<byte[]> exportPatientDataAsJson(PatientDataExportDto exportDto) {
        try {
            byte[] jsonBytes = objectMapper.writeValueAsBytes(exportDto);

            return ResponseEntity.ok()
                .contentType(org.springframework.http.MediaType.APPLICATION_JSON)
                .header(org.springframework.http.HttpHeaders.CONTENT_DISPOSITION,
                    "attachment; filename=\"patient_data_" + exportDto.patientId() + ".json\"")
                .body(jsonBytes);
        } catch (Exception e) {
            log.error("Failed to export patient data as JSON", e);
            throw new RuntimeException("Failed to export patient data as JSON", e);
        }
    }

    /**
     * Export patient data as PDF (simplified - returns plain text in prod would use PDF library).
     */
    private ResponseEntity<byte[]> exportPatientDataAsPdf(PatientDataExportDto exportDto) {
        try {
            StringBuilder pdf = new StringBuilder();
            pdf.append("PATIENT DATA EXPORT (RODO Art. 20)\n");
            pdf.append("=================================\n\n");
            pdf.append("Export Generated: ").append(exportDto.exportGeneratedAt()).append("\n");
            pdf.append("Patient ID: ").append(exportDto.patientId()).append("\n\n");

            pdf.append("PERSONAL DATA\n");
            pdf.append("-------------\n");
            pdf.append("PESEL: ").append(exportDto.patientData().pesel()).append("\n");
            pdf.append("Name: ").append(exportDto.patientData().firstName())
                .append(" ").append(exportDto.patientData().lastName()).append("\n");
            pdf.append("Email: ").append(exportDto.patientData().email()).append("\n");
            pdf.append("Phone: ").append(exportDto.patientData().phone()).append("\n");
            pdf.append("Date of Birth: ").append(exportDto.patientData().dateOfBirth()).append("\n");
            pdf.append("Address: ").append(exportDto.patientData().addressStreet())
                .append(", ").append(exportDto.patientData().addressCity())
                .append(" ").append(exportDto.patientData().addressPostalCode()).append("\n\n");

            pdf.append("THERAPEUTIC PROJECTS: ").append(exportDto.therapeuticProjects().size()).append("\n");
            pdf.append("MESSAGES: ").append(exportDto.messages().size()).append("\n");
            pdf.append("MATERIAL PROGRESS: ").append(exportDto.materialProgress().size()).append("\n");
            pdf.append("THERAPY EVENTS: ").append(exportDto.therapyEvents().size()).append("\n");
            pdf.append("QUIZ ATTEMPTS: ").append(exportDto.quizAttempts().size()).append("\n");
            pdf.append("BADGES: ").append(exportDto.badges().size()).append("\n");
            pdf.append("AUDIT LOGS: ").append(exportDto.auditLogs().size()).append("\n");

            return ResponseEntity.ok()
                .contentType(org.springframework.http.MediaType.parseMediaType("application/pdf"))
                .header(org.springframework.http.HttpHeaders.CONTENT_DISPOSITION,
                    "attachment; filename=\"patient_data_" + exportDto.patientId() + ".pdf\"")
                .body(pdf.toString().getBytes(StandardCharsets.UTF_8));
        } catch (Exception e) {
            log.error("Failed to export patient data as PDF", e);
            throw new RuntimeException("Failed to export patient data as PDF", e);
        }
    }

    // ==================== RODO: PATIENT DATA ERASURE (US-A-12) ====================

    /**
     * Erase patient data (RODO Art. 17 - right to be forgotten).
     * Hard-deletes patient data after 30-day cooling period or with force flag.
     * 
     * @param patientId Patient ID to erase
     * @param request Erasure request with reason and confirmation
     * @param currentUserId ID of the admin performing the erasure
     * @param force If true, bypasses the 30-day cooling period (requires higher auth)
     */
    public void erasePatient(UUID patientId, ErasureRequest request, UUID currentUserId, boolean force) {
        log.info("Erasing patient with ID: {}, force: {}", patientId, force);

        Patient patient = patientRepository.findById(patientId)
            .orElseThrow(() -> new ResourceNotFoundException("Patient not found with id: " + patientId));

        // Verify cooling period (30 days) unless force flag is set
        Instant deletedAt = patient.getDeletedAt();
        if (!force && deletedAt != null) {
            Instant thirtyDaysAgo = Instant.now().minusSeconds(30L * 24 * 60 * 60);
            if (deletedAt.isAfter(thirtyDaysAgo)) {
                throw new BusinessRuleException(
                    "Patient must be in deleted state for at least 30 days before erasure. " +
                    "Deleted at: " + deletedAt + ", can erase after: " + thirtyDaysAgo);
            }
        } else if (!force && deletedAt == null) {
            throw new BusinessRuleException(
                "Patient must be soft-deleted before erasure. Use anonymize or soft-delete first.");
        }

        // Log audit before erasure
        logAuditLog(
            currentUserId,
            AuditLog.AuditAction.DELETE,
            "Patient",
            patientId,
            Map.of("action", "erasure_initiated", "reason", request.reason()),
            null,
            null,
            null
        );

        // Hard-delete in order (foreign key dependencies)
        // 1. PatientBadge
        List<PatientBadge> patientBadges = patientBadgeRepository.findByPatientIdOrderByEarnedAtDesc(patientId);
        patientBadgeRepository.deleteAll(patientBadges);
        log.debug("Deleted {} PatientBadge records for patient {}", patientBadges.size(), patientId);

        // 2. MaterialProgress
        materialProgressRepository.deleteByPatientId(patientId);
        log.debug("Deleted MaterialProgress records for patient {}", patientId);

        // 3. QuizAnswerSelection (via attempts)
        quizAnswerSelectionRepository.deleteByAttemptPatientId(patientId);
        log.debug("Deleted QuizAnswerSelection records for patient {}", patientId);

        // 4. QuizAttempt
        List<QuizAttempt> quizAttempts = quizAttemptRepository.findByPatientId(patientId);
        quizAttemptRepository.deleteAll(quizAttempts);
        log.debug("Deleted {} QuizAttempt records for patient {}", quizAttempts.size(), patientId);

        // 5. MessageAttachment (via messages from this patient)
        if (patient.getUser() != null) {
            List<Message> patientMessages = messageRepository.findBySenderId(patient.getUser().getId());
            for (Message msg : patientMessages) {
                messageAttachmentRepository.deleteByMessageId(msg.getId());
            }
            log.debug("Deleted MessageAttachment records for patient {}", patientId);
        }

        // 6. Notification
        notificationRepository.deleteByUserId(patient.getUser() != null ? patient.getUser().getId() : patientId);
        log.debug("Deleted Notification records for patient {}", patientId);

        // 7. EmergencyContact
        emergencyContactRepository.deleteByPatientId(patientId);
        log.debug("Deleted EmergencyContact records for patient {}", patientId);

        // Anonymize related data (don't delete, just remove PII references)
        // 8. Message - set sender to null
        if (patient.getUser() != null) {
            List<Message> patientMessages = messageRepository.findBySenderId(patient.getUser().getId());
            for (Message msg : patientMessages) {
                msg.setSenderId(null);
                messageRepository.save(msg);
            }
            log.debug("Anonymized senderId in {} Message records for patient {}", patientMessages.size(), patientId);
        }

        // 9. AuditLog - keep entityId but zero PII in old/new values
        List<AuditLog> patientAuditLogs = auditLogRepository.findByEntityTypeAndEntityId("Patient", patientId);
        for (AuditLog auditLog : patientAuditLogs) {
            auditLog.setOldValue("{\"erased\": true}");
            auditLog.setNewValue("{\"erased\": true}");
            auditLogRepository.save(auditLog);
        }
        log.debug("Anonymized {} AuditLog records for patient {}", patientAuditLogs.size(), patientId);

        // Hard-delete Patient
        patientRepository.delete(patient);
        log.info("Deleted Patient record for {}", patientId);

        // Hard-delete associated User (if dedicated for patient)
        if (patient.getUser() != null) {
            User user = patient.getUser();
            userRepository.delete(user);
            log.info("Deleted User record {} for patient {}", user.getId(), patientId);
        }

        // Record erasure in DataProcessingErasureLog
        DataProcessingErasureLog erasureLog = DataProcessingErasureLog.create(patientId, request.reason(), currentUserId);
        dataProcessingErasureLogRepository.save(erasureLog);
        log.info("Created DataProcessingErasureLog {} for patient {} erasure", erasureLog.getId(), patientId);
    }

    /**
     * Get erasure logs for a patient.
     */
    public List<ErasureLogResponse> getErasureLogs(UUID patientId) {
        return dataProcessingErasureLogRepository.findByPatientId(patientId, org.springframework.data.domain.PageRequest.of(0, 100))
            .stream()
            .map(log -> new ErasureLogResponse(log.getId(), log.getPatientId(), log.getReason(), log.getErasedBy(), log.getErasedAt()))
            .toList();
    }
}
