package com.kptest.application.service;

import com.kptest.api.dto.HisDemographicsDto;
import com.kptest.api.dto.HisVerificationResult;
import com.kptest.exception.HisIntegrationException;
import com.kptest.infrastructure.his.HisClient;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.web.client.MockRestServiceServer;
import org.springframework.web.client.ResourceAccessException;
import org.springframework.web.client.RestClient;

import java.time.LocalDate;

import org.springframework.beans.factory.annotation.Autowired;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.springframework.test.web.client.match.MockRestRequestMatchers.header;
import static org.springframework.test.web.client.match.MockRestRequestMatchers.method;
import static org.springframework.test.web.client.match.MockRestRequestMatchers.requestTo;
import static org.springframework.test.web.client.response.MockRestResponseCreators.withStatus;
import static org.springframework.test.web.client.response.MockRestResponseCreators.withSuccess;

/**
 * Integration tests for {@link HisService}.
 *
 * <p>Uses {@link MockRestServiceServer} bound to the {@link RestClient}
 * inside {@link HisClient}, so we exercise the full HTTP-to-domain
 * mapping without requiring the his-mock container.</p>
 */
@SpringBootTest(
    classes = {HisService.class, HisClient.class},
    properties = {
        "kptest.his.base-url=http://his-mock-test:8081",
        "kptest.his.api-key=test-api-key",
        "kptest.his.connect-timeout-ms=5000",
        "kptest.his.read-timeout-ms=10000",
        "spring.main.web-application-type=none"
    }
)
@ActiveProfiles("test")
@DisplayName("HisService")
class HisServiceTest {

    private static final String VALID_PESEL = "12345678901";
    private static final String VALID_CART = "CART001";

    @Autowired
    private HisService hisService;

    @Autowired
    private HisClient hisClient;

    private MockRestServiceServer mockServer;

    @BeforeEach
    void setUp() {
        RestClient.Builder builder = RestClient.builder()
            .baseUrl("http://his-mock-test:8081")
            .defaultHeader("X-API-Key", "test-api-key")
            .defaultHeader("Accept", MediaType.APPLICATION_JSON_VALUE);
        this.mockServer = MockRestServiceServer.bindTo(builder).build();
        hisClient.setRestClient(builder.build());
    }

    @Test
    @DisplayName("should return MATCHED with masked PESEL when HIS verifies the patient")
    void shouldReturnMatched_whenHisVerifiesPatient() {
        // given
        String responseBody = """
            {
              "verified": true,
              "patient": {
                "pesel": "12345678901",
                "first_name": "Jan",
                "last_name": "Kowalski",
                "date_of_birth": "1980-01-15",
                "gender": "MALE",
                "his_patient_id": "HIS-12345"
              }
            }
            """;
        mockServer.expect(requestTo("http://his-mock-test:8081/api/v1/patients/verify"))
            .andExpect(method(org.springframework.http.HttpMethod.POST))
            .andExpect(header("X-API-Key", "test-api-key"))
            .andRespond(withSuccess(responseBody, MediaType.APPLICATION_JSON));

        // when
        HisVerificationResult result = hisService.verifyPatient(VALID_PESEL, VALID_CART);

        // then
        assertThat(result.status()).isEqualTo(HisVerificationResult.Status.MATCHED);
        assertThat(result.demographics()).isNotNull();
        HisDemographicsDto demo = result.demographics();
        assertThat(demo.firstName()).isEqualTo("Jan");
        assertThat(demo.lastName()).isEqualTo("Kowalski");
        assertThat(demo.dateOfBirth()).isEqualTo(LocalDate.of(1980, 1, 15));
        // PESEL must be masked - only last 4 digits visible
        assertThat(demo.pesel()).endsWith("8901");
        assertThat(demo.pesel()).doesNotContain("12345");
        mockServer.verify();
    }

    @Test
    @DisplayName("should return NOT_FOUND when HIS responds with 404")
    void shouldReturnNotFound_whenHisResponds404() {
        // given
        mockServer.expect(requestTo("http://his-mock-test:8081/api/v1/patients/verify"))
            .andExpect(method(org.springframework.http.HttpMethod.POST))
            .andRespond(withStatus(HttpStatus.NOT_FOUND)
                .contentType(MediaType.APPLICATION_JSON)
                .body("{\"verified\":false,\"error\":\"Patient not found\"}"));

        // when
        HisVerificationResult result = hisService.verifyPatient("99999999999", VALID_CART);

        // then
        assertThat(result.status()).isEqualTo(HisVerificationResult.Status.NOT_FOUND);
        assertThat(result.demographics()).isNull();
        mockServer.verify();
    }

    @Test
    @DisplayName("should return MISMATCH when HIS responds 400 due to cart mismatch")
    void shouldReturnMismatch_whenCartNumberDoesNotMatch() {
        // given
        mockServer.expect(requestTo("http://his-mock-test:8081/api/v1/patients/verify"))
            .andExpect(method(org.springframework.http.HttpMethod.POST))
            .andRespond(withStatus(HttpStatus.BAD_REQUEST)
                .contentType(MediaType.APPLICATION_JSON)
                .body("{\"verified\":false,\"error\":\"Cart number does not match\"}"));

        // when
        HisVerificationResult result = hisService.verifyPatient(VALID_PESEL, "WRONG-CART");

        // then
        assertThat(result.status()).isEqualTo(HisVerificationResult.Status.MISMATCH);
        assertThat(result.demographics()).isNull();
        mockServer.verify();
    }

    @Test
    @DisplayName("should throw HisIntegrationException when HIS returns 5xx")
    void shouldThrowHisIntegrationException_whenServerError() {
        // given
        mockServer.expect(requestTo("http://his-mock-test:8081/api/v1/patients/verify"))
            .andExpect(method(org.springframework.http.HttpMethod.POST))
            .andRespond(withStatus(HttpStatus.INTERNAL_SERVER_ERROR));

        // when / then
        assertThatThrownBy(() -> hisService.verifyPatient(VALID_PESEL, VALID_CART))
            .isInstanceOf(HisIntegrationException.class)
            .hasMessageContaining("server error");
        mockServer.verify();
    }

    @Test
    @DisplayName("should throw HisIntegrationException on transport error")
    void shouldThrowHisIntegrationException_onTransportError() {
        // given - simulate transport failure by configuring a builder that
        // will fail to connect; we use a request matcher that throws a
        // ResourceAccessException to mimic SocketTimeoutException.
        RestClient.Builder builder = RestClient.builder()
            .baseUrl("http://his-mock-test:8081")
            .defaultHeader("X-API-Key", "test-api-key");
        MockRestServiceServer brokenServer = MockRestServiceServer.bindTo(builder).build();
        brokenServer.expect(requestTo("http://his-mock-test:8081/api/v1/patients/verify"))
            .andRespond(req -> { throw new java.net.SocketTimeoutException("read timed out"); });
        hisClient.setRestClient(builder.build());

        // when / then
        assertThatThrownBy(() -> hisService.verifyPatient(VALID_PESEL, VALID_CART))
            .isInstanceOf(HisIntegrationException.class)
            .hasMessageContaining("transport error");
    }

    @Test
    @DisplayName("getDemographics should return masked PESEL when HIS returns 200")
    void getDemographics_shouldReturnMaskedPesel_whenHisReturns200() {
        // given
        String responseBody = """
            {
              "pesel": "98765432109",
              "first_name": "Anna",
              "last_name": "Nowak",
              "date_of_birth": "1990-05-20",
              "gender": "FEMALE",
              "his_patient_id": "HIS-67890"
            }
            """;
        mockServer.expect(requestTo("http://his-mock-test:8081/api/v1/patients/98765432109"))
            .andExpect(method(org.springframework.http.HttpMethod.GET))
            .andExpect(header("X-API-Key", "test-api-key"))
            .andRespond(withSuccess(responseBody, MediaType.APPLICATION_JSON));

        // when
        HisDemographicsDto demo = hisService.getDemographics("98765432109");

        // then
        assertThat(demo.firstName()).isEqualTo("Anna");
        assertThat(demo.lastName()).isEqualTo("Nowak");
        assertThat(demo.pesel()).endsWith("2109");
        assertThat(demo.pesel()).doesNotContain("98765");
        assertThat(demo.dateOfBirth()).isEqualTo(LocalDate.of(1990, 5, 20));
        mockServer.verify();
    }

}
