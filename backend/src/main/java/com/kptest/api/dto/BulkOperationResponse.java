package com.kptest.api.dto;

import java.util.List;

/**
 * Response DTO for bulk patient operations (US-K-05).
 *
 * <p>Each item in {@link #results} represents the outcome of the operation
 * for a single patient. The operation is best-effort: a single failure does
 * not abort the whole batch.</p>
 *
 * @param total total number of patients in the request
 * @param succeeded count of items with status {@code OK}
 * @param failed count of items with status {@code ERROR}
 * @param results per-item results in submission order
 */
public record BulkOperationResponse(
    int total,
    int succeeded,
    int failed,
    List<BulkItemResult> results
) {
    public static BulkOperationResponse from(List<BulkItemResult> results) {
        int succeeded = (int) results.stream().filter(r -> "OK".equals(r.status())).count();
        int failed = results.size() - succeeded;
        return new BulkOperationResponse(results.size(), succeeded, failed, results);
    }
}
