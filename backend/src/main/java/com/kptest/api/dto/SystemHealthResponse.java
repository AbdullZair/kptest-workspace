package com.kptest.api.dto;

import com.fasterxml.jackson.annotation.JsonProperty;

import java.util.Map;

/**
 * System health check response.
 */
public record SystemHealthResponse(
    String status,

    @JsonProperty("database_status")
    String databaseStatus,

    @JsonProperty("cache_status")
    String cacheStatus,

    @JsonProperty("timestamp")
    String timestamp,

    @JsonProperty("uptime_seconds")
    Long uptimeSeconds,

    @JsonProperty("version")
    String version,

    Map<String, HealthCheckDetail> details
) {

    public record HealthCheckDetail(
        String status,
        @JsonProperty("response_time_ms")
        Long responseTimeMs,
        String message
    ) {
    }
}
