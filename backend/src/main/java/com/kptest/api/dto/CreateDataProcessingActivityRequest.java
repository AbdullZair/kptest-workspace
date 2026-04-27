package com.kptest.api.dto;

import com.kptest.domain.audit.DataProcessingActivity;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

import java.util.List;
import java.util.UUID;

/**
 * Request DTO for creating a Data Processing Activity.
 */
public record CreateDataProcessingActivityRequest(
    @NotBlank(message = "Name is required")
    String name,

    @NotBlank(message = "Purpose is required")
    String purpose,

    @NotNull(message = "Legal basis is required")
    DataProcessingActivity.LegalBasis legalBasis,

    List<String> categories,

    List<String> recipients,

    String retentionPeriod,

    String securityMeasures,

    String dataController,

    String dataProcessor
) {
}
