package com.kptest.application.service;

import com.kptest.api.dto.*;
import com.kptest.domain.material.EducationalMaterial;
import com.kptest.domain.material.MaterialProgress;
import com.kptest.domain.material.repository.EducationalMaterialRepository;
import com.kptest.domain.material.repository.MaterialProgressRepository;
import com.kptest.domain.message.Message;
import com.kptest.domain.message.repository.MessageRepository;
import com.kptest.domain.patient.Patient;
import com.kptest.domain.patient.PatientRepository;
import com.kptest.domain.project.*;
import com.kptest.domain.report.Report;
import com.kptest.domain.report.ReportType;
import com.kptest.domain.report.repository.ReportRepository;
import com.kptest.domain.schedule.TherapyEvent;
import com.kptest.domain.schedule.repository.TherapyEventRepository;
import com.kptest.domain.staff.Staff;
import com.kptest.domain.staff.StaffRepository;
import com.kptest.domain.user.User;
import com.kptest.domain.user.UserRepository;
import com.kptest.exception.ResourceNotFoundException;
import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.ObjectMapper;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.core.io.ByteArrayResource;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.io.ByteArrayOutputStream;
import java.io.IOException;
import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.Instant;
import java.time.LocalDate;
import java.time.ZoneId;
import java.time.format.DateTimeFormatter;
import java.time.temporal.ChronoUnit;
import java.util.*;
import java.util.stream.Collectors;

/**
 * Report service handling all report generation operations.
 */
@Slf4j
@Service
@RequiredArgsConstructor
@Transactional
public class ReportService {

    private final ReportRepository reportRepository;
    private final ProjectRepository projectRepository;
    private final PatientRepository patientRepository;
    private final PatientProjectRepository patientProjectRepository;
    private final ProjectTeamRepository projectTeamRepository;
    private final TherapyEventRepository therapyEventRepository;
    private final EducationalMaterialRepository educationalMaterialRepository;
    private final MaterialProgressRepository materialProgressRepository;
    private final MessageRepository messageRepository;
    private final StaffRepository staffRepository;
    private final UserRepository userRepository;
    private final ObjectMapper objectMapper;

    private static final DateTimeFormatter DATE_FORMATTER = DateTimeFormatter.ofPattern("yyyy-MM-dd");

    /**
     * Generate compliance report for a project.
     */
    @Transactional(readOnly = true)
    public ComplianceReportDto generateComplianceReport(UUID projectId, LocalDate dateFrom, LocalDate dateTo, UUID generatedBy) {
        log.info("Generating compliance report for project: {}, dateFrom: {}, dateTo: {}", projectId, dateFrom, dateTo);

        Project project = projectRepository.findById(projectId)
            .orElseThrow(() -> new ResourceNotFoundException("Project not found with id: " + projectId));

        List<PatientProject> patientProjects = patientProjectRepository.findActiveByProjectId(projectId);

        // Calculate overall compliance
        Double overallCompliance = patientProjects.stream()
            .filter(pp -> pp.getComplianceScore() != null)
            .mapToDouble(pp -> pp.getComplianceScore().doubleValue())
            .average()
            .orElse(0.0);

        Integer complianceThreshold = project.getComplianceThreshold() != null ? project.getComplianceThreshold() : 80;
        Boolean isCompliant = overallCompliance >= complianceThreshold;

        // Calculate task statistics
        List<TherapyEvent> events = therapyEventRepository.findByProjectIdAndDateRange(
            projectId, 
            dateFrom.atStartOfDay(ZoneId.systemDefault()).toInstant(), 
            dateTo.atTime(23, 59, 59).atZone(ZoneId.systemDefault()).toInstant()
        );
        Integer totalTasks = events.size();
        Integer completedTasks = (int) events.stream()
            .filter(e -> e.getStatus() == com.kptest.domain.schedule.EventStatus.COMPLETED)
            .count();
        Integer overdueTasks = (int) events.stream()
            .filter(e -> e.getStatus() != com.kptest.domain.schedule.EventStatus.COMPLETED)
            .filter(e -> e.getScheduledAt().isBefore(java.time.Instant.now()))
            .count();

        // Compliance by stage
        Map<TherapyStage, Double> complianceByStageRaw = patientProjects.stream()
            .filter(pp -> pp.getComplianceScore() != null)
            .collect(Collectors.groupingBy(
                PatientProject::getCurrentStage,
                Collectors.averagingDouble(pp -> pp.getComplianceScore().doubleValue())
            ));

        Map<String, Double> complianceByStage = complianceByStageRaw.entrySet().stream()
            .collect(Collectors.toMap(
                e -> e.getKey().name(),
                Map.Entry::getValue
            ));

        // Compliance trend (last 30 days)
        List<ComplianceReportDto.ComplianceTrendEntry> complianceTrend = generateComplianceTrend(patientProjects, dateFrom, dateTo);

        // Non-compliant items
        List<ComplianceReportDto.NonCompliantItem> nonCompliantItems = findNonCompliantItems(patientProjects, project.getComplianceThreshold());

        ComplianceReportDto report = ComplianceReportDto.builder()
            .projectId(projectId)
            .projectName(project.getName())
            .dateFrom(dateFrom.format(DATE_FORMATTER))
            .dateTo(dateTo.format(DATE_FORMATTER))
            .overallCompliance(round(overallCompliance, 2))
            .complianceThreshold(complianceThreshold)
            .isCompliant(isCompliant)
            .totalTasks(totalTasks)
            .completedTasks(completedTasks)
            .overdueTasks(overdueTasks)
            .complianceByStage(complianceByStage)
            .complianceTrend(complianceTrend)
            .nonCompliantItems(nonCompliantItems)
            .build();

        // Save report history
        saveReport(ReportType.COMPLIANCE, projectId, null, dateFrom, dateTo, report, generatedBy);

        return report;
    }

    /**
     * Generate patient statistics report.
     */
    @Transactional(readOnly = true)
    public PatientStatsDto generatePatientStatsReport(UUID patientId, LocalDate dateFrom, LocalDate dateTo, UUID generatedBy) {
        log.info("Generating patient stats report for patient: {}", patientId);

        Patient patient = patientRepository.findById(patientId)
            .orElseThrow(() -> new ResourceNotFoundException("Patient not found with id: " + patientId));

        List<PatientProject> patientProjects = patientProjectRepository.findByPatientId(patientId);
        List<PatientProject> activeProjects = patientProjects.stream()
            .filter(PatientProject::isActive)
            .toList();

        // Overall compliance
        Double overallCompliance = patientProjects.stream()
            .filter(pp -> pp.getComplianceScore() != null)
            .mapToDouble(pp -> pp.getComplianceScore().doubleValue())
            .average()
            .orElse(0.0);

        // Session statistics
        List<TherapyEvent> patientEvents = therapyEventRepository.findByPatientId(patientId);
        Integer totalSessions = patientEvents.size();
        Integer attendedSessions = (int) patientEvents.stream()
            .filter(e -> e.getStatus() == com.kptest.domain.schedule.EventStatus.COMPLETED)
            .count();
        Integer missedSessions = (int) patientEvents.stream()
            .filter(e -> e.getStatus() == com.kptest.domain.schedule.EventStatus.MISSED)
            .count();
        Double sessionAttendanceRate = totalSessions > 0 
            ? (double) attendedSessions / totalSessions * 100 
            : 0.0;

        // Material statistics
        List<MaterialProgress> materialProgresses = materialProgressRepository.findByPatientId(patientId);
        Integer materialsCompleted = (int) materialProgresses.stream()
            .filter(mp -> mp.getStatus() == MaterialProgress.MaterialStatus.COMPLETED)
            .count();
        Integer materialsInProgress = (int) materialProgresses.stream()
            .filter(mp -> mp.getStatus() == MaterialProgress.MaterialStatus.IN_PROGRESS)
            .count();

        // Message statistics
        Integer messagesSent = messageRepository.countByPatientId(patientId);
        Integer messagesReceived = messageRepository.countByRecipientPatientId(patientId);

        // Project stats
        List<PatientStatsDto.ProjectStatEntry> projectStats = patientProjects.stream()
            .map(pp -> {
                Project project = pp.getProject();
                return new PatientStatsDto.ProjectStatEntry(
                    project.getId(),
                    project.getName(),
                    project.getStatus().name(),
                    pp.getComplianceScore() != null ? pp.getComplianceScore().doubleValue() : 0.0,
                    pp.getCurrentStage().name(),
                    pp.getEnrolledAt().atZone(ZoneId.systemDefault()).toLocalDate().format(DATE_FORMATTER)
                );
            })
            .toList();

        // Compliance history
        List<PatientStatsDto.ComplianceHistoryEntry> complianceHistory = patientProjects.stream()
            .filter(pp -> pp.getComplianceScore() != null)
            .map(pp -> new PatientStatsDto.ComplianceHistoryEntry(
                pp.getUpdatedAt().atZone(ZoneId.systemDefault()).toLocalDate().format(DATE_FORMATTER),
                pp.getComplianceScore().doubleValue()
            ))
            .limit(30)
            .toList();

        PatientStatsDto report = PatientStatsDto.builder()
            .patientId(patientId)
            .patientName(patient.getFirstName() + " " + patient.getLastName())
            .pesel(patient.getPesel())
            .totalProjects(patientProjects.size())
            .activeProjects(activeProjects.size())
            .completedProjects((int) patientProjects.stream()
                .filter(pp -> pp.getCurrentStage() == TherapyStage.COMPLETED)
                .count())
            .overallCompliance(round(overallCompliance, 2))
            .totalSessions(totalSessions)
            .attendedSessions(attendedSessions)
            .missedSessions(missedSessions)
            .sessionAttendanceRate(round(sessionAttendanceRate, 2))
            .materialsCompleted(materialsCompleted)
            .materialsInProgress(materialsInProgress)
            .messagesSent(messagesSent)
            .messagesReceived(messagesReceived)
            .projectStats(projectStats)
            .complianceHistory(complianceHistory)
            .build();

        // Save report history
        saveReport(ReportType.PATIENT_STATS, null, patientId, dateFrom, dateTo, report, generatedBy);

        return report;
    }

    /**
     * Generate project statistics report.
     */
    @Transactional(readOnly = true)
    public ProjectStatsDto generateProjectStatsReport(UUID projectId, LocalDate dateFrom, LocalDate dateTo, UUID generatedBy) {
        log.info("Generating project stats report for project: {}", projectId);

        Project project = projectRepository.findById(projectId)
            .orElseThrow(() -> new ResourceNotFoundException("Project not found with id: " + projectId));

        List<PatientProject> allPatientProjects = patientProjectRepository.findByPatientId(projectId);
        List<PatientProject> activePatientProjects = patientProjectRepository.findActiveByProjectId(projectId);

        // Patient counts
        long totalPatients = allPatientProjects.size();
        long activePatients = activePatientProjects.size();
        long completedPatients = activePatientProjects.stream()
            .filter(pp -> pp.getCurrentStage() == TherapyStage.COMPLETED)
            .count();
        long removedPatients = allPatientProjects.stream()
            .filter(pp -> pp.getLeftAt() != null)
            .count();

        // Average compliance
        Double averageCompliance = activePatientProjects.stream()
            .filter(pp -> pp.getComplianceScore() != null)
            .mapToDouble(pp -> pp.getComplianceScore().doubleValue())
            .average()
            .orElse(0.0);

        Integer complianceThreshold = project.getComplianceThreshold() != null ? project.getComplianceThreshold() : 80;
        Boolean isCompliant = averageCompliance >= complianceThreshold;

        // Team size
        long teamSize = projectTeamRepository.countByProjectId(projectId);

        // Stage distribution
        Map<TherapyStage, Long> stageDistributionRaw = activePatientProjects.stream()
            .collect(Collectors.groupingBy(
                PatientProject::getCurrentStage,
                Collectors.counting()
            ));

        Map<TherapyStage, Integer> stageDistribution = stageDistributionRaw.entrySet().stream()
            .collect(Collectors.toMap(
                Map.Entry::getKey,
                e -> e.getValue().intValue()
            ));

        // Compliance by patient
        List<ProjectStatsDto.PatientComplianceEntry> complianceByPatient = activePatientProjects.stream()
            .filter(pp -> pp.getComplianceScore() != null)
            .map(pp -> {
                Patient patient = pp.getPatient();
                return new ProjectStatsDto.PatientComplianceEntry(
                    patient.getId(),
                    patient.getFirstName() + " " + patient.getLastName(),
                    pp.getComplianceScore().doubleValue(),
                    pp.getCurrentStage()
                );
            })
            .toList();

        // Recent events
        List<TherapyEvent> recentEvents = therapyEventRepository.findTop10ByProjectIdOrderByScheduledDateDesc(projectId);
        List<ProjectStatsDto.RecentEventEntry> recentEventsDto = recentEvents.stream()
            .map(e -> new ProjectStatsDto.RecentEventEntry(
                e.getId(),
                e.getType().name(),
                e.getTitle(),
                e.getScheduledAt().atZone(ZoneId.systemDefault()).toLocalDate().format(DATE_FORMATTER),
                e.getStatus().name()
            ))
            .toList();

        ProjectStatsDto report = ProjectStatsDto.builder()
            .projectId(projectId)
            .projectName(project.getName())
            .status(project.getStatus())
            .startDate(project.getStartDate().atZone(ZoneId.systemDefault()).toLocalDate().format(DATE_FORMATTER))
            .endDate(project.getEndDate() != null 
                ? project.getEndDate().atZone(ZoneId.systemDefault()).toLocalDate().format(DATE_FORMATTER) 
                : null)
            .totalPatients((int) totalPatients)
            .activePatients((int) activePatients)
            .completedPatients((int) completedPatients)
            .removedPatients((int) removedPatients)
            .averageCompliance(round(averageCompliance, 2))
            .complianceThreshold(complianceThreshold)
            .isCompliant(isCompliant)
            .teamSize((int) teamSize)
            .stageDistribution(stageDistribution)
            .complianceByPatient(complianceByPatient)
            .recentEvents(recentEventsDto)
            .build();

        // Save report history
        saveReport(ReportType.PROJECT_STATS, projectId, null, dateFrom, dateTo, report, generatedBy);

        return report;
    }

    /**
     * Generate material statistics report.
     */
    @Transactional(readOnly = true)
    public MaterialStatsDto generateMaterialStatsReport(UUID projectId, LocalDate dateFrom, LocalDate dateTo, UUID generatedBy) {
        log.info("Generating material stats report for project: {}", projectId);

        Project project = projectRepository.findById(projectId)
            .orElseThrow(() -> new ResourceNotFoundException("Project not found with id: " + projectId));

        List<PatientProject> activePatientProjects = patientProjectRepository.findActiveByProjectId(projectId);
        Set<UUID> patientIds = activePatientProjects.stream()
            .map(pp -> pp.getPatient().getId())
            .collect(Collectors.toSet());

        // Get all materials assigned to patients in this project
        List<MaterialProgress> allProgresses = materialProgressRepository.findByPatientIdIn(new java.util.ArrayList<>(patientIds));
        List<EducationalMaterial> allMaterials = educationalMaterialRepository.findAll();

        Integer totalMaterials = allMaterials.size();
        Integer materialsAssigned = (int) allProgresses.stream()
            .map(MaterialProgress::getMaterialId)
            .distinct()
            .count();
        Integer materialsCompleted = (int) allProgresses.stream()
            .filter(mp -> mp.getStatus() == MaterialProgress.MaterialStatus.COMPLETED)
            .map(MaterialProgress::getMaterialId)
            .distinct()
            .count();
        Integer materialsInProgress = (int) allProgresses.stream()
            .filter(mp -> mp.getStatus() == MaterialProgress.MaterialStatus.IN_PROGRESS)
            .map(MaterialProgress::getMaterialId)
            .distinct()
            .count();
        Integer materialsNotStarted = totalMaterials - materialsAssigned;

        Double completionRate = materialsAssigned > 0 
            ? (double) materialsCompleted / materialsAssigned * 100 
            : 0.0;

        // Average completion time (placeholder - would need completion timestamps)
        Double averageCompletionTimeDays = 7.0;

        // Materials by category
        Map<String, Long> materialsByCategoryRaw = allMaterials.stream()
            .collect(Collectors.groupingBy(
                EducationalMaterial::getCategory,
                Collectors.counting()
            ));

        Map<String, Integer> materialsByCategory = materialsByCategoryRaw.entrySet().stream()
            .collect(Collectors.toMap(
                Map.Entry::getKey,
                e -> e.getValue().intValue()
            ));

        // Materials list with stats
        List<MaterialStatsDto.MaterialEntry> materialsList = allMaterials.stream()
            .map(material -> {
                List<MaterialProgress> materialProgresses = allProgresses.stream()
                    .filter(mp -> mp.getMaterialId().equals(material.getId()))
                    .toList();
                
                long assignedCount = materialProgresses.stream().map(MaterialProgress::getPatientId).distinct().count();
                long completedCount = materialProgresses.stream()
                    .filter(mp -> mp.getStatus() == MaterialProgress.MaterialStatus.COMPLETED)
                    .map(MaterialProgress::getPatientId)
                    .distinct()
                    .count();
                
                Double materialCompletionRate = assignedCount > 0 
                    ? (double) completedCount / assignedCount * 100 
                    : 0.0;

                return new MaterialStatsDto.MaterialEntry(
                    material.getId(),
                    material.getTitle(),
                    material.getCategory(),
                    (int) assignedCount,
                    (int) completedCount,
                    round(materialCompletionRate, 2)
                );
            })
            .toList();

        // Patient progress
        List<MaterialStatsDto.PatientMaterialProgress> patientProgress = activePatientProjects.stream()
            .map(pp -> {
                List<MaterialProgress> patientProgresses = allProgresses.stream()
                    .filter(mp -> mp.getPatientId().equals(pp.getPatient().getId()))
                    .toList();
                
                int assigned = patientProgresses.size();
                int completed = (int) patientProgresses.stream()
                    .filter(mp -> mp.getStatus() == MaterialProgress.MaterialStatus.COMPLETED)
                    .count();
                
                Double progressPercentage = assigned > 0 
                    ? (double) completed / assigned * 100 
                    : 0.0;

                return new MaterialStatsDto.PatientMaterialProgress(
                    pp.getPatient().getId(),
                    pp.getPatient().getFirstName() + " " + pp.getPatient().getLastName(),
                    assigned,
                    completed,
                    round(progressPercentage, 2)
                );
            })
            .toList();

        MaterialStatsDto report = MaterialStatsDto.builder()
            .projectId(projectId)
            .projectName(project.getName())
            .totalMaterials(totalMaterials)
            .materialsAssigned(materialsAssigned)
            .materialsCompleted(materialsCompleted)
            .materialsInProgress(materialsInProgress)
            .materialsNotStarted(materialsNotStarted)
            .completionRate(round(completionRate, 2))
            .averageCompletionTimeDays(averageCompletionTimeDays)
            .materialsByCategory(materialsByCategory)
            .materialsList(materialsList)
            .patientProgress(patientProgress)
            .build();

        // Save report history
        saveReport(ReportType.MATERIAL_STATS, projectId, null, dateFrom, dateTo, report, generatedBy);

        return report;
    }

    /**
     * Generate dashboard KPIs.
     */
    @Transactional(readOnly = true)
    public DashboardKpiDto generateDashboardKPIs(UUID currentUserId) {
        log.info("Generating dashboard KPIs");

        // Total counts
        long totalProjects = projectRepository.count();
        long activeProjects = projectRepository.countByStatus(ProjectStatus.ACTIVE);
        long totalPatients = patientRepository.count();
        long activePatients = patientRepository.countByUserStatus(com.kptest.domain.user.AccountStatus.ACTIVE);
        long totalStaff = staffRepository.count();

        // Average compliance across all active patient projects
        List<PatientProject> allActiveProjects = patientProjectRepository.findAll().stream()
            .filter(PatientProject::isActive)
            .toList();
        Double averageCompliance = allActiveProjects.stream()
            .filter(pp -> pp.getComplianceScore() != null)
            .mapToDouble(pp -> pp.getComplianceScore().doubleValue())
            .average()
            .orElse(0.0);

        // Session attendance
        List<TherapyEvent> allEvents = therapyEventRepository.findAll();
        long totalSessions = allEvents.size();
        long attendedSessions = allEvents.stream()
            .filter(e -> e.getStatus() == com.kptest.domain.schedule.EventStatus.COMPLETED)
            .count();
        Double overallSessionAttendance = totalSessions > 0 
            ? (double) attendedSessions / totalSessions * 100 
            : 0.0;

        // Materials completion
        List<MaterialProgress> allMaterialProgress = materialProgressRepository.findAll();
        long materialsCompleted = allMaterialProgress.stream()
            .filter(mp -> mp.getStatus() == MaterialProgress.MaterialStatus.COMPLETED)
            .count();
        Double materialsCompletionRate = allMaterialProgress.size() > 0
            ? (double) materialsCompleted / allMaterialProgress.size() * 100
            : 0.0;

        // Pending messages
        long pendingMessages = messageRepository.countByIsReadFalse();

        // Upcoming sessions (next 7 days)
        Instant nextWeek = Instant.now().plus(7, java.time.temporal.ChronoUnit.DAYS);
        long upcomingSessions = therapyEventRepository.countByScheduledDateBefore(nextWeek);

        // Projects at risk (compliance below threshold)
        long projectsAtRisk = projectRepository.findAll().stream()
            .filter(p -> p.getStatus() == ProjectStatus.ACTIVE)
            .filter(p -> {
                Double avgCompliance = patientProjectRepository.averageComplianceScoreByProjectId(p.getId())
                    .orElse(100.0);
                Integer threshold = p.getComplianceThreshold() != null ? p.getComplianceThreshold() : 80;
                return avgCompliance < threshold;
            })
            .count();

        // Compliance trend (last 30 days)
        List<DashboardKpiDto.ComplianceTrendEntry> complianceTrend = generateDashboardComplianceTrend();

        // Project status summary
        Map<ProjectStatus, Long> projectStatusSummaryRaw = projectRepository.findAll().stream()
            .collect(Collectors.groupingBy(
                Project::getStatus,
                Collectors.counting()
            ));

        Map<String, Integer> projectStatusSummary = projectStatusSummaryRaw.entrySet().stream()
            .collect(Collectors.toMap(
                e -> e.getKey().name(),
                e -> e.getValue().intValue()
            ));

        // Patient stage summary
        Map<TherapyStage, Long> patientStageSummaryRaw = allActiveProjects.stream()
            .collect(Collectors.groupingBy(
                PatientProject::getCurrentStage,
                Collectors.counting()
            ));

        Map<String, Integer> patientStageSummary = patientStageSummaryRaw.entrySet().stream()
            .collect(Collectors.toMap(
                e -> e.getKey().name(),
                e -> e.getValue().intValue()
            ));

        // Recent alerts
        List<DashboardKpiDto.AlertEntry> recentAlerts = generateRecentAlerts(allActiveProjects);

        return DashboardKpiDto.builder()
            .totalProjects((int) totalProjects)
            .activeProjects((int) activeProjects)
            .totalPatients((int) totalPatients)
            .activePatients((int) activePatients)
            .totalStaff((int) totalStaff)
            .averageCompliance(round(averageCompliance, 2))
            .overallSessionAttendance(round(overallSessionAttendance, 2))
            .materialsCompletionRate(round(materialsCompletionRate, 2))
            .pendingMessages((int) pendingMessages)
            .upcomingSessions((int) upcomingSessions)
            .projectsAtRisk((int) projectsAtRisk)
            .complianceTrend(complianceTrend)
            .projectStatusSummary(projectStatusSummary)
            .patientStageSummary(patientStageSummary)
            .recentAlerts(recentAlerts)
            .build();
    }

    /**
     * Export report to PDF.
     */
    @Transactional(readOnly = true)
    public ByteArrayResource exportToPDF(Object reportData, String reportType) {
        log.info("Exporting {} report to PDF", reportType);
        
        // Placeholder PDF generation - in production would use a library like iText or Apache PDFBox
        try {
            String jsonContent = objectMapper.writeValueAsString(reportData);
            ByteArrayOutputStream baos = new ByteArrayOutputStream();
            
            // Simple text-based PDF placeholder
            String pdfContent = "%PDF-1.4\n1 0 obj\n<< /Type /Catalog /Pages 2 0 R >>\nendobj\n" +
                "2 0 obj\n<< /Type /Pages /Kids [3 0 R] /Count 1 >>\nendobj\n" +
                "3 0 obj\n<< /Type /Page /Parent 2 0 R /MediaBox [0 0 612 792] /Contents 4 0 R >>\nendobj\n" +
                "4 0 obj\n<< /Length " + jsonContent.length() + " >>\nstream\n" +
                jsonContent + "\nendstream\nendobj\n" +
                "xref\n0 5\n0000000000 65535 f \n" +
                "0000000009 00000 n \n" +
                "0000000058 00000 n \n" +
                "0000000115 00000 n \n" +
                "0000000214 00000 n \n" +
                "trailer\n<< /Size 5 /Root 1 0 R >>\nstartxref\n" +
                (214 + jsonContent.length() + 16) + "\n%%EOF";

            try {
                baos.write(pdfContent.getBytes());
            } catch (IOException e) {
                throw new RuntimeException("Failed to write PDF content", e);
            }
            return new ByteArrayResource(baos.toByteArray());
        } catch (JsonProcessingException e) {
            log.error("Error generating PDF", e);
            throw new RuntimeException("Failed to generate PDF", e);
        }
    }

    /**
     * Export report to Excel.
     */
    @Transactional(readOnly = true)
    public ByteArrayResource exportToExcel(Object reportData, String reportType) {
        log.info("Exporting {} report to Excel", reportType);

        // Placeholder Excel generation - in production would use Apache POI
        try {
            String jsonContent = objectMapper.writeValueAsString(reportData);
            ByteArrayOutputStream baos = new ByteArrayOutputStream();

            // Simple CSV-like format as placeholder
            baos.write(("Report Type: " + reportType + "\n").getBytes());
            baos.write(("Generated: " + LocalDate.now().format(DATE_FORMATTER) + "\n").getBytes());
            baos.write("\n".getBytes());
            baos.write(jsonContent.getBytes());

            return new ByteArrayResource(baos.toByteArray());
        } catch (IOException e) {
            log.error("Error generating Excel", e);
            throw new RuntimeException("Failed to generate Excel", e);
        }
    }

    /**
     * Get report history.
     */
    @Transactional(readOnly = true)
    public List<ReportHistoryResponse> getReportHistory(UUID generatedBy, ReportType type) {
        log.info("Getting report history for user: {}, type: {}", generatedBy, type);

        List<Report> reports;
        if (generatedBy != null && type != null) {
            reports = reportRepository.findByTypeAndGeneratedBy(type, generatedBy);
        } else if (generatedBy != null) {
            reports = reportRepository.findByGeneratedBy(generatedBy);
        } else if (type != null) {
            reports = reportRepository.findByType(type);
        } else {
            reports = reportRepository.findAll();
        }

        return reports.stream()
            .map(report -> {
                ReportHistoryResponse.Builder builder = ReportHistoryResponse.builder()
                    .id(report.getId())
                    .type(report.getType())
                    .dateFrom(report.getDateFrom())
                    .dateTo(report.getDateTo())
                    .generatedAt(report.getGeneratedAt())
                    .generatedBy(report.getGeneratedBy());

                if (report.getProjectId() != null) {
                    Project project = projectRepository.findById(report.getProjectId()).orElse(null);
                    builder.projectId(report.getProjectId());
                    if (project != null) {
                        builder.projectName(project.getName());
                    }
                }

                if (report.getPatientId() != null) {
                    Patient patient = patientRepository.findById(report.getPatientId()).orElse(null);
                    builder.patientId(report.getPatientId());
                    if (patient != null) {
                        builder.patientName(patient.getFirstName() + " " + patient.getLastName());
                    }
                }

                if (report.getGeneratedBy() != null) {
                    User user = userRepository.findById(report.getGeneratedBy()).orElse(null);
                    if (user != null) {
                        builder.generatedByName(user.getEmail());
                    }
                }

                return builder.build();
            })
            .toList();
    }

    // ==================== Private Helper Methods ====================

    private void saveReport(ReportType type, UUID projectId, UUID patientId, 
                           LocalDate dateFrom, LocalDate dateTo, Object data, UUID generatedBy) {
        try {
            String jsonData = objectMapper.writeValueAsString(data);
            Report report = Report.create(type, projectId, patientId, dateFrom, dateTo, jsonData, generatedBy);
            reportRepository.save(report);
            log.info("Saved report: {} for project: {}, patient: {}", type, projectId, patientId);
        } catch (JsonProcessingException e) {
            log.error("Failed to serialize report data", e);
        }
    }

    private List<ComplianceReportDto.ComplianceTrendEntry> generateComplianceTrend(
            List<PatientProject> patientProjects, LocalDate dateFrom, LocalDate dateTo) {
        
        List<ComplianceReportDto.ComplianceTrendEntry> trend = new ArrayList<>();
        LocalDate current = dateFrom;
        
        while (!current.isAfter(dateTo)) {
            double avgCompliance = patientProjects.stream()
                .filter(pp -> pp.getComplianceScore() != null)
                .mapToDouble(pp -> pp.getComplianceScore().doubleValue())
                .average()
                .orElse(0.0);
            
            trend.add(new ComplianceReportDto.ComplianceTrendEntry(
                current.format(DATE_FORMATTER),
                round(avgCompliance, 2)
            ));
            
            current = current.plusDays(1);
        }
        
        return trend;
    }

    private List<DashboardKpiDto.ComplianceTrendEntry> generateDashboardComplianceTrend() {
        List<DashboardKpiDto.ComplianceTrendEntry> trend = new ArrayList<>();
        LocalDate current = LocalDate.now().minusDays(30);
        
        while (!current.isAfter(LocalDate.now())) {
            // Placeholder - would calculate actual historical compliance
            trend.add(new DashboardKpiDto.ComplianceTrendEntry(
                current.format(DATE_FORMATTER),
                75.0 + (Math.random() * 20 - 10) // Random between 65-85 for demo
            ));
            
            current = current.plusDays(1);
        }
        
        return trend;
    }

    private List<ComplianceReportDto.NonCompliantItem> findNonCompliantItems(
            List<PatientProject> patientProjects, Integer threshold) {
        
        return patientProjects.stream()
            .filter(pp -> pp.getComplianceScore() != null)
            .filter(pp -> pp.getComplianceScore().doubleValue() < threshold)
            .map(pp -> new ComplianceReportDto.NonCompliantItem(
                pp.getPatient().getId(),
                "PATIENT",
                "Patient compliance below threshold: " + pp.getPatient().getFirstName() + " " + pp.getPatient().getLastName(),
                LocalDate.now().format(DATE_FORMATTER),
                0,
                "Therapy Team"
            ))
            .toList();
    }

    private List<DashboardKpiDto.AlertEntry> generateRecentAlerts(List<PatientProject> patientProjects) {
        List<DashboardKpiDto.AlertEntry> alerts = new ArrayList<>();
        
        // Low compliance alerts
        patientProjects.stream()
            .filter(pp -> pp.getComplianceScore() != null)
            .filter(pp -> pp.getComplianceScore().doubleValue() < 50)
            .forEach(pp -> alerts.add(new DashboardKpiDto.AlertEntry(
                "LOW_COMPLIANCE",
                "HIGH",
                "Patient " + pp.getPatient().getFirstName() + " " + pp.getPatient().getLastName() + 
                    " has compliance below 50%",
                Instant.now().toString(),
                pp.getPatient().getId().toString()
            )));
        
        // Overdue events
        List<TherapyEvent> overdueEvents = therapyEventRepository.findOverdueEvents();
        overdueEvents.stream()
            .limit(5)
            .forEach(event -> alerts.add(new DashboardKpiDto.AlertEntry(
                "OVERDUE_EVENT",
                "MEDIUM",
                "Event " + event.getTitle() + " is overdue",
                Instant.now().toString(),
                event.getId().toString()
            )));
        
        return alerts;
    }

    private double round(double value, int places) {
        if (Double.isNaN(value) || Double.isInfinite(value)) {
            return 0.0;
        }
        BigDecimal bd = BigDecimal.valueOf(value);
        bd = bd.setScale(places, RoundingMode.HALF_UP);
        return bd.doubleValue();
    }
}
