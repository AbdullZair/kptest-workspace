package com.kptest.api.dto;

import com.fasterxml.jackson.annotation.JsonProperty;
import com.kptest.domain.gamification.Badge;
import com.kptest.domain.gamification.PatientBadge;
import com.kptest.domain.material.MaterialProgress;
import com.kptest.domain.message.Message;
import com.kptest.domain.project.PatientProject;
import com.kptest.domain.quiz.QuizAttempt;
import com.kptest.domain.schedule.TherapyEvent;
import com.kptest.domain.user.User;

import java.time.Instant;
import java.util.List;
import java.util.UUID;

/**
 * DTO for exporting patient data (RODO Art. 20 - right to data portability).
 * Contains all personal data and related entities for a patient.
 */
public record PatientDataExportDto(
    @JsonProperty("export_generated_at")
    Instant exportGeneratedAt,

    @JsonProperty("patient_id")
    UUID patientId,

    @JsonProperty("patient_data")
    PatientPersonalData patientData,

    @JsonProperty("therapeutic_projects")
    List<PatientProjectData> therapeuticProjects,

    @JsonProperty("messages")
    List<MessageData> messages,

    @JsonProperty("material_progress")
    List<MaterialProgressData> materialProgress,

    @JsonProperty("therapy_events")
    List<TherapyEventData> therapyEvents,

    @JsonProperty("quiz_attempts")
    List<QuizAttemptData> quizAttempts,

    @JsonProperty("badges")
    List<PatientBadgeData> badges,

    @JsonProperty("audit_logs")
    List<AuditLogData> auditLogs
) {
    public static PatientDataExportDto of(
        Instant exportGeneratedAt,
        UUID patientId,
        PatientPersonalData patientData,
        List<PatientProjectData> therapeuticProjects,
        List<MessageData> messages,
        List<MaterialProgressData> materialProgress,
        List<TherapyEventData> therapyEvents,
        List<QuizAttemptData> quizAttempts,
        List<PatientBadgeData> badges,
        List<AuditLogData> auditLogs
    ) {
        return new PatientDataExportDto(
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
    }

    /**
     * Patient personal data.
     */
    public record PatientPersonalData(
        @JsonProperty("pesel")
        String pesel,

        @JsonProperty("first_name")
        String firstName,

        @JsonProperty("last_name")
        String lastName,

        @JsonProperty("email")
        String email,

        @JsonProperty("phone")
        String phone,

        @JsonProperty("date_of_birth")
        java.time.LocalDate dateOfBirth,

        @JsonProperty("gender")
        com.kptest.domain.patient.Patient.Gender gender,

        @JsonProperty("address_street")
        String addressStreet,

        @JsonProperty("address_city")
        String addressCity,

        @JsonProperty("address_postal_code")
        String addressPostalCode,

        @JsonProperty("his_patient_id")
        String hisPatientId,

        @JsonProperty("verification_status")
        com.kptest.domain.user.VerificationStatus verificationStatus,

        @JsonProperty("created_at")
        Instant createdAt,

        @JsonProperty("updated_at")
        Instant updatedAt
    ) {
        public static PatientPersonalData fromPatient(
            com.kptest.domain.patient.Patient patient,
            User user
        ) {
            return new PatientPersonalData(
                patient.getPesel(),
                patient.getFirstName(),
                patient.getLastName(),
                user != null ? user.getEmail() : null,
                user != null ? user.getPhone() : null,
                patient.getDateOfBirth(),
                patient.getGender(),
                patient.getAddressStreet(),
                patient.getAddressCity(),
                patient.getAddressPostalCode(),
                patient.getHisPatientId(),
                patient.getVerificationStatus(),
                patient.getCreatedAt(),
                patient.getUpdatedAt()
            );
        }
    }

    /**
     * Patient project data.
     */
    public record PatientProjectData(
        @JsonProperty("project_id")
        UUID projectId,

        @JsonProperty("project_name")
        String projectName,

        @JsonProperty("enrolled_at")
        Instant enrolledAt,

        @JsonProperty("left_at")
        Instant leftAt,

        @JsonProperty("current_stage")
        String currentStage
    ) {
        public static PatientProjectData fromPatientProject(PatientProject patientProject) {
            return new PatientProjectData(
                patientProject.getProject() != null ? patientProject.getProject().getId() : null,
                patientProject.getProject() != null ? patientProject.getProject().getName() : null,
                patientProject.getEnrolledAt(),
                patientProject.getLeftAt(),
                patientProject.getCurrentStage() != null ? patientProject.getCurrentStage().name() : null
            );
        }
    }

    /**
     * Message data.
     */
    public record MessageData(
        @JsonProperty("message_id")
        UUID messageId,

        @JsonProperty("thread_id")
        UUID threadId,

        @JsonProperty("content")
        String content,

        @JsonProperty("sender_id")
        UUID senderId,

        @JsonProperty("sent_at")
        Instant sentAt
    ) {
        public static MessageData fromMessage(Message message) {
            return new MessageData(
                message.getId(),
                message.getThread() != null ? message.getThread().getId() : null,
                message.getContent(),
                message.getSenderId(),
                message.getSentAt()
            );
        }
    }

    /**
     * Material progress data.
     */
    public record MaterialProgressData(
        @JsonProperty("material_id")
        UUID materialId,

        @JsonProperty("material_title")
        String materialTitle,

        @JsonProperty("progress_percent")
        Integer progressPercent,

        @JsonProperty("completed_at")
        Instant completedAt
    ) {
        public static MaterialProgressData fromMaterialProgress(MaterialProgress progress, String materialTitle) {
            // Calculate progress percent from status
            Integer progressPercent = switch (progress.getStatus()) {
                case COMPLETED -> 100;
                case IN_PROGRESS -> 50;
                case PENDING -> 0;
            };
            return new MaterialProgressData(
                progress.getMaterialId(),
                materialTitle,
                progressPercent,
                progress.getCompletedAt()
            );
        }
    }

    /**
     * Therapy event data.
     */
    public record TherapyEventData(
        @JsonProperty("event_id")
        UUID eventId,

        @JsonProperty("title")
        String title,

        @JsonProperty("description")
        String description,

        @JsonProperty("event_type")
        String eventType,

        @JsonProperty("scheduled_at")
        Instant scheduledAt,

        @JsonProperty("completed_at")
        Instant completedAt,

        @JsonProperty("status")
        String status
    ) {
        public static TherapyEventData fromTherapyEvent(TherapyEvent event) {
            return new TherapyEventData(
                event.getId(),
                event.getTitle(),
                event.getDescription(),
                event.getType() != null ? event.getType().name() : null,
                event.getScheduledAt(),
                event.getCompletedAt(),
                event.getStatus() != null ? event.getStatus().name() : null
            );
        }
    }

    /**
     * Quiz attempt data.
     */
    public record QuizAttemptData(
        @JsonProperty("attempt_id")
        UUID attemptId,

        @JsonProperty("quiz_id")
        UUID quizId,

        @JsonProperty("quiz_title")
        String quizTitle,

        @JsonProperty("score")
        Integer score,

        @JsonProperty("completed_at")
        Instant completedAt
    ) {
        public static QuizAttemptData fromQuizAttempt(QuizAttempt attempt) {
            return new QuizAttemptData(
                attempt.getId(),
                attempt.getQuiz() != null ? attempt.getQuiz().getId() : null,
                attempt.getQuiz() != null ? attempt.getQuiz().getTitle() : null,
                attempt.getScore(),
                attempt.getCompletedAt()
            );
        }
    }

    /**
     * Patient badge data.
     */
    public record PatientBadgeData(
        @JsonProperty("badge_id")
        UUID badgeId,

        @JsonProperty("badge_name")
        String badgeName,

        @JsonProperty("badge_description")
        String badgeDescription,

        @JsonProperty("earned_at")
        Instant earnedAt
    ) {
        public static PatientBadgeData fromPatientBadge(PatientBadge patientBadge) {
            Badge badge = patientBadge.getBadge();
            return new PatientBadgeData(
                badge != null ? badge.getId() : null,
                badge != null ? badge.getName() : null,
                badge != null ? badge.getDescription() : null,
                patientBadge.getEarnedAt()
            );
        }
    }

    /**
     * Audit log data.
     */
    public record AuditLogData(
        @JsonProperty("log_id")
        UUID logId,

        @JsonProperty("action")
        String action,

        @JsonProperty("entity_type")
        String entityType,

        @JsonProperty("entity_id")
        UUID entityId,

        @JsonProperty("created_at")
        Instant createdAt
    ) {
        public static AuditLogData fromAuditLog(com.kptest.domain.audit.AuditLog auditLog) {
            return new AuditLogData(
                auditLog.getId(),
                auditLog.getAction() != null ? auditLog.getAction().name() : null,
                auditLog.getEntityType(),
                auditLog.getEntityId(),
                auditLog.getCreatedAt()
            );
        }
    }
}
