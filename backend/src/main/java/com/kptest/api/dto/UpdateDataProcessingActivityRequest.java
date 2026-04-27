package com.kptest.api.dto;

import com.kptest.domain.audit.DataProcessingActivity;

import java.util.List;
import java.util.UUID;

/**
 * Request DTO for updating a Data Processing Activity.
 */
public record UpdateDataProcessingActivityRequest(
    String name,
    String purpose,
    DataProcessingActivity.LegalBasis legalBasis,
    List<String> categories,
    List<String> recipients,
    String retentionPeriod,
    String securityMeasures,
    String dataController,
    String dataProcessor
) {
}
