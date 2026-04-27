package com.kptest.api.dto;

import com.kptest.domain.audit.DataProcessingActivity;

import java.time.Instant;
import java.util.List;
import java.util.UUID;

/**
 * Response DTO for Data Processing Activity.
 */
public record DataProcessingActivityDto(
    UUID id,
    String name,
    String purpose,
    String legalBasis,
    List<String> categories,
    List<String> recipients,
    String retentionPeriod,
    String securityMeasures,
    String dataController,
    String dataProcessor,
    UUID createdBy,
    Instant createdAt,
    Instant updatedAt
) {
    /**
     * Map from entity to DTO.
     */
    public static DataProcessingActivityDto fromEntity(DataProcessingActivity activity) {
        return new DataProcessingActivityDto(
            activity.getId(),
            activity.getName(),
            activity.getPurpose(),
            activity.getLegalBasis() != null ? activity.getLegalBasis().name() : null,
            activity.getCategories(),
            activity.getRecipients(),
            activity.getRetentionPeriod(),
            activity.getSecurityMeasures(),
            activity.getDataController(),
            activity.getDataProcessor(),
            activity.getCreatedBy(),
            activity.getCreatedAt(),
            activity.getUpdatedAt()
        );
    }
}
