package com.kptest.api.dto;

import com.fasterxml.jackson.annotation.JsonProperty;

/**
 * Request to filter audit logs.
 */
public record AuditLogFilters(
    @JsonProperty("user_id")
    String userId,

    @JsonProperty("action")
    String action,

    @JsonProperty("entity_type")
    String entityType,

    @JsonProperty("entity_id")
    String entityId,

    @JsonProperty("date_from")
    String dateFrom,

    @JsonProperty("date_to")
    String dateTo,

    @JsonProperty("page")
    Integer page,

    @JsonProperty("size")
    Integer size
) {
}
