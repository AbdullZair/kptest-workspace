package com.kptest.api.dto;

import com.fasterxml.jackson.annotation.JsonProperty;

import java.util.List;

/**
 * Request to export logs.
 */
public record ExportLogsRequest(
    @JsonProperty("format")
    String format,

    @JsonProperty("log_ids")
    List<String> logIds
) {
}
