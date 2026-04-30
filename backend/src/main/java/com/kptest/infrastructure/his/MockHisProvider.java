package com.kptest.infrastructure.his;

import com.kptest.api.dto.HisDemographicsDto;
import com.kptest.api.dto.HisVerificationResult;
import com.kptest.application.service.HisService;
import com.kptest.exception.HisIntegrationException;
import lombok.extern.slf4j.Slf4j;
import org.springframework.context.annotation.Profile;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.util.Map;

/**
 * In-memory mock implementation of {@link HisService} for the {@code test}
 * Spring profile (US-S-05 — extension points).
 *
 * <p>Hardcoded fixture set:
 * <ul>
 *     <li>{@code 12345678901} / cart {@code CART-001} — Jan Kowalski,
 *         born 1980-05-12 → {@link HisVerificationResult.Status#MATCHED}.</li>
 *     <li>{@code 98765432109} / cart {@code CART-002} — Anna Nowak,
 *         born 1992-11-03 → {@link HisVerificationResult.Status#MATCHED}.</li>
 *     <li>{@code 11111111111} / cart {@code CART-003} — Piotr Wiśniewski,
 *         born 1975-01-20 → {@link HisVerificationResult.Status#MATCHED}.</li>
 *     <li>everything else → {@link HisVerificationResult.Status#NOT_FOUND}.</li>
 * </ul>
 *
 * <p>If the PESEL is known but the supplied {@code cartNumber} does not
 * match the fixture, {@link HisVerificationResult.Status#MISMATCH} is
 * returned instead.</p>
 *
 * <p>Performs no network I/O — does not require the {@code his-mock}
 * container, which makes it suitable for fast Spring slice tests and
 * Testcontainers stacks where HIS is out of scope.</p>
 *
 * @see RestHisProvider
 */
@Slf4j
@Service
@Profile("test")
public class MockHisProvider implements HisService {

    private record MockPatient(
        String firstName,
        String lastName,
        String pesel,
        LocalDate dateOfBirth,
        String cartNumber
    ) {}

    private static final Map<String, MockPatient> FIXTURES = Map.of(
        "12345678901", new MockPatient(
            "Jan", "Kowalski", "12345678901", LocalDate.of(1980, 5, 12), "CART-001"),
        "98765432109", new MockPatient(
            "Anna", "Nowak", "98765432109", LocalDate.of(1992, 11, 3), "CART-002"),
        "11111111111", new MockPatient(
            "Piotr", "Wiśniewski", "11111111111", LocalDate.of(1975, 1, 20), "CART-003")
    );

    @Override
    public HisVerificationResult verifyPatient(String pesel, String cartNumber) {
        log.debug("MockHisProvider verify - pesel={}, cartNumber={}",
            HisDemographicsDto.maskPesel(pesel), cartNumber);

        MockPatient fixture = FIXTURES.get(pesel);
        if (fixture == null) {
            return HisVerificationResult.notFound();
        }
        if (!fixture.cartNumber().equals(cartNumber)) {
            return HisVerificationResult.mismatch();
        }
        return HisVerificationResult.matched(toDto(fixture));
    }

    @Override
    public HisDemographicsDto getDemographics(String pesel) {
        log.debug("MockHisProvider getDemographics - pesel={}",
            HisDemographicsDto.maskPesel(pesel));

        MockPatient fixture = FIXTURES.get(pesel);
        if (fixture == null) {
            throw new HisIntegrationException(
                "MockHisProvider: no fixture for pesel=" + HisDemographicsDto.maskPesel(pesel));
        }
        return toDto(fixture);
    }

    private HisDemographicsDto toDto(MockPatient fixture) {
        return HisDemographicsDto.maskedFrom(
            fixture.firstName(),
            fixture.lastName(),
            fixture.pesel(),
            fixture.dateOfBirth()
        );
    }
}
