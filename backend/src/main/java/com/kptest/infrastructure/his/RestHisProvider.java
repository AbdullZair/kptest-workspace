package com.kptest.infrastructure.his;

import com.kptest.api.dto.HisDemographicsDto;
import com.kptest.api.dto.HisVerificationResult;
import com.kptest.application.service.HisService;
import com.kptest.exception.HisIntegrationException;
import com.kptest.infrastructure.his.HisClient.HisDemographicsHttpResponse;
import com.kptest.infrastructure.his.HisClient.HisPatientPayload;
import com.kptest.infrastructure.his.HisClient.HisVerifyHttpResponse;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.context.annotation.Profile;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.time.format.DateTimeParseException;
import java.util.Optional;

/**
 * REST-backed implementation of {@link HisService} (US-P-02 / US-S-04).
 *
 * <p>Translates HTTP-level responses returned by {@link HisClient} into
 * domain-level {@link HisVerificationResult}, masks the PESEL on
 * outgoing DTOs, and re-throws transport / 5xx errors as
 * {@link HisIntegrationException}.</p>
 *
 * <p>Activated under any profile other than {@code test}; in tests
 * {@link MockHisProvider} is wired instead so the suite does not depend
 * on the {@code his-mock} container.</p>
 *
 * @see HisClient
 * @see MockHisProvider
 */
@Slf4j
@Service
@Profile("!test")
@RequiredArgsConstructor
public class RestHisProvider implements HisService {

    private final HisClient hisClient;

    @Override
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

    @Override
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
