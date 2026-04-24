package com.kptest.api.dto;

import com.fasterxml.jackson.annotation.JsonProperty;
import com.kptest.domain.audit.AuditLog;

import java.time.Instant;
import java.util.UUID;

/**
 * Audit log response DTO.
 */
public record AuditLogResponse(
    @JsonProperty("log_id")
    String logId,

    @JsonProperty("user_id")
    String userId,

    String action,

    @JsonProperty("entity_type")
    String entityType,

    @JsonProperty("entity_id")
    String entityId,

    @JsonProperty("old_value")
    String oldValue,

    @JsonProperty("new_value")
    String newValue,

    @JsonProperty("ip_address")
    String ipAddress,

    @JsonProperty("user_agent")
    String userAgent,

    @JsonProperty("created_at")
    Instant createdAt
) {

    public static AuditLogResponse fromAuditLog(AuditLog log) {
        return new AuditLogResponse(
            log.getId().toString(),
            log.getUserId().toString(),
            log.getAction().name(),
            log.getEntityType(),
            log.getEntityId() != null ? log.getEntityId().toString() : null,
            log.getOldValue(),
            log.getNewValue(),
            log.getIpAddress(),
            log.getUserAgent(),
            log.getCreatedAt()
        );
    }
}
