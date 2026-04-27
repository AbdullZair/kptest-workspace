package com.kptest.application.service;

import com.kptest.api.dto.ActivationCodeResponse;
import com.kptest.api.dto.Clear2faResponse;
import com.kptest.api.dto.ResetPasswordResponse;
import com.kptest.domain.patient.ActivationCode;
import com.kptest.domain.patient.Patient;
import com.kptest.domain.patient.repository.ActivationCodeRepository;
import com.kptest.domain.user.AccountStatus;
import com.kptest.domain.user.User;
import com.kptest.domain.user.UserRepository;
import com.kptest.domain.user.UserRole;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.util.Optional;
import java.util.UUID;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

/**
 * Unit tests for AdminService additional methods.
 */
@ExtendWith(MockitoExtension.class)
class AdminServiceAdditionalTest {

    @Mock
    private UserRepository userRepository;

    @Mock
    private ActivationCodeRepository activationCodeRepository;

    @Mock
    private com.kptest.domain.patient.PatientRepository patientRepository;

    @Mock
    private com.kptest.domain.audit.repository.AuditLogRepository auditLogRepository;

    @Mock
    private com.kptest.domain.audit.repository.SystemLogRepository systemLogRepository;

    @Mock
    private com.kptest.domain.project.ProjectRepository projectRepository;

    @InjectMocks
    private AdminService adminService;

    private User testUser;
    private Patient testPatient;

    @BeforeEach
    void setUp() {
        testUser = new User();
        testUser.setId(UUID.randomUUID());
        testUser.setEmail("doctor@example.com");
        testUser.setRole(UserRole.DOCTOR);
        testUser.setTwoFactorEnabled(true);
        testUser.setTwoFactorSecret("test-secret-123");
        testUser.setStatus(AccountStatus.ACTIVE);

        testPatient = new Patient();
        testPatient.setId(UUID.randomUUID());
        testPatient.setFirstName("Jan");
        testPatient.setLastName("Kowalski");
        testPatient.setPesel("90010112345");
    }

    @Test
    void forcePasswordReset_Success() {
        // Arrange
        when(userRepository.findById(testUser.getId())).thenReturn(Optional.of(testUser));
        when(userRepository.save(any())).thenReturn(testUser);

        // Act
        ResetPasswordResponse response = adminService.forcePasswordReset(testUser.getId(), "Security audit");

        // Assert
        assertNotNull(response);
        assertEquals(testUser.getId().toString(), response.user_id());
        assertTrue(response.message().contains("Security audit"));
        assertNotNull(response.temporary_password());
        verify(userRepository, times(1)).save(testUser);
    }

    @Test
    void forcePasswordReset_PatientAccount_ThrowsException() {
        // Arrange
        testUser.setRole(UserRole.PATIENT);
        when(userRepository.findById(testUser.getId())).thenReturn(Optional.of(testUser));

        // Act & Assert
        assertThrows(IllegalArgumentException.class, () ->
            adminService.forcePasswordReset(testUser.getId(), "Test")
        );
    }

    @Test
    void clear2fa_Success() {
        // Arrange
        when(userRepository.findById(testUser.getId())).thenReturn(Optional.of(testUser));
        when(userRepository.save(any())).thenReturn(testUser);

        // Act
        Clear2faResponse response = adminService.clear2fa(testUser.getId(), "User lost phone");

        // Assert
        assertNotNull(response);
        assertEquals(testUser.getId().toString(), response.user_id());
        assertFalse(testUser.isTwoFactorEnabled());
        assertNull(testUser.getTwoFactorSecret());
        // DOCTOR role requires 2FA, so status should be PENDING_VERIFICATION
        assertEquals(AccountStatus.PENDING_VERIFICATION, testUser.getStatus());
        verify(userRepository, times(1)).save(testUser);
    }

    @Test
    void clear2fa_NonRequiredRole_DoesNotChangeStatus() {
        // Arrange
        testUser.setRole(UserRole.NURSE);
        when(userRepository.findById(testUser.getId())).thenReturn(Optional.of(testUser));
        when(userRepository.save(any())).thenReturn(testUser);

        // Act
        Clear2faResponse response = adminService.clear2fa(testUser.getId(), "Test");

        // Assert
        assertNotNull(response);
        assertFalse(testUser.isTwoFactorEnabled());
        assertEquals(AccountStatus.ACTIVE, testUser.getStatus());
    }

    @Test
    void generateActivationCode_Success() {
        // Arrange
        when(patientRepository.findById(testPatient.getId())).thenReturn(Optional.of(testPatient));
        when(activationCodeRepository.save(any())).thenAnswer(invocation -> {
            ActivationCode code = invocation.getArgument(0);
            code.setId(UUID.randomUUID());
            return code;
        });

        // Act
        ActivationCodeResponse response = adminService.generateActivationCode(testPatient.getId());

        // Assert
        assertNotNull(response);
        assertEquals(testPatient.getId().toString(), response.patientId());
        assertNotNull(response.activationCode());
        assertEquals(8, response.activationCode().length());
        assertNotNull(response.expiresAt());
        assertNotNull(response.pdfUrl());
        verify(activationCodeRepository, times(1)).save(any());
    }

    @Test
    void generateActivationCode_PatientNotFound_ThrowsException() {
        // Arrange
        UUID nonExistentId = UUID.randomUUID();
        when(patientRepository.findById(nonExistentId)).thenReturn(Optional.empty());

        // Act & Assert
        assertThrows(Exception.class, () ->
            adminService.generateActivationCode(nonExistentId)
        );
    }

    @Test
    void generateActivationCode_CodeFormat_IsCorrect() {
        // Arrange
        when(patientRepository.findById(testPatient.getId())).thenReturn(Optional.of(testPatient));
        when(activationCodeRepository.save(any())).thenAnswer(invocation -> {
            ActivationCode code = invocation.getArgument(0);
            code.setId(UUID.randomUUID());
            return code;
        });

        // Act
        ActivationCodeResponse response = adminService.generateActivationCode(testPatient.getId());

        // Assert
        String code = response.activationCode();
        assertEquals(8, code.length());
        // Code should only contain uppercase letters and digits (excluding similar chars)
        assertTrue(code.matches("^[ABCDEFGHJKLMNPQRSTUVWXYZ23456789]{8}$"));
    }
}
