package com.kptest.api.dto;

import com.fasterxml.jackson.annotation.JsonProperty;

import java.util.Map;

/**
 * System metrics response.
 */
public record SystemMetricsResponse(
    @JsonProperty("memory_usage")
    MemoryMetrics memoryUsage,

    @JsonProperty("cpu_usage")
    CpuMetrics cpuUsage,

    @JsonProperty("database_metrics")
    DatabaseMetrics databaseMetrics,

    @JsonProperty("cache_metrics")
    CacheMetrics cacheMetrics,

    @JsonProperty("user_metrics")
    UserMetrics userMetrics,

    @JsonProperty("timestamp")
    String timestamp
) {

    public record MemoryMetrics(
        @JsonProperty("total_mb")
        Long totalMb,

        @JsonProperty("used_mb")
        Long usedMb,

        @JsonProperty("free_mb")
        Long freeMb,

        @JsonProperty("usage_percent")
        Double usagePercent
    ) {
    }

    public record CpuMetrics(
        @JsonProperty("available_processors")
        Integer availableProcessors,

        @JsonProperty("system_load_percent")
        Double systemLoadPercent
    ) {
    }

    public record DatabaseMetrics(
        @JsonProperty("active_connections")
        Integer activeConnections,

        @JsonProperty("max_connections")
        Integer maxConnections,

        @JsonProperty("total_records")
        Long totalRecords
    ) {
    }

    public record CacheMetrics(
        @JsonProperty("connected")
        Boolean connected,

        @JsonProperty("keys_count")
        Long keysCount,

        @JsonProperty("memory_usage_mb")
        Double memoryUsageMb
    ) {
    }

    public record UserMetrics(
        @JsonProperty("total_users")
        Long totalUsers,

        @JsonProperty("active_users")
        Long activeUsers,

        @JsonProperty("online_users")
        Long onlineUsers
    ) {
    }
}
