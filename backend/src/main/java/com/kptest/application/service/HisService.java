package com.kptest.application.service;

import com.kptest.api.dto.HisDemographicsDto;
import com.kptest.api.dto.HisVerificationResult;
import com.kptest.exception.HisIntegrationException;
import com.kptest.infrastructure.his.HisClient;
import com.kptest.infrastructure.his.HisClient.HisDemographicsHttpResponse;
import com.kptest.infrastructure.his.HisClient.HisPatientPayload;
import com.kptest.infrastructure.his.HisClient.HisVerifyHttpResponse;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.time.format.DateTimeParseException;
import java.util.Optional;

/**
 * Application service orchestrating HIS (Hospital Information System)
 * patient identity checks (US-P-02 / US-S-04, Must-Have).
 *
 * <p>Responsibilities:
 * <ul>
 *     <li>Translate HTTP-level responses returned by {@link HisClient}
 *         into domain-level {@link HisVerificationResult}.</li>
 *     <li>Mask the PESEL on outgoing DTOs - clients only ever see the
 *         last 4 digits.</li>
 *     <li>Re-throw transport/5xx errors as {@link HisIntegrationException}
 *         so the {@code GlobalExceptionHandler} can render a uniform
 *         503 response.</li>
 * </ul>
 */
@Slf4j
@Service
@RequiredArgsConstructor
public class HisService {

    private final HisClient hisClient;

    /**
     * Verify a patient's identity in the HIS.
     *
     * @param pesel patient PESEL (11 digits)
     * @param cartNumber HIS cart / chart number
     * @return matched / not-found / mismatch outcome
     * @throws HisIntegrationException on transport or 5xx errors
     */
    public HisVerificationResult verifyPatient(String pesel, String cartNumber) {
        log.debug("HIS verify - pesel={}, cartNumber={}",
            HisDemographicsDto.maskPesel(pesel), cartNumber);

        try {
            Optional<HisVerifyHttpResponse> response = hisClient.verify(pesel, cartNumber);

            if (response.isEmpty()) {
                log.info("HIS verify - patient not found, pesel={}",
                    HisDemographicsDto.maskPesel(pesel));
                return HisVerificationResult.notFound();
            }

            HisVerifyHttpResponse body = response.get();
            if (Boolean.TRUE.equals(body.verified()) && body.patient() != null) {
                HisDemographicsDto demographics = toDemographics(body.patient());
                return HisVerificationResult.matched(demographics);
            }

            log.info("HIS verify - cart mismatch, pesel={}",
                HisDemographicsDto.maskPesel(pesel));
            return HisVerificationResult.mismatch();
        } catch (HisIntegrationException ex) {
            log.warn("HIS verify failed - pesel={}, error={}",
                HisDemographicsDto.maskPesel(pesel), ex.getMessage());
            throw ex;
        }
    }

    /**
     * Fetch HIS demographics by PESEL.
     *
     * @param pesel patient PESEL (11 digits)
     * @return demographics with masked PESEL
     * @throws HisIntegrationException on transport, 5xx, or 404 errors
     */
    public HisDemographicsDto getDemographics(String pesel) {
        log.debug("HIS getDemographics - pesel={}", HisDemographicsDto.maskPesel(pesel));

        try {
            HisDemographicsHttpResponse body = hisClient.getDemographics(pesel)
                .orElseThrow(() -> new HisIntegrationException(
                    "HIS demographics not found for pesel=" + HisDemographicsDto.maskPesel(pesel)));

            return HisDemographicsDto.maskedFrom(
                body.firstName(),
                body.lastName(),
                body.pesel(),
                parseDate(body.dateOfBirth())
            );
        } catch (HisIntegrationException ex) {
            log.warn("HIS getDemographics failed - pesel={}, error={}",
                HisDemographicsDto.maskPesel(pesel), ex.getMessage());
            throw ex;
        }
    }

    private HisDemographicsDto toDemographics(HisPatientPayload patient) {
        return HisDemographicsDto.maskedFrom(
            patient.firstName(),
            patient.lastName(),
            patient.pesel(),
            parseDate(patient.dateOfBirth())
        );
    }

    private LocalDate parseDate(String isoDate) {
        if (isoDate == null || isoDate.isBlank()) {
            return null;
        }
        try {
            return LocalDate.parse(isoDate);
        } catch (DateTimeParseException ex) {
            log.warn("HIS returned malformed date_of_birth: {}", isoDate);
            return null;
        }
    }
}
