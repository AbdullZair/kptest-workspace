package com.kptest.api.dto;

import com.fasterxml.jackson.annotation.JsonProperty;
import com.kptest.domain.project.TherapyStage;

import java.math.BigDecimal;
import java.time.Instant;
import java.util.UUID;

/**
 * Flat, safe DTO summarising a patient enrolled in a project for staff UI.
 * Avoids leaking JPA proxies / PII (no full PESEL, no user account fields).
 */
public record ProjectPatientSummaryDto(
    @JsonProperty("id") UUID id,
    @JsonProperty("patient_id") UUID patientId,
    @JsonProperty("first_name") String firstName,
    @JsonProperty("last_name") String lastName,
    @JsonProperty("current_stage") TherapyStage currentStage,
    @JsonProperty("compliance_score") BigDecimal complianceScore,
    @JsonProperty("enrolled_at") Instant enrolledAt,
    @JsonProperty("active") boolean active
) {}
