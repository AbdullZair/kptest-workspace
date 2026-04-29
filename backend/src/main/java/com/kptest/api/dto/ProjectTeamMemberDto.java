package com.kptest.api.dto;

import com.fasterxml.jackson.annotation.JsonProperty;
import com.kptest.domain.project.ProjectRole;

import java.time.Instant;
import java.util.UUID;

/**
 * Flat, safe DTO representing a project team member for staff UI.
 * Avoids leaking JPA proxies / PII (no password hash, no 2FA secret).
 */
public record ProjectTeamMemberDto(
    @JsonProperty("id") UUID id,
    @JsonProperty("user_id") UUID userId,
    @JsonProperty("email") String email,
    @JsonProperty("role") ProjectRole role,
    @JsonProperty("assigned_at") Instant assignedAt
) {}
