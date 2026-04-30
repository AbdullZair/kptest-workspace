package com.kptest.application.service;

import com.kptest.api.dto.BulkItemResult;
import com.kptest.api.dto.BulkOperationResponse;
import com.kptest.api.dto.BulkPatientRequest;
import com.kptest.domain.patient.Patient;
import com.kptest.domain.patient.PatientRepository;
import com.kptest.domain.user.AccountStatus;
import com.kptest.domain.user.User;
import com.kptest.domain.user.UserRepository;
import com.kptest.exception.BusinessRuleException;
import com.kptest.exception.ResourceNotFoundException;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.ArrayList;
import java.util.List;
import java.util.Locale;
import java.util.UUID;

/**
 * Bulk patient operations service (US-K-05).
 *
 * <p>Coordinates per-item bulk processing for the three supported operations:
 * {@code assign-to-project}, {@code update-status}, {@code anonymize}. Each
 * patient is processed independently — a single failure does not abort the
 * whole batch.</p>
 */
@Slf4j
@Service
@RequiredArgsConstructor
@Transactional
public class PatientBulkService {

    public static final String OP_ASSIGN_TO_PROJECT = "assign-to-project";
    public static final String OP_UPDATE_STATUS = "update-status";
    public static final String OP_ANONYMIZE = "anonymize";

    private final ProjectService projectService;
    private final AdminService adminService;
    private final PatientRepository patientRepository;
    private final UserRepository userRepository;

    /**
     * Execute a bulk operation on the given patients.
     *
     * @param operation operation key (one of {@link #OP_ASSIGN_TO_PROJECT},
     *                  {@link #OP_UPDATE_STATUS}, {@link #OP_ANONYMIZE})
     * @param request bulk request body
     * @param currentUserId UUID of the staff member performing the operation
     * @return aggregated response with per-item results
     * @throws BusinessRuleException if the operation key is unknown or required
     *         fields are missing
     */
    public BulkOperationResponse execute(
        String operation,
        BulkPatientRequest request,
        UUID currentUserId
    ) {
        log.info("Bulk operation '{}' on {} patients (user={})",
            operation, request.patientIds().size(), currentUserId);

        return switch (operation) {
            case OP_ASSIGN_TO_PROJECT -> bulkAssignToProject(request);
            case OP_UPDATE_STATUS -> bulkUpdateStatus(request);
            case OP_ANONYMIZE -> bulkAnonymize(request, currentUserId);
            default -> throw new BusinessRuleException(
                "Unsupported bulk operation: " + operation);
        };
    }

    private BulkOperationResponse bulkAssignToProject(BulkPatientRequest request) {
        if (request.targetProjectId() == null) {
            throw new BusinessRuleException(
                "target_project_id is required for assign-to-project");
        }

        List<BulkItemResult> results = new ArrayList<>(request.patientIds().size());
        for (UUID patientId : request.patientIds()) {
            try {
                List<UUID> assigned = projectService.assignPatients(
                    request.targetProjectId(), List.of(patientId));
                if (assigned.isEmpty()) {
                    // already enrolled — count as success for idempotency
                    log.debug("Patient {} already enrolled in project {}",
                        patientId, request.targetProjectId());
                }
                results.add(BulkItemResult.ok(patientId));
            } catch (Exception ex) {
                log.warn("Bulk assign-to-project failed for patient {}: {}",
                    patientId, ex.getMessage());
                results.add(BulkItemResult.error(patientId, ex.getMessage()));
            }
        }
        return BulkOperationResponse.from(results);
    }

    private BulkOperationResponse bulkUpdateStatus(BulkPatientRequest request) {
        if (request.newStatus() == null || request.newStatus().isBlank()) {
            throw new BusinessRuleException(
                "new_status is required for update-status");
        }

        AccountStatus newStatus;
        try {
            newStatus = AccountStatus.valueOf(request.newStatus().toUpperCase(Locale.ROOT));
        } catch (IllegalArgumentException ex) {
            throw new BusinessRuleException(
                "Invalid new_status: " + request.newStatus()
                    + " (expected ACTIVE|BLOCKED|DEACTIVATED)");
        }

        List<BulkItemResult> results = new ArrayList<>(request.patientIds().size());
        for (UUID patientId : request.patientIds()) {
            try {
                Patient patient = patientRepository.findById(patientId)
                    .orElseThrow(() -> new ResourceNotFoundException(
                        "Patient not found with id: " + patientId));
                User user = patient.getUser();
                if (user == null) {
                    throw new BusinessRuleException(
                        "Patient " + patientId + " has no associated user");
                }
                user.setStatus(newStatus);
                userRepository.save(user);
                results.add(BulkItemResult.ok(patientId));
            } catch (Exception ex) {
                log.warn("Bulk update-status failed for patient {}: {}",
                    patientId, ex.getMessage());
                results.add(BulkItemResult.error(patientId, ex.getMessage()));
            }
        }
        return BulkOperationResponse.from(results);
    }

    private BulkOperationResponse bulkAnonymize(
        BulkPatientRequest request,
        UUID currentUserId
    ) {
        List<BulkItemResult> results = new ArrayList<>(request.patientIds().size());
        for (UUID patientId : request.patientIds()) {
            try {
                adminService.anonymizePatient(patientId, currentUserId);
                results.add(BulkItemResult.ok(patientId));
            } catch (Exception ex) {
                log.warn("Bulk anonymize failed for patient {}: {}",
                    patientId, ex.getMessage());
                results.add(BulkItemResult.error(patientId, ex.getMessage()));
            }
        }
        return BulkOperationResponse.from(results);
    }
}
