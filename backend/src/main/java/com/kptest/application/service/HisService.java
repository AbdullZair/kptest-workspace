package com.kptest.application.service;

import com.kptest.api.dto.HisDemographicsDto;
import com.kptest.api.dto.HisVerificationResult;
import com.kptest.exception.HisIntegrationException;

/**
 * Application-level abstraction for the Hospital Information System (HIS)
 * integration (US-P-02 / US-S-04, Must-Have; ekstrakcja interface — US-S-05).
 *
 * <p>The contract intentionally exposes only domain-level outcomes
 * ({@link HisVerificationResult} / {@link HisDemographicsDto}) so that
 * callers (controllers, application services) remain agnostic of the
 * underlying transport (REST mock, HL7 FHIR, vendor-specific HIS).</p>
 *
 * <p>Two implementations are wired:
 * <ul>
 *     <li>{@link com.kptest.infrastructure.his.RestHisProvider} — production
 *         path backed by the {@code his-mock} REST contract via
 *         {@link com.kptest.infrastructure.his.HisClient} (Apache HttpClient 5).</li>
 *     <li>{@link com.kptest.infrastructure.his.MockHisProvider} — in-memory
 *         implementation activated under the {@code test} Spring profile;
 *         no network traffic, no {@code his-mock} container required.</li>
 * </ul>
 *
 * <p>Future implementations (e.g. {@code FhirHisProvider} for HL7 FHIR R4,
 * {@code CgmHisProvider} for CGM CompuGroup, {@code OptiMedHisProvider})
 * are expected to plug in through this same interface without touching
 * any caller — see {@code docs/architecture/adr/ADR-003.md}.</p>
 *
 * @see com.kptest.infrastructure.his.HisClient
 * @see HisVerificationResult
 * @see HisDemographicsDto
 */
public interface HisService {

    /**
     * Verify a patient's identity in the HIS by matching a PESEL against
     * the cart / chart number assigned by the Hospital Information System.
     *
     * <p>Domain-level outcomes:
     * <ul>
     *     <li>{@link HisVerificationResult.Status#MATCHED} — PESEL + cart match,
     *         demographics included.</li>
     *     <li>{@link HisVerificationResult.Status#NOT_FOUND} — PESEL is not
     *         present in the HIS at all.</li>
     *     <li>{@link HisVerificationResult.Status#MISMATCH} — PESEL exists
     *         but the supplied cart number does not match the HIS record.</li>
     * </ul>
     *
     * <p>Transport / 5xx errors are not represented as a result; they
     * raise {@link HisIntegrationException} instead so the
     * {@code GlobalExceptionHandler} can render a uniform 503 response.</p>
     *
     * @param pesel patient PESEL (11 digits, unmasked)
     * @param cartNumber HIS cart / chart number assigned to the patient
     * @return matched / not-found / mismatch outcome (never {@code null})
     * @throws HisIntegrationException on transport, 5xx, or unexpected errors
     */
    HisVerificationResult verifyPatient(String pesel, String cartNumber);

    /**
     * Fetch HIS demographics by PESEL.
     *
     * <p>The returned DTO always carries a masked PESEL — only the last
     * four digits are visible — to limit exposure of sensitive personal
     * data in API responses and logs.</p>
     *
     * @param pesel patient PESEL (11 digits, unmasked)
     * @return demographics with masked PESEL (never {@code null})
     * @throws HisIntegrationException on transport, 5xx, or 404 errors
     *         (a missing patient is treated as an integration failure
     *         on this endpoint, unlike {@link #verifyPatient})
     */
    HisDemographicsDto getDemographics(String pesel);
}
