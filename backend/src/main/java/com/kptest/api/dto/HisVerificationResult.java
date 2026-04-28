package com.kptest.api.dto;

import com.fasterxml.jackson.annotation.JsonInclude;
import com.fasterxml.jackson.annotation.JsonProperty;

import java.util.Optional;

/**
 * Result of a patient identity verification against the HIS.
 *
 * <p>The {@link Status} enum reflects the three terminal outcomes
 * of a verification call:
 * <ul>
 *     <li>{@code MATCHED} - PESEL and cart number both match a HIS record.</li>
 *     <li>{@code NOT_FOUND} - the PESEL is not present in the HIS.</li>
 *     <li>{@code MISMATCH} - the PESEL exists but the cart number is different.</li>
 * </ul>
 * Transport / 5xx errors are not represented here - they raise
 * {@link com.kptest.exception.HisIntegrationException} instead.</p>
 */
public record HisVerificationResult(
    @JsonProperty("status")
    Status status,

    @JsonInclude(JsonInclude.Include.NON_NULL)
    @JsonProperty("demographics")
    HisDemographicsDto demographics
) {

    public enum Status {
        MATCHED,
        NOT_FOUND,
        MISMATCH
    }

    public static HisVerificationResult matched(HisDemographicsDto demographics) {
        return new HisVerificationResult(Status.MATCHED, demographics);
    }

    public static HisVerificationResult notFound() {
        return new HisVerificationResult(Status.NOT_FOUND, null);
    }

    public static HisVerificationResult mismatch() {
        return new HisVerificationResult(Status.MISMATCH, null);
    }

    /**
     * Convenience accessor returning demographics as an {@link Optional}.
     * Demographics are only present when {@link #status()} is {@code MATCHED}.
     */
    public Optional<HisDemographicsDto> demographicsOptional() {
        return Optional.ofNullable(demographics);
    }
}
