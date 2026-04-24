package com.kptest.api.controller;

import com.kptest.api.dto.*;
import com.kptest.application.service.ReportService;
import com.kptest.domain.report.ReportType;
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
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.List;
import java.util.Map;
import java.util.UUID;

/**
 * Report REST Controller.
 * Handles all report generation and export operations.
 */
@Slf4j
@RestController
@RequestMapping("/api/v1/reports")
@RequiredArgsConstructor
@Tag(name = "Reports", description = "Report generation and export endpoints")
public class ReportController {

    private final ReportService reportService;

    /**
     * Generate compliance report.
     */
    @GetMapping("/compliance")
    @PreAuthorize("hasAnyRole('ADMIN', 'DOCTOR', 'NURSE', 'THERAPIST')")
    @Operation(summary = "Generate compliance report", description = "Generates a compliance report for a project")
    public ResponseEntity<ComplianceReportDto> getComplianceReport(
        @Parameter(description = "Project ID")
        @RequestParam UUID projectId,

        @Parameter(description = "Date from")
        @RequestParam LocalDate dateFrom,

        @Parameter(description = "Date to")
        @RequestParam LocalDate dateTo
    ) {
        log.info("GET /api/v1/reports/compliance - projectId: {}, dateFrom: {}, dateTo: {}", projectId, dateFrom, dateTo);

        // TODO: Get current user ID from security context
        UUID currentUserId = getCurrentUserId();

        ComplianceReportDto report = reportService.generateComplianceReport(projectId, dateFrom, dateTo, currentUserId);

        return ResponseEntity.ok(report);
    }

    /**
     * Generate patient statistics report.
     */
    @GetMapping("/patients")
    @PreAuthorize("hasAnyRole('ADMIN', 'DOCTOR', 'NURSE', 'THERAPIST')")
    @Operation(summary = "Generate patient statistics report", description = "Generates statistics report for a patient")
    public ResponseEntity<PatientStatsDto> getPatientStatsReport(
        @Parameter(description = "Patient ID")
        @RequestParam UUID patientId,

        @Parameter(description = "Date from")
        @RequestParam(required = false) LocalDate dateFrom,

        @Parameter(description = "Date to")
        @RequestParam(required = false) LocalDate dateTo
    ) {
        log.info("GET /api/v1/reports/patients - patientId: {}", patientId);

        LocalDate from = dateFrom != null ? dateFrom : LocalDate.now().minusMonths(3);
        LocalDate to = dateTo != null ? dateTo : LocalDate.now();

        // TODO: Get current user ID from security context
        UUID currentUserId = getCurrentUserId();

        PatientStatsDto report = reportService.generatePatientStatsReport(patientId, from, to, currentUserId);

        return ResponseEntity.ok(report);
    }

    /**
     * Generate project statistics report.
     */
    @GetMapping("/projects")
    @PreAuthorize("hasAnyRole('ADMIN', 'DOCTOR', 'NURSE', 'THERAPIST')")
    @Operation(summary = "Generate project statistics report", description = "Generates statistics report for a project")
    public ResponseEntity<ProjectStatsDto> getProjectStatsReport(
        @Parameter(description = "Project ID")
        @RequestParam UUID projectId,

        @Parameter(description = "Date from")
        @RequestParam(required = false) LocalDate dateFrom,

        @Parameter(description = "Date to")
        @RequestParam(required = false) LocalDate dateTo
    ) {
        log.info("GET /api/v1/reports/projects - projectId: {}", projectId);

        LocalDate from = dateFrom != null ? dateFrom : LocalDate.now().minusMonths(3);
        LocalDate to = dateTo != null ? dateTo : LocalDate.now();

        // TODO: Get current user ID from security context
        UUID currentUserId = getCurrentUserId();

        ProjectStatsDto report = reportService.generateProjectStatsReport(projectId, from, to, currentUserId);

        return ResponseEntity.ok(report);
    }

    /**
     * Generate material statistics report.
     */
    @GetMapping("/materials")
    @PreAuthorize("hasAnyRole('ADMIN', 'DOCTOR', 'NURSE', 'THERAPIST')")
    @Operation(summary = "Generate material statistics report", description = "Generates statistics report for materials in a project")
    public ResponseEntity<MaterialStatsDto> getMaterialStatsReport(
        @Parameter(description = "Project ID")
        @RequestParam UUID projectId,

        @Parameter(description = "Date from")
        @RequestParam(required = false) LocalDate dateFrom,

        @Parameter(description = "Date to")
        @RequestParam(required = false) LocalDate dateTo
    ) {
        log.info("GET /api/v1/reports/materials - projectId: {}", projectId);

        LocalDate from = dateFrom != null ? dateFrom : LocalDate.now().minusMonths(3);
        LocalDate to = dateTo != null ? dateTo : LocalDate.now();

        // TODO: Get current user ID from security context
        UUID currentUserId = getCurrentUserId();

        MaterialStatsDto report = reportService.generateMaterialStatsReport(projectId, from, to, currentUserId);

        return ResponseEntity.ok(report);
    }

    /**
     * Get dashboard KPIs.
     */
    @GetMapping("/dashboard")
    @PreAuthorize("hasAnyRole('ADMIN', 'DOCTOR', 'NURSE', 'THERAPIST')")
    @Operation(summary = "Get dashboard KPIs", description = "Returns key performance indicators for the dashboard")
    public ResponseEntity<DashboardKpiDto> getDashboardKpis() {
        log.info("GET /api/v1/reports/dashboard");

        // TODO: Get current user ID from security context
        UUID currentUserId = getCurrentUserId();

        DashboardKpiDto kpis = reportService.generateDashboardKPIs(currentUserId);

        return ResponseEntity.ok(kpis);
    }

    /**
     * Export report to PDF or Excel.
     */
    @PostMapping("/export")
    @PreAuthorize("hasAnyRole('ADMIN', 'DOCTOR', 'NURSE', 'THERAPIST')")
    @Operation(summary = "Export report", description = "Exports a report to PDF or Excel format")
    public ResponseEntity<ByteArrayResource> exportReport(
        @Parameter(description = "Export request")
        @Valid @RequestBody ExportRequest request
    ) {
        log.info("POST /api/v1/reports/export - type: {}, format: {}", request.reportType(), request.format());

        Object reportData = getReportData(request);

        ByteArrayResource resource;
        String contentType;
        String fileExtension;

        if ("EXCEL".equalsIgnoreCase(request.format())) {
            resource = reportService.exportToExcel(reportData, request.reportType().name());
            contentType = "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet";
            fileExtension = "xlsx";
        } else {
            resource = reportService.exportToPDF(reportData, request.reportType().name());
            contentType = "application/pdf";
            fileExtension = "pdf";
        }

        String fileName = String.format("report_%s_%s.%s", 
            request.reportType().name().toLowerCase(),
            LocalDate.now().toString(),
            fileExtension
        );

        return ResponseEntity.ok()
            .contentType(MediaType.parseMediaType(contentType))
            .header(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=\"" + fileName + "\"")
            .body(resource);
    }

    /**
     * Get report history.
     */
    @GetMapping("/history")
    @PreAuthorize("hasAnyRole('ADMIN', 'DOCTOR', 'NURSE', 'THERAPIST')")
    @Operation(summary = "Get report history", description = "Returns history of generated reports")
    public ResponseEntity<List<ReportHistoryResponse>> getReportHistory(
        @Parameter(description = "Filter by report type")
        @RequestParam(required = false) ReportType type
    ) {
        log.info("GET /api/v1/reports/history - type: {}", type);

        // TODO: Get current user ID from security context
        UUID currentUserId = getCurrentUserId();

        List<ReportHistoryResponse> history = reportService.getReportHistory(currentUserId, type);

        return ResponseEntity.ok(history);
    }

    /**
     * Get current user ID from security context.
     * TODO: Implement proper security context extraction
     */
    private UUID getCurrentUserId() {
        // Placeholder - should extract from authentication token
        return UUID.randomUUID();
    }

    /**
     * Get report data based on export request.
     */
    private Object getReportData(ExportRequest request) {
        LocalDate from = request.dateFrom() != null ? request.dateFrom() : LocalDate.now().minusMonths(3);
        LocalDate to = request.dateTo() != null ? request.dateTo() : LocalDate.now();
        UUID currentUserId = getCurrentUserId();

        return switch (request.reportType()) {
            case COMPLIANCE -> {
                if (request.projectId() == null) {
                    throw new IllegalArgumentException("Project ID is required for compliance report");
                }
                yield reportService.generateComplianceReport(request.projectId(), from, to, currentUserId);
            }
            case PATIENT_STATS -> {
                if (request.patientId() == null) {
                    throw new IllegalArgumentException("Patient ID is required for patient stats report");
                }
                yield reportService.generatePatientStatsReport(request.patientId(), from, to, currentUserId);
            }
            case PROJECT_STATS -> {
                if (request.projectId() == null) {
                    throw new IllegalArgumentException("Project ID is required for project stats report");
                }
                yield reportService.generateProjectStatsReport(request.projectId(), from, to, currentUserId);
            }
            case MATERIAL_STATS -> {
                if (request.projectId() == null) {
                    throw new IllegalArgumentException("Project ID is required for material stats report");
                }
                yield reportService.generateMaterialStatsReport(request.projectId(), from, to, currentUserId);
            }
        };
    }
}
