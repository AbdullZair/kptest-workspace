package com.kptest.infrastructure.his;

import com.fasterxml.jackson.annotation.JsonProperty;
import com.kptest.exception.HisIntegrationException;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpStatusCode;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.http.client.SimpleClientHttpRequestFactory;
import org.springframework.stereotype.Component;
import org.springframework.web.client.ResourceAccessException;
import org.springframework.web.client.RestClient;

import jakarta.annotation.PostConstruct;
import java.time.Duration;
import java.util.Map;
import java.util.Optional;

/**
 * HTTP client for the Hospital Information System (HIS) mock service.
 *
 * <p>Wraps the REST contract exposed by the his-mock service:
 * <ul>
 *     <li>{@code POST /api/v1/patients/verify} - identity + cart match.</li>
 *     <li>{@code GET  /api/v1/patients/{pesel}} - demographics by PESEL.</li>
 * </ul>
 * Authentication is performed via the {@code X-API-Key} header.</p>
 *
 * <p>This component intentionally exposes only HTTP-level concerns:
 * status code translation and JSON parsing. Domain-level decisions
 * (matched / mismatch / not-found) live in
 * {@link com.kptest.application.service.HisService}.</p>
 */
@Slf4j
@Component
public class HisClient {

    private static final String API_KEY_HEADER = "X-API-Key";
    private static final String VERIFY_PATH = "/api/v1/patients/verify";
    private static final String DEMOGRAPHICS_PATH_TEMPLATE = "/api/v1/patients/{pesel}";

    private final String baseUrl;
    private final String apiKey;
    private final Duration connectTimeout;
    private final Duration readTimeout;

    private RestClient restClient;

    public HisClient(
        @Value("${kptest.his.base-url:http://his-mock:8081}") String baseUrl,
        @Value("${kptest.his.api-key:dev-api-key}") String apiKey,
        @Value("${kptest.his.connect-timeout-ms:5000}") long connectTimeoutMs,
        @Value("${kptest.his.read-timeout-ms:10000}") long readTimeoutMs
    ) {
        this.baseUrl = baseUrl;
        this.apiKey = apiKey;
        this.connectTimeout = Duration.ofMillis(connectTimeoutMs);
        this.readTimeout = Duration.ofMillis(readTimeoutMs);
    }

    @PostConstruct
    void init() {
        SimpleClientHttpRequestFactory factory = new SimpleClientHttpRequestFactory();
        factory.setConnectTimeout((int) connectTimeout.toMillis());
        factory.setReadTimeout((int) readTimeout.toMillis());

        this.restClient = RestClient.builder()
            .baseUrl(baseUrl)
            .defaultHeader(API_KEY_HEADER, apiKey)
            .defaultHeader("Accept", MediaType.APPLICATION_JSON_VALUE)
            .requestFactory(factory)
            .build();

        log.info("HisClient initialised - baseUrl={}, connectTimeoutMs={}, readTimeoutMs={}",
            baseUrl, connectTimeout.toMillis(), readTimeout.toMillis());
    }

    /**
     * Setter used in tests to inject a {@link RestClient} configured with a
     * {@link org.springframework.test.web.client.MockRestServiceServer}.
     * Public so it is reachable from tests in other packages; not intended
     * for production use.
     */
    public void setRestClient(RestClient restClient) {
        this.restClient = restClient;
    }

    /**
     * Call the HIS verification endpoint.
     *
     * <p>The response is mapped to an {@link Optional} as follows:
     * <ul>
     *     <li>HTTP 200 -> {@code Optional.of(response)} with {@code verified=true}.</li>
     *     <li>HTTP 400 -> {@code Optional.of(response)} with {@code verified=false}
     *         (cart mismatch).</li>
     *     <li>HTTP 404 -> {@code Optional.empty()} (patient not found in HIS).</li>
     * </ul>
     *
     * @param pesel patient PESEL (11 digits)
     * @param cartNumber cart / chart number assigned by the HIS
     * @return verification response or {@link Optional#empty()} if 404
     * @throws HisIntegrationException on transport or 5xx errors
     */
    public Optional<HisVerifyHttpResponse> verify(String pesel, String cartNumber) {
        Map<String, String> body = Map.of(
            "pesel", pesel,
            "cart_number", cartNumber
        );

        try {
            ResponseEntity<HisVerifyHttpResponse> response = restClient.post()
                .uri(VERIFY_PATH)
                .contentType(MediaType.APPLICATION_JSON)
                .body(body)
                .retrieve()
                .onStatus(HttpStatusCode::is5xxServerError, (req, res) -> {
                    throw new HisIntegrationException(
                        "HIS verify returned server error: " + res.getStatusCode().value());
                })
                .onStatus(status -> status.value() == 404, (req, res) -> {
                    /* swallow; mapped to Optional.empty below */
                })
                .onStatus(status -> status.value() == 400, (req, res) -> {
                    /* swallow; cart mismatch is a domain-level outcome */
                })
                .toEntity(HisVerifyHttpResponse.class);

            if (response.getStatusCode().value() == 404) {
                return Optional.empty();
            }
            return Optional.ofNullable(response.getBody());
        } catch (HisIntegrationException ex) {
            throw ex;
        } catch (ResourceAccessException ex) {
            throw new HisIntegrationException("HIS verify transport error", ex);
        } catch (RuntimeException ex) {
            throw new HisIntegrationException("HIS verify unexpected error", ex);
        }
    }

    /**
     * Fetch full HIS demographics by PESEL.
     *
     * @param pesel patient PESEL (11 digits)
     * @return demographics or {@link Optional#empty()} if HIS returned 404
     * @throws HisIntegrationException on transport or 5xx errors
     */
    public Optional<HisDemographicsHttpResponse> getDemographics(String pesel) {
        try {
            ResponseEntity<HisDemographicsHttpResponse> response = restClient.get()
                .uri(DEMOGRAPHICS_PATH_TEMPLATE, pesel)
                .retrieve()
                .onStatus(HttpStatusCode::is5xxServerError, (req, res) -> {
                    throw new HisIntegrationException(
                        "HIS demographics returned server error: " + res.getStatusCode().value());
                })
                .onStatus(status -> status.value() == 404, (req, res) -> {
                    /* swallow; mapped to Optional.empty below */
                })
                .toEntity(HisDemographicsHttpResponse.class);

            if (response.getStatusCode().value() == 404) {
                return Optional.empty();
            }
            return Optional.ofNullable(response.getBody());
        } catch (HisIntegrationException ex) {
            throw ex;
        } catch (ResourceAccessException ex) {
            throw new HisIntegrationException("HIS demographics transport error", ex);
        } catch (RuntimeException ex) {
            throw new HisIntegrationException("HIS demographics unexpected error", ex);
        }
    }

    /**
     * Wire-level response from {@code POST /api/v1/patients/verify}.
     */
    public record HisVerifyHttpResponse(
        @JsonProperty("verified") Boolean verified,
        @JsonProperty("patient") HisPatientPayload patient,
        @JsonProperty("error") String error
    ) {}

    /**
     * Wire-level response from {@code GET /api/v1/patients/{pesel}}.
     */
    public record HisDemographicsHttpResponse(
        @JsonProperty("pesel") String pesel,
        @JsonProperty("first_name") String firstName,
        @JsonProperty("last_name") String lastName,
        @JsonProperty("date_of_birth") String dateOfBirth,
        @JsonProperty("gender") String gender,
        @JsonProperty("his_patient_id") String hisPatientId
    ) {}

    /**
     * Nested patient payload from the verify response.
     */
    public record HisPatientPayload(
        @JsonProperty("pesel") String pesel,
        @JsonProperty("first_name") String firstName,
        @JsonProperty("last_name") String lastName,
        @JsonProperty("date_of_birth") String dateOfBirth,
        @JsonProperty("gender") String gender,
        @JsonProperty("his_patient_id") String hisPatientId
    ) {}
}
