package com.kptest.api.controller;

import com.kptest.api.dto.ApproveVerificationRequest;
import com.kptest.api.dto.PendingVerificationDto;
import com.kptest.api.dto.RejectVerificationRequest;
import com.kptest.api.dto.VerificationDecisionResponse;
import com.kptest.application.service.AdminService;
import com.kptest.application.service.PatientService;
import com.kptest.domain.user.VerificationStatus;
import com.kptest.exception.BusinessRuleException;
import org.junit.jupiter.api.AfterEach;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.ArgumentCaptor;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.context.SecurityContext;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.context.SecurityContextImpl;

import java.time.Instant;
import java.util.List;
import java.util.UUID;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

/**
 * Controller tests for the US-NH-01 staff-verification endpoints in
 * {@link AdminController}.
 *
 * <p>Direct method invocation is preferred over MockMvc here because the
 * existing controller-slice configuration ({@code WebMvcTestConfig}) does
 * not wire Spring Security, and the {@code @PreAuthorize} role check is
 * therefore not exercised in unit tests. Role-based access is covered
 * end-to-end by the Playwright suite.</p>
 */
@ExtendWith(MockitoExtension.class)
@DisplayName("AdminController US-NH-01 Verification Tests")
class AdminControllerVerificationTest {

    @Mock
    private AdminService adminService;

    @Mock
    private PatientService patientService;

    private AdminController controller;

    @BeforeEach
    void setUp() {
        controller = new AdminController(adminService, patientService);
        UUID userId = UUID.fromString("99999999-9999-9999-9999-999999999999");
        SecurityContext context = new SecurityContextImpl();
        context.setAuthentication(new UsernamePasswordAuthenticationToken(
            userId.toString(),
            "n/a",
            List.of(new SimpleGrantedAuthority("ROLE_ADMIN"))
        ));
        SecurityContextHolder.setContext(context);
    }

    @AfterEach
    void tearDown() {
        SecurityContextHolder.clearContext();
    }

    // ==================== GET /admin/patients/pending ====================

    @Test
    @DisplayName("should return paginated pending verifications")
    void shouldReturnPendingVerifications() {
        // given
        UUID patientId = UUID.randomUUID();
        PendingVerificationDto dto = new PendingVerificationDto(
            patientId,
            "Anna",
            "Nowak",
            "*******1234",
            "anna@test.local",
            "+48123456789",
            VerificationStatus.PENDING,
            null,
            Instant.now()
        );
        PatientService.PageResult<PendingVerificationDto> page =
            new PatientService.PageResult<>(List.of(dto), 0, 20, 1L, 1, true, true);
        when(patientService.findPendingVerifications(0, 20)).thenReturn(page);

        // when
        ResponseEntity<AdminController.PageResponse<PendingVerificationDto>> response =
            controller.getPendingVerifications(0, 20);

        // then
        assertThat(response.getStatusCode()).isEqualTo(HttpStatus.OK);
        assertThat(response.getBody()).isNotNull();
        assertThat(response.getBody().content()).hasSize(1);
        assertThat(response.getBody().content().get(0).peselMasked()).isEqualTo("*******1234");
        assertThat(response.getBody().totalElements()).isEqualTo(1L);
        verify(patientService).findPendingVerifications(0, 20);
    }

    @Test
    @DisplayName("should pass through pagination defaults to service")
    void shouldUseDefaultPagination() {
        // given
        when(patientService.findPendingVerifications(0, 20))
            .thenReturn(new PatientService.PageResult<>(List.of(), 0, 20, 0, 0, true, true));

        // when
        controller.getPendingVerifications(0, 20);

        // then
        verify(patientService).findPendingVerifications(0, 20);
    }

    // ==================== POST /admin/patients/{id}/approve ====================

    @Test
    @DisplayName("should approve patient verification via HIS and propagate user id from security context")
    void shouldApproveViaHis_andPropagateUserId() {
        // given
        UUID patientId = UUID.randomUUID();
        UUID adminId = UUID.fromString("99999999-9999-9999-9999-999999999999");
        VerificationDecisionResponse svcResponse = new VerificationDecisionResponse(
            patientId,
            VerificationStatus.APPROVED,
            "HIS",
            Instant.now(),
            adminId,
            UUID.randomUUID(),
            "Patient verification approved (HIS)"
        );
        when(patientService.approveVerification(eq(patientId), any(ApproveVerificationRequest.class), eq(adminId)))
            .thenReturn(svcResponse);
        ApproveVerificationRequest request = new ApproveVerificationRequest("HIS", null, "CART-001");

        // when
        ResponseEntity<VerificationDecisionResponse> response =
            controller.approveVerification(patientId, request);

        // then
        assertThat(response.getStatusCode()).isEqualTo(HttpStatus.OK);
        assertThat(response.getBody()).isNotNull();
        assertThat(response.getBody().verificationStatus()).isEqualTo(VerificationStatus.APPROVED);
        assertThat(response.getBody().verificationMethod()).isEqualTo("HIS");

        ArgumentCaptor<ApproveVerificationRequest> captor =
            ArgumentCaptor.forClass(ApproveVerificationRequest.class);
        verify(patientService).approveVerification(eq(patientId), captor.capture(), eq(adminId));
        assertThat(captor.getValue().method()).isEqualTo("HIS");
        assertThat(captor.getValue().hisCartNumber()).isEqualTo("CART-001");
    }

    @Test
    @DisplayName("should approve patient verification manually with reason")
    void shouldApproveManually_withReason() {
        // given
        UUID patientId = UUID.randomUUID();
        VerificationDecisionResponse svcResponse = new VerificationDecisionResponse(
            patientId,
            VerificationStatus.APPROVED,
            "MANUAL",
            Instant.now(),
            UUID.randomUUID(),
            UUID.randomUUID(),
            "Patient verification approved (MANUAL)"
        );
        when(patientService.approveVerification(eq(patientId), any(ApproveVerificationRequest.class), any()))
            .thenReturn(svcResponse);
        ApproveVerificationRequest request = new ApproveVerificationRequest(
            "MANUAL", "On-site identity verification with passport", null);

        // when
        ResponseEntity<VerificationDecisionResponse> response =
            controller.approveVerification(patientId, request);

        // then
        assertThat(response.getStatusCode()).isEqualTo(HttpStatus.OK);
        assertThat(response.getBody().verificationMethod()).isEqualTo("MANUAL");
    }

    @Test
    @DisplayName("should propagate BusinessRuleException when service rejects request")
    void shouldPropagateBusinessRuleException() {
        // given
        UUID patientId = UUID.randomUUID();
        when(patientService.approveVerification(eq(patientId), any(ApproveVerificationRequest.class), any()))
            .thenThrow(new BusinessRuleException("Manual approval requires a reason of at least 10 characters"));
        ApproveVerificationRequest request = new ApproveVerificationRequest("MANUAL", "ok", null);

        // when / then
        assertThatThrownBy(() -> controller.approveVerification(patientId, request))
            .isInstanceOf(BusinessRuleException.class);
    }

    // ==================== POST /admin/patients/{id}/reject ====================

    @Test
    @DisplayName("should reject patient verification with valid reason")
    void shouldRejectPatientVerification_withValidReason() {
        // given
        UUID patientId = UUID.randomUUID();
        VerificationDecisionResponse svcResponse = new VerificationDecisionResponse(
            patientId,
            VerificationStatus.REJECTED,
            "REJECTED",
            Instant.now(),
            UUID.randomUUID(),
            UUID.randomUUID(),
            "Patient verification rejected"
        );
        when(patientService.rejectVerification(eq(patientId), any(RejectVerificationRequest.class), any()))
            .thenReturn(svcResponse);
        RejectVerificationRequest request = new RejectVerificationRequest(
            "Patient PESEL does not match HIS records and could not be reached");

        // when
        ResponseEntity<VerificationDecisionResponse> response =
            controller.rejectVerification(patientId, request);

        // then
        assertThat(response.getStatusCode()).isEqualTo(HttpStatus.OK);
        assertThat(response.getBody().verificationStatus()).isEqualTo(VerificationStatus.REJECTED);
        verify(patientService).rejectVerification(eq(patientId), any(RejectVerificationRequest.class), any());
    }

    @Test
    @DisplayName("should propagate BusinessRuleException from service when rejecting non-pending patient")
    void shouldPropagateException_whenServiceRejects() {
        // given
        UUID patientId = UUID.randomUUID();
        RejectVerificationRequest request = new RejectVerificationRequest("Valid reason for rejection");
        when(patientService.rejectVerification(eq(patientId), any(RejectVerificationRequest.class), any()))
            .thenThrow(new BusinessRuleException("Patient is not pending verification (current status: APPROVED)"));

        // when / then
        assertThatThrownBy(() -> controller.rejectVerification(patientId, request))
            .isInstanceOf(BusinessRuleException.class)
            .hasMessageContaining("not pending verification");

        verify(patientService).rejectVerification(eq(patientId), any(RejectVerificationRequest.class), any());
    }

    @Test
    @DisplayName("should not invoke service for approve when controller is not called")
    void shouldNotCallService_whenNotInvoked() {
        verify(patientService, never()).approveVerification(any(), any(), any());
        verify(patientService, never()).rejectVerification(any(), any(), any());
    }
}
