package com.kptest.service;

import com.kptest.api.dto.*;
import com.kptest.application.service.AdminService;
import com.kptest.domain.audit.AuditLog;
import com.kptest.domain.audit.SystemLog;
import com.kptest.domain.audit.repository.AuditLogRepository;
import com.kptest.domain.audit.repository.SystemLogRepository;
import com.kptest.domain.patient.PatientRepository;
import com.kptest.domain.project.Project;
import com.kptest.domain.project.ProjectRepository;
import com.kptest.domain.user.AccountStatus;
import com.kptest.domain.user.User;
import com.kptest.domain.user.UserRepository;
import com.kptest.domain.user.UserRole;
import com.kptest.exception.ResourceNotFoundException;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Nested;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.core.io.ByteArrayResource;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;

import java.time.Instant;
import java.util.*;

import static org.assertj.core.api.Assertions.*;
import static org.mockito.ArgumentMatchers.*;
import static org.mockito.BDDMockito.*;

/**
 * Unit tests for AdminService.
 */
@ExtendWith(MockitoExtension.class)
@DisplayName("AdminService Unit Tests")
class AdminServiceTest {

    @Mock
    private UserRepository userRepository;

    @Mock
    private AuditLogRepository auditLogRepository;

    @Mock
    private SystemLogRepository systemLogRepository;

    @Mock
    private ProjectRepository projectRepository;

    @Mock
    private PatientRepository patientRepository;

    private AdminService adminService;

    private User testUser;
    private static final UUID TEST_USER_ID = UUID.randomUUID();

    @BeforeEach
    void setUp() {
        adminService = new AdminService(userRepository, auditLogRepository, systemLogRepository, projectRepository, patientRepository);
        testUser = createTestUser();
    }

    private User createTestUser() {
        User user = User.create("test@example.com", "passwordHash", UserRole.PATIENT);
        user.setId(TEST_USER_ID);
        user.setCreatedAt(Instant.now());
        user.setUpdatedAt(Instant.now());
        return user;
    }

    @Nested
    @DisplayName("Get All Users Tests")
    class GetAllUsersTests {

        @Test
        @DisplayName("shouldGetAllUsers_WithDefaultFilters")
        void shouldGetAllUsers_WithDefaultFilters() {
            // Given
            UserFilters filters = new UserFilters(null, null, null, null, null, null, null);
            Page<User> userPage = new PageImpl<>(List.of(testUser));
            given(userRepository.findAll(any(Pageable.class))).willReturn(userPage);

            // When
            Page<UserAdminDto> result = adminService.getAllUsers(filters);

            // Then
            assertThat(result).isNotNull();
            assertThat(result.getContent()).hasSize(1);
        }

        @Test
        @DisplayName("shouldGetAllUsers_WithRoleFilter")
        void shouldGetAllUsers_WithRoleFilter() {
            // Given
            UserFilters filters = new UserFilters("PATIENT", null, null, null, null, 0, 20);
            Page<User> userPage = new PageImpl<>(List.of(testUser));
            given(userRepository.findAll(any(Pageable.class))).willReturn(userPage);

            // When
            Page<UserAdminDto> result = adminService.getAllUsers(filters);

            // Then
            assertThat(result.getContent()).hasSize(1);
        }

        @Test
        @DisplayName("shouldGetAllUsers_WithStatusFilter")
        void shouldGetAllUsers_WithStatusFilter() {
            // Given
            UserFilters filters = new UserFilters(null, "ACTIVE", null, null, null, 0, 20);
            Page<User> userPage = new PageImpl<>(List.of(testUser));
            given(userRepository.findAll(any(Pageable.class))).willReturn(userPage);

            // When
            Page<UserAdminDto> result = adminService.getAllUsers(filters);

            // Then
            assertThat(result.getContent()).hasSize(1);
        }

        @Test
        @DisplayName("shouldReturnEmptyPage_WhenNoUsersFound")
        void shouldReturnEmptyPage_WhenNoUsersFound() {
            // Given
            UserFilters filters = new UserFilters(null, null, null, null, null, 0, 20);
            Page<User> userPage = new PageImpl<>(Collections.emptyList());
            given(userRepository.findAll(any(Pageable.class))).willReturn(userPage);

            // When
            Page<UserAdminDto> result = adminService.getAllUsers(filters);

            // Then
            assertThat(result.getContent()).isEmpty();
        }
    }

    @Nested
    @DisplayName("Get User By ID Tests")
    class GetUserByIdTests {

        @Test
        @DisplayName("shouldGetUserById_WhenUserExists")
        void shouldGetUserById_WhenUserExists() {
            // Given
            given(userRepository.findById(TEST_USER_ID)).willReturn(Optional.of(testUser));

            // When
            UserAdminDto result = adminService.getUserById(TEST_USER_ID);

            // Then
            assertThat(result).isNotNull();
            assertThat(result.userId()).isEqualTo(TEST_USER_ID.toString());
        }

        @Test
        @DisplayName("shouldThrowResourceNotFoundException_WhenUserNotFound")
        void shouldThrowResourceNotFoundException_WhenUserNotFound() {
            // Given
            given(userRepository.findById(TEST_USER_ID)).willReturn(Optional.empty());

            // When & Then
            assertThatThrownBy(() -> adminService.getUserById(TEST_USER_ID))
                .isInstanceOf(ResourceNotFoundException.class)
                .hasMessageContaining("User not found");
        }
    }

    @Nested
    @DisplayName("Update User Role Tests")
    class UpdateUserRoleTests {

        @Test
        @DisplayName("shouldUpdateUserRole_WhenUserExists")
        void shouldUpdateUserRole_WhenUserExists() {
            // Given
            given(userRepository.findById(TEST_USER_ID)).willReturn(Optional.of(testUser));
            given(userRepository.save(any(User.class))).willReturn(testUser);
            given(auditLogRepository.save(any(AuditLog.class))).willReturn(createTestAuditLog());

            // When
            UserAdminDto result = adminService.updateUserRole(TEST_USER_ID, UserRole.DOCTOR);

            // Then
            assertThat(result).isNotNull();
            assertThat(testUser.getRole()).isEqualTo(UserRole.DOCTOR);
            then(userRepository).should().save(testUser);
        }

        @Test
        @DisplayName("shouldThrowResourceNotFoundException_WhenUserNotFoundForRoleUpdate")
        void shouldThrowResourceNotFoundException_WhenUserNotFoundForRoleUpdate() {
            // Given
            given(userRepository.findById(TEST_USER_ID)).willReturn(Optional.empty());

            // When & Then
            assertThatThrownBy(() -> adminService.updateUserRole(TEST_USER_ID, UserRole.DOCTOR))
                .isInstanceOf(ResourceNotFoundException.class)
                .hasMessageContaining("User not found");
        }
    }

    @Nested
    @DisplayName("Update User Status Tests")
    class UpdateUserStatusTests {

        @Test
        @DisplayName("shouldUpdateUserStatus_WhenUserExists")
        void shouldUpdateUserStatus_WhenUserExists() {
            // Given
            given(userRepository.findById(TEST_USER_ID)).willReturn(Optional.of(testUser));
            given(userRepository.save(any(User.class))).willReturn(testUser);
            given(auditLogRepository.save(any(AuditLog.class))).willReturn(createTestAuditLog());

            // When
            UserAdminDto result = adminService.updateUserStatus(TEST_USER_ID, AccountStatus.BLOCKED);

            // Then
            assertThat(result).isNotNull();
            assertThat(testUser.getStatus()).isEqualTo(AccountStatus.BLOCKED);
        }

        @Test
        @DisplayName("shouldThrowResourceNotFoundException_WhenUserNotFoundForStatusUpdate")
        void shouldThrowResourceNotFoundException_WhenUserNotFoundForStatusUpdate() {
            // Given
            given(userRepository.findById(TEST_USER_ID)).willReturn(Optional.empty());

            // When & Then
            assertThatThrownBy(() -> adminService.updateUserStatus(TEST_USER_ID, AccountStatus.BLOCKED))
                .isInstanceOf(ResourceNotFoundException.class)
                .hasMessageContaining("User not found");
        }
    }

    @Nested
    @DisplayName("Reset Password Tests")
    class ResetPasswordTests {

        @Test
        @DisplayName("shouldResetPassword_WhenUserExists")
        void shouldResetPassword_WhenUserExists() {
            // Given
            given(userRepository.findById(TEST_USER_ID)).willReturn(Optional.of(testUser));
            given(userRepository.save(any(User.class))).willReturn(testUser);
            given(auditLogRepository.save(any(AuditLog.class))).willReturn(createTestAuditLog());

            // When
            ResetPasswordResponse result = adminService.resetPassword(TEST_USER_ID);

            // Then
            assertThat(result).isNotNull();
            assertThat(result.message()).contains("Password has been reset");
            assertThat(result.temporaryPassword()).isNotNull();
        }

        @Test
        @DisplayName("shouldThrowResourceNotFoundException_WhenUserNotFoundForPasswordReset")
        void shouldThrowResourceNotFoundException_WhenUserNotFoundForPasswordReset() {
            // Given
            given(userRepository.findById(TEST_USER_ID)).willReturn(Optional.empty());

            // When & Then
            assertThatThrownBy(() -> adminService.resetPassword(TEST_USER_ID))
                .isInstanceOf(ResourceNotFoundException.class)
                .hasMessageContaining("User not found");
        }
    }

    @Nested
    @DisplayName("Delete User Tests")
    class DeleteUserTests {

        @Test
        @DisplayName("shouldDeleteUser_WhenUserExists")
        void shouldDeleteUser_WhenUserExists() {
            // Given
            given(userRepository.findById(TEST_USER_ID)).willReturn(Optional.of(testUser));
            given(userRepository.save(any(User.class))).willReturn(testUser);
            given(auditLogRepository.save(any(AuditLog.class))).willReturn(createTestAuditLog());

            // When
            adminService.deleteUser(TEST_USER_ID);

            // Then
            assertThat(testUser.getDeletedAt()).isNotNull();
            assertThat(testUser.getStatus()).isEqualTo(AccountStatus.DEACTIVATED);
        }

        @Test
        @DisplayName("shouldThrowResourceNotFoundException_WhenUserNotFoundForDelete")
        void shouldThrowResourceNotFoundException_WhenUserNotFoundForDelete() {
            // Given
            given(userRepository.findById(TEST_USER_ID)).willReturn(Optional.empty());

            // When & Then
            assertThatThrownBy(() -> adminService.deleteUser(TEST_USER_ID))
                .isInstanceOf(ResourceNotFoundException.class)
                .hasMessageContaining("User not found");
        }
    }

    @Nested
    @DisplayName("Get Audit Logs Tests")
    class GetAuditLogsTests {

        @Test
        @DisplayName("shouldGetAuditLogs_WithNoFilters")
        void shouldGetAuditLogs_WithNoFilters() {
            // Given
            AuditLogFilters filters = new AuditLogFilters(null, null, null, null, null, null, 0, 20);
            Page<AuditLog> logPage = new PageImpl<>(List.of(createTestAuditLog()));
            given(auditLogRepository.findAll(any(Pageable.class))).willReturn(logPage);

            // When
            Page<AuditLogResponse> result = adminService.getAuditLogs(filters);

            // Then
            assertThat(result).isNotNull();
            assertThat(result.getContent()).hasSize(1);
        }

        @Test
        @DisplayName("shouldGetAuditLogs_WithUserIdFilter")
        void shouldGetAuditLogs_WithUserIdFilter() {
            // Given
            AuditLogFilters filters = new AuditLogFilters(TEST_USER_ID.toString(), null, null, null, null, null, 0, 20);
            Page<AuditLog> logPage = new PageImpl<>(List.of(createTestAuditLog()));
            given(auditLogRepository.findByUserId(eq(TEST_USER_ID), any(Pageable.class))).willReturn(logPage);

            // When
            Page<AuditLogResponse> result = adminService.getAuditLogs(filters);

            // Then
            assertThat(result.getContent()).hasSize(1);
        }

        @Test
        @DisplayName("shouldGetAuditLogs_WithActionFilter")
        void shouldGetAuditLogs_WithActionFilter() {
            // Given
            AuditLogFilters filters = new AuditLogFilters(null, "CREATE", null, null, null, null, 0, 20);
            Page<AuditLog> logPage = new PageImpl<>(List.of(createTestAuditLog()));
            given(auditLogRepository.findByAction(eq(AuditLog.AuditAction.CREATE), any(Pageable.class))).willReturn(logPage);

            // When
            Page<AuditLogResponse> result = adminService.getAuditLogs(filters);

            // Then
            assertThat(result.getContent()).hasSize(1);
        }

        @Test
        @DisplayName("shouldGetAuditLogs_WithEntityTypeFilter")
        void shouldGetAuditLogs_WithEntityTypeFilter() {
            // Given
            AuditLogFilters filters = new AuditLogFilters(null, null, "User", null, null, null, 0, 20);
            Page<AuditLog> logPage = new PageImpl<>(List.of(createTestAuditLog()));
            given(auditLogRepository.findByEntityType(eq("User"), any(Pageable.class))).willReturn(logPage);

            // When
            Page<AuditLogResponse> result = adminService.getAuditLogs(filters);

            // Then
            assertThat(result.getContent()).hasSize(1);
        }
    }

    @Nested
    @DisplayName("Get System Logs Tests")
    class GetSystemLogsTests {

        @Test
        @DisplayName("shouldGetSystemLogs_WithNoFilters")
        void shouldGetSystemLogs_WithNoFilters() {
            // Given
            SystemLogFilters filters = new SystemLogFilters(null, null, null, null, 0, 20);
            Page<SystemLog> logPage = new PageImpl<>(List.of(createTestSystemLog()));
            given(systemLogRepository.findAll(any(Pageable.class))).willReturn(logPage);

            // When
            Page<SystemLogResponse> result = adminService.getSystemLogs(filters);

            // Then
            assertThat(result).isNotNull();
            assertThat(result.getContent()).hasSize(1);
        }

        @Test
        @DisplayName("shouldGetSystemLogs_WithLevelFilter")
        void shouldGetSystemLogs_WithLevelFilter() {
            // Given
            SystemLogFilters filters = new SystemLogFilters("INFO", null, null, null, 0, 20);
            Page<SystemLog> logPage = new PageImpl<>(List.of(createTestSystemLog()));
            given(systemLogRepository.findByLevel(eq(SystemLog.LogLevel.INFO), any(Pageable.class))).willReturn(logPage);

            // When
            Page<SystemLogResponse> result = adminService.getSystemLogs(filters);

            // Then
            assertThat(result.getContent()).hasSize(1);
        }

        @Test
        @DisplayName("shouldGetSystemLogs_WithSearchFilter")
        void shouldGetSystemLogs_WithSearchFilter() {
            // Given
            SystemLogFilters filters = new SystemLogFilters(null, null, null, "test", 0, 20);
            Page<SystemLog> logPage = new PageImpl<>(List.of(createTestSystemLog()));
            given(systemLogRepository.findAll(any(Pageable.class))).willReturn(logPage);

            // When
            Page<SystemLogResponse> result = adminService.getSystemLogs(filters);

            // Then
            assertThat(result.getContent()).hasSize(1);
        }
    }

    @Nested
    @DisplayName("Export Audit Logs Tests")
    class ExportAuditLogsTests {

        @Test
        @DisplayName("shouldExportAuditLogsToCsv")
        void shouldExportAuditLogsToCsv() {
            // Given
            AuditLogFilters filters = new AuditLogFilters(null, null, null, null, null, null, 0, 20);
            given(auditLogRepository.findAll(any(Sort.class))).willReturn(List.of(createTestAuditLog()));

            // When
            ByteArrayResource result = adminService.exportAuditLogs(filters, "CSV");

            // Then
            assertThat(result).isNotNull();
            assertThat(result.getByteArray()).isNotEmpty();
        }

        @Test
        @DisplayName("shouldExportAuditLogsToJson")
        void shouldExportAuditLogsToJson() {
            // Given
            AuditLogFilters filters = new AuditLogFilters(null, null, null, null, null, null, 0, 20);
            given(auditLogRepository.findAll(any(Sort.class))).willReturn(List.of(createTestAuditLog()));

            // When
            ByteArrayResource result = adminService.exportAuditLogs(filters, "JSON");

            // Then
            assertThat(result).isNotNull();
            assertThat(result.getByteArray()).isNotEmpty();
        }

        @Test
        @DisplayName("shouldExportAuditLogsToCsv_WhenFormatIsUnknown")
        void shouldExportAuditLogsToCsv_WhenFormatIsUnknown() {
            // Given
            AuditLogFilters filters = new AuditLogFilters(null, null, null, null, null, null, 0, 20);
            given(auditLogRepository.findAll(any(Sort.class))).willReturn(List.of(createTestAuditLog()));

            // When
            ByteArrayResource result = adminService.exportAuditLogs(filters, "UNKNOWN");

            // Then
            assertThat(result).isNotNull();
        }
    }

    @Nested
    @DisplayName("Export System Logs Tests")
    class ExportSystemLogsTests {

        @Test
        @DisplayName("shouldExportSystemLogsToCsv")
        void shouldExportSystemLogsToCsv() {
            // Given
            SystemLogFilters filters = new SystemLogFilters(null, null, null, null, 0, 20);
            given(systemLogRepository.findAll(any(Sort.class))).willReturn(List.of(createTestSystemLog()));

            // When
            ByteArrayResource result = adminService.exportSystemLogs(filters, "CSV");

            // Then
            assertThat(result).isNotNull();
            assertThat(result.getByteArray()).isNotEmpty();
        }

        @Test
        @DisplayName("shouldExportSystemLogsToJson")
        void shouldExportSystemLogsToJson() {
            // Given
            SystemLogFilters filters = new SystemLogFilters(null, null, null, null, 0, 20);
            given(systemLogRepository.findAll(any(Sort.class))).willReturn(List.of(createTestSystemLog()));

            // When
            ByteArrayResource result = adminService.exportSystemLogs(filters, "JSON");

            // Then
            assertThat(result).isNotNull();
            assertThat(result.getByteArray()).isNotEmpty();
        }
    }

    @Nested
    @DisplayName("Get System Health Tests")
    class GetSystemHealthTests {

        @Test
        @DisplayName("shouldGetSystemHealth")
        void shouldGetSystemHealth() {
            // Given
            given(userRepository.count()).willReturn(10L);

            // When
            SystemHealthResponse result = adminService.getSystemHealth();

            // Then
            assertThat(result).isNotNull();
            assertThat(result.status()).isIn("UP", "DOWN");
        }
    }

    @Nested
    @DisplayName("Get System Metrics Tests")
    class GetSystemMetricsTests {

        @Test
        @DisplayName("shouldGetSystemMetrics")
        void shouldGetSystemMetrics() {
            // Given
            given(userRepository.count()).willReturn(10L);
            given(projectRepository.count()).willReturn(5L);
            given(patientRepository.count()).willReturn(50L);
            given(userRepository.countActiveByRole(any())).willReturn(5L);

            // When
            SystemMetricsResponse result = adminService.getSystemMetrics();

            // Then
            assertThat(result).isNotNull();
            assertThat(result.memoryUsage()).isNotNull();
            assertThat(result.cpuUsage()).isNotNull();
        }
    }

    @Nested
    @DisplayName("Clear Cache Tests")
    class ClearCacheTests {

        @Test
        @DisplayName("shouldClearCache")
        void shouldClearCache() {
            // When
            Map<String, String> result = adminService.clearCache();

            // Then
            assertThat(result).isNotNull();
            assertThat(result.get("status")).isEqualTo("SUCCESS");
        }
    }

    @Nested
    @DisplayName("Create Backup Tests")
    class CreateBackupTests {

        @Test
        @DisplayName("shouldCreateBackup")
        void shouldCreateBackup() throws Exception {
            // When
            var result = adminService.createBackup().get();

            // Then
            assertThat(result).isNotNull();
            assertThat(result.status()).isEqualTo("COMPLETED");
        }
    }

    @Nested
    @DisplayName("User Entity Tests")
    class UserEntityTests {

        @Test
        @DisplayName("shouldCheckIsLocked_WhenLockedUntilIsNull")
        void shouldCheckIsLocked_WhenLockedUntilIsNull() {
            // Given
            User user = createTestUser();

            // When
            boolean result = user.isLocked();

            // Then
            assertThat(result).isFalse();
        }

        @Test
        @DisplayName("shouldCheckIsLocked_WhenLockedUntilIsPast")
        void shouldCheckIsLocked_WhenLockedUntilIsPast() {
            // Given
            User user = createTestUser();
            user.setLockedUntil(Instant.now().minusSeconds(3600));

            // When
            boolean result = user.isLocked();

            // Then
            assertThat(result).isFalse();
        }

        @Test
        @DisplayName("shouldCheckIsLocked_WhenLockedUntilIsFuture")
        void shouldCheckIsLocked_WhenLockedUntilIsFuture() {
            // Given
            User user = createTestUser();
            user.setLockedUntil(Instant.now().plusSeconds(3600));

            // When
            boolean result = user.isLocked();

            // Then
            assertThat(result).isTrue();
        }

        @Test
        @DisplayName("shouldCheckIsActive_WhenActive")
        void shouldCheckIsActive_WhenActive() {
            // Given
            User user = createTestUser();

            // When
            boolean result = user.isActive();

            // Then
            assertThat(result).isTrue();
        }

        @Test
        @DisplayName("shouldCheckIsActive_WhenBlocked")
        void shouldCheckIsActive_WhenBlocked() {
            // Given
            User user = createTestUser();
            user.setStatus(AccountStatus.BLOCKED);

            // When
            boolean result = user.isActive();

            // Then
            assertThat(result).isFalse();
        }

        @Test
        @DisplayName("shouldIncrementFailedLoginAttempts")
        void shouldIncrementFailedLoginAttempts() {
            // Given
            User user = createTestUser();
            int initialAttempts = user.getFailedLoginAttempts();

            // When
            user.incrementFailedLoginAttempts(5, 30);

            // Then
            assertThat(user.getFailedLoginAttempts()).isEqualTo(initialAttempts + 1);
        }

        @Test
        @DisplayName("shouldLockAccount_WhenMaxAttemptsReached")
        void shouldLockAccount_WhenMaxAttemptsReached() {
            // Given
            User user = createTestUser();
            user.setFailedLoginAttempts(4);

            // When
            user.incrementFailedLoginAttempts(5, 30);

            // Then
            assertThat(user.isLocked()).isTrue();
            assertThat(user.getStatus()).isEqualTo(AccountStatus.BLOCKED);
        }

        @Test
        @DisplayName("shouldResetFailedLoginAttempts")
        void shouldResetFailedLoginAttempts() {
            // Given
            User user = createTestUser();
            user.setFailedLoginAttempts(5);
            user.setStatus(AccountStatus.BLOCKED);
            user.setLockedUntil(Instant.now().plusSeconds(3600));

            // When
            user.resetFailedLoginAttempts();

            // Then
            assertThat(user.getFailedLoginAttempts()).isZero();
            assertThat(user.getLockedUntil()).isNull();
            assertThat(user.getStatus()).isEqualTo(AccountStatus.ACTIVE);
            assertThat(user.getLastLoginAt()).isNotNull();
        }

        @Test
        @DisplayName("shouldDeactivate")
        void shouldDeactivate() {
            // Given
            User user = createTestUser();

            // When
            user.deactivate();

            // Then
            assertThat(user.getDeletedAt()).isNotNull();
            assertThat(user.getStatus()).isEqualTo(AccountStatus.DEACTIVATED);
        }
    }

    private AuditLog createTestAuditLog() {
        AuditLog log = AuditLog.create(TEST_USER_ID, AuditLog.AuditAction.CREATE, "User", TEST_USER_ID);
        log.setId(UUID.randomUUID());
        log.setCreatedAt(Instant.now());
        return log;
    }

    private SystemLog createTestSystemLog() {
        SystemLog log = SystemLog.create(SystemLog.LogLevel.INFO, "Test log message");
        log.setId(UUID.randomUUID());
        log.setCreatedAt(Instant.now());
        return log;
    }
}
