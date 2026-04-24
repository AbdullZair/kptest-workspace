package com.kptest.api.dto;

import com.fasterxml.jackson.annotation.JsonProperty;
import com.kptest.domain.audit.SystemLog;

import java.time.Instant;

/**
 * System log response DTO.
 */
public record SystemLogResponse(
    @JsonProperty("log_id")
    String logId,

    String level,

    String message,

    @JsonProperty("stack_trace")
    String stackTrace,

    @JsonProperty("source_class")
    String sourceClass,

    @JsonProperty("source_method")
    String sourceMethod,

    @JsonProperty("created_at")
    Instant createdAt
) {

    public static SystemLogResponse fromSystemLog(SystemLog log) {
        return new SystemLogResponse(
            log.getId().toString(),
            log.getLevel().name(),
            log.getMessage(),
            log.getStackTrace(),
            log.getSourceClass(),
            log.getSourceMethod(),
            log.getCreatedAt()
        );
    }
}
