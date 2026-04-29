package com.kptest.application.service;

import com.kptest.api.dto.ApproveVerificationRequest;
import com.kptest.api.dto.HisDemographicsDto;
import com.kptest.api.dto.HisVerificationResult;
import com.kptest.api.dto.PendingVerificationDto;
import com.kptest.api.dto.RejectVerificationRequest;
import com.kptest.api.dto.VerificationDecisionResponse;
import com.kptest.domain.audit.AuditLog;
import com.kptest.domain.audit.repository.AuditLogRepository;
import com.kptest.domain.patient.Patient;
import com.kptest.domain.patient.PatientRepository;
import com.kptest.domain.user.User;
import com.kptest.domain.user.UserRepository;
import com.kptest.domain.user.UserRole;
import com.kptest.domain.user.VerificationStatus;
import com.kptest.exception.BusinessRuleException;
import com.kptest.exception.ResourceNotFoundException;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.Pageable;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyString;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

/**
 * Unit tests for the US-NH-01 verification flow inside {@link PatientService}.
 */
@ExtendWith(MockitoExtension.class)
@DisplayName("PatientService - US-NH-01 staff verification")
class PatientServiceVerificationTest {

    private static final UUID PATIENT_ID = UUID.fromString("11111111-1111-1111-1111-111111111111");
    private static final UUID PERFORMED_BY = UUID.fromString("22222222-2222-2222-2222-222222222222");
    private static final String PESEL = "90010112345";

    @Mock
    private PatientRepository patientRepository;

    @Mock
    private UserRepository userRepository;

    @Mock
    private AuditLogRepository auditLogRepository;

    @Mock
    private HisService hisService;

    @InjectMocks
    private PatientService patientService;

    private Patient pendingPatient;

    @BeforeEach
    void setUp() {
        User user = User.create("john@test.local", "hash", UserRole.PATIENT);
        pendingPatient = Patient.create(user, PESEL, "John", "Kowalski");
        // Use reflection-free approach: id is set by JPA, but for tests we use setter
        pendingPatient.setId(PATIENT_ID);
    }

    // ==================== List pending ====================

    @Test
    @DisplayName("should return paginated pending patients with masked PESEL")
    void shouldReturnPendingPatients_whenStatusIsPending() {
        // given
        Page<Patient> page = new PageImpl<>(List.of(pendingPatient));
        when(patientRepository.findByVerificationStatus(eq(VerificationStatus.PENDING), any(Pageable.class)))
            .thenReturn(page);

        // when
        PatientService.PageResult<PendingVerificationDto> result =
            patientService.findPendingVerifications(0, 20);

        // then
        assertThat(result.content()).hasSize(1);
        PendingVerificationDto dto = result.content().get(0);
        assertThat(dto.patientId()).isEqualTo(PATIENT_ID);
        assertThat(dto.peselMasked()).doesNotContain("9001"); // first 7 digits hidden
        assertThat(dto.peselMasked()).endsWith("2345");
        assertThat(dto.verificationStatus()).isEqualTo(VerificationStatus.PENDING);
    }

    // ==================== Approve - HIS ====================

    @Test
    @DisplayName("should approve patient via HIS when HIS returns MATCHED")
    void shouldApproveViaHis_whenHisMatches() {
        // given
        when(patientRepository.findById(PATIENT_ID)).thenReturn(Optional.of(pendingPatient));
        when(patientRepository.save(any(Patient.class))).thenAnswer(inv -> inv.getArgument(0));
        when(hisService.verifyPatient(eq(PESEL), eq("CART-001")))
            .thenReturn(HisVerificationResult.matched(
                HisDemographicsDto.maskedFrom("John", "Kowalski", PESEL, LocalDate.of(1990, 1, 1))
            ));
        when(auditLogRepository.save(any(AuditLog.class))).thenAnswer(inv -> {
            AuditLog log = inv.getArgument(0);
            log.setId(UUID.randomUUID());
            return log;
        });
        ApproveVerificationRequest request = new ApproveVerificationRequest("HIS", null, "CART-001");

        // when
        VerificationDecisionResponse response =
            patientService.approveVerification(PATIENT_ID, request, PERFORMED_BY);

        // then
        assertThat(response.verificationStatus()).isEqualTo(VerificationStatus.APPROVED);
        assertThat(response.verificationMethod()).isEqualTo("HIS");
        assertThat(response.verifiedBy()).isEqualTo(PERFORMED_BY);
        assertThat(response.verifiedAt()).isNotNull();
        assertThat(pendingPatient.getHisPatientId()).isEqualTo("HIS-" + PESEL);
        verify(hisService).verifyPatient(PESEL, "CART-001");
        verify(auditLogRepository).save(any(AuditLog.class));
    }

    @Test
    @DisplayName("should reject HIS approval when HIS reports NOT_FOUND")
    void shouldThrow_whenHisLookupNotFound() {
        // given
        when(patientRepository.findById(PATIENT_ID)).thenReturn(Optional.of(pendingPatient));
        when(hisService.verifyPatient(eq(PESEL), anyString()))
            .thenReturn(HisVerificationResult.notFound());
        ApproveVerificationRequest request = new ApproveVerificationRequest("HIS", null, "CART-X");

        // when / then
        assertThatThrownBy(() -> patientService.approveVerification(PATIENT_ID, request, PERFORMED_BY))
            .isInstanceOf(BusinessRuleException.class)
            .hasMessageContaining("NOT_FOUND");

        verify(patientRepository, never()).save(any(Patient.class));
    }

    @Test
    @DisplayName("should require his_cart_number when method is HIS")
    void shouldThrow_whenHisMethodHasBlankCartNumber() {
        // given
        when(patientRepository.findById(PATIENT_ID)).thenReturn(Optional.of(pendingPatient));
        ApproveVerificationRequest request = new ApproveVerificationRequest("HIS", null, " ");

        // when / then
        assertThatThrownBy(() -> patientService.approveVerification(PATIENT_ID, request, PERFORMED_BY))
            .isInstanceOf(BusinessRuleException.class)
            .hasMessageContaining("his_cart_number");
    }

    // ==================== Approve - MANUAL ====================

    @Test
    @DisplayName("should approve manually when reason is at least 10 characters")
    void shouldApproveManually_whenReasonIsLongEnough() {
        // given
        when(patientRepository.findById(PATIENT_ID)).thenReturn(Optional.of(pendingPatient));
        when(patientRepository.save(any(Patient.class))).thenAnswer(inv -> inv.getArgument(0));
        when(auditLogRepository.save(any(AuditLog.class))).thenAnswer(inv -> {
            AuditLog log = inv.getArgument(0);
            log.setId(UUID.randomUUID());
            return log;
        });
        ApproveVerificationRequest request = new ApproveVerificationRequest(
            "MANUAL", "Patient confirmed via on-site visit and ID check", null);

        // when
        VerificationDecisionResponse response =
            patientService.approveVerification(PATIENT_ID, request, PERFORMED_BY);

        // then
        assertThat(response.verificationStatus()).isEqualTo(VerificationStatus.APPROVED);
        assertThat(response.verificationMethod()).isEqualTo("MANUAL");
        verify(hisService, never()).verifyPatient(anyString(), anyString());
    }

    @Test
    @DisplayName("should reject manual approval when reason is too short")
    void shouldThrow_whenManualReasonTooShort() {
        // given
        when(patientRepository.findById(PATIENT_ID)).thenReturn(Optional.of(pendingPatient));
        ApproveVerificationRequest request = new ApproveVerificationRequest("MANUAL", "ok", null);

        // when / then
        assertThatThrownBy(() -> patientService.approveVerification(PATIENT_ID, request, PERFORMED_BY))
            .isInstanceOf(BusinessRuleException.class)
            .hasMessageContaining("at least 10 characters");
    }

    // ==================== Reject ====================

    @Test
    @DisplayName("should reject pending patient with valid reason")
    void shouldReject_whenReasonIsValid() {
        // given
        when(patientRepository.findById(PATIENT_ID)).thenReturn(Optional.of(pendingPatient));
        when(patientRepository.save(any(Patient.class))).thenAnswer(inv -> inv.getArgument(0));
        when(auditLogRepository.save(any(AuditLog.class))).thenAnswer(inv -> {
            AuditLog log = inv.getArgument(0);
            log.setId(UUID.randomUUID());
            return log;
        });
        RejectVerificationRequest request = new RejectVerificationRequest(
            "PESEL does not match HIS records and patient could not be reached");

        // when
        VerificationDecisionResponse response =
            patientService.rejectVerification(PATIENT_ID, request, PERFORMED_BY);

        // then
        assertThat(response.verificationStatus()).isEqualTo(VerificationStatus.REJECTED);
        assertThat(response.verificationMethod()).isEqualTo("REJECTED");
        assertThat(response.verifiedBy()).isEqualTo(PERFORMED_BY);
        verify(auditLogRepository).save(any(AuditLog.class));
    }

    @Test
    @DisplayName("should throw when reject reason is too short")
    void shouldThrow_whenRejectReasonTooShort() {
        // given
        when(patientRepository.findById(PATIENT_ID)).thenReturn(Optional.of(pendingPatient));
        RejectVerificationRequest request = new RejectVerificationRequest("nope");

        // when / then
        assertThatThrownBy(() -> patientService.rejectVerification(PATIENT_ID, request, PERFORMED_BY))
            .isInstanceOf(BusinessRuleException.class);
    }

    // ==================== Idempotency / state guards ====================

    @Test
    @DisplayName("should throw ResourceNotFoundException when patient does not exist")
    void shouldThrow_whenPatientNotFound() {
        // given
        when(patientRepository.findById(PATIENT_ID)).thenReturn(Optional.empty());
        ApproveVerificationRequest request = new ApproveVerificationRequest(
            "MANUAL", "Patient identity confirmed in person", null);

        // when / then
        assertThatThrownBy(() -> patientService.approveVerification(PATIENT_ID, request, PERFORMED_BY))
            .isInstanceOf(ResourceNotFoundException.class);
    }

    @Test
    @DisplayName("should throw when patient is not in PENDING state")
    void shouldThrow_whenPatientAlreadyApproved() {
        // given
        pendingPatient.verify(PERFORMED_BY, "MANUAL");
        when(patientRepository.findById(PATIENT_ID)).thenReturn(Optional.of(pendingPatient));
        ApproveVerificationRequest request = new ApproveVerificationRequest(
            "MANUAL", "Patient identity confirmed in person", null);

        // when / then
        assertThatThrownBy(() -> patientService.approveVerification(PATIENT_ID, request, PERFORMED_BY))
            .isInstanceOf(BusinessRuleException.class)
            .hasMessageContaining("not pending verification");
    }

    @Test
    @DisplayName("should throw when rejecting an already-rejected patient")
    void shouldThrow_whenAlreadyRejected() {
        // given
        pendingPatient.reject();
        when(patientRepository.findById(PATIENT_ID)).thenReturn(Optional.of(pendingPatient));
        RejectVerificationRequest request = new RejectVerificationRequest(
            "Re-evaluation found additional concerns");

        // when / then
        assertThatThrownBy(() -> patientService.rejectVerification(PATIENT_ID, request, PERFORMED_BY))
            .isInstanceOf(BusinessRuleException.class);
    }
}
