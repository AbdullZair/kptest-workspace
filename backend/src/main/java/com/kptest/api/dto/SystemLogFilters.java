package com.kptest.api.dto;

import com.fasterxml.jackson.annotation.JsonProperty;

/**
 * Request to filter system logs.
 */
public record SystemLogFilters(
    @JsonProperty("level")
    String level,

    @JsonProperty("date_from")
    String dateFrom,

    @JsonProperty("date_to")
    String dateTo,

    @JsonProperty("search")
    String search,

    @JsonProperty("page")
    Integer page,

    @JsonProperty("size")
    Integer size
) {
}
