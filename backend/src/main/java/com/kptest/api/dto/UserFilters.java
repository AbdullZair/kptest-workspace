package com.kptest.api.dto;

import com.fasterxml.jackson.annotation.JsonProperty;

/**
 * Request to filter users.
 */
public record UserFilters(
    @JsonProperty("role")
    String role,

    @JsonProperty("status")
    String status,

    @JsonProperty("search")
    String search,

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
