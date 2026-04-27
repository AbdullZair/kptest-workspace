package com.kptest.domain.audit.repository;

import com.kptest.domain.audit.DataProcessingActivity;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.orm.jpa.DataJpaTest;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;

import java.util.UUID;

import static org.assertj.core.api.Assertions.assertThat;

/**
 * Repository tests for DataProcessingActivityRepository.
 */
@DataJpaTest
@DisplayName("DataProcessingActivityRepository")
class DataProcessingActivityRepositoryTest {

    @Autowired
    private DataProcessingActivityRepository repository;

    private DataProcessingActivity testActivity;

    @BeforeEach
    void setUp() {
        testActivity = DataProcessingActivity.create(
            "Test Processing Activity",
            "Testing data processing for compliance",
            DataProcessingActivity.LegalBasis.CONSENT,
            UUID.randomUUID()
        );
        testActivity.withCategories(java.util.List.of("patients", "users"));
        testActivity.withRecipients(java.util.List.of("internal", "external"));
        testActivity.withRetentionPeriod("5 years");
        testActivity.withSecurityMeasures("Encryption, Access Control");
        testActivity.withDataController("KPTEST Admin");
        testActivity.withDataProcessor("KPTEST System");
    }

    @Test
    @DisplayName("should save and find data processing activity")
    void shouldSaveAndFindDataProcessingActivity() {
        // when
        DataProcessingActivity saved = repository.save(testActivity);
        DataProcessingActivity found = repository.findById(saved.getId()).orElse(null);

        // then
        assertThat(found).isNotNull();
        assertThat(found.getName()).isEqualTo("Test Processing Activity");
        assertThat(found.getPurpose()).isEqualTo("Testing data processing for compliance");
        assertThat(found.getLegalBasis()).isEqualTo(DataProcessingActivity.LegalBasis.CONSENT);
    }

    @Test
    @DisplayName("should find activities by legal basis")
    void shouldFindActivitiesByLegalBasis() {
        // given
        repository.save(testActivity);
        DataProcessingActivity activity2 = DataProcessingActivity.create(
            "Contract Activity",
            "Processing under contract",
            DataProcessingActivity.LegalBasis.CONTRACT,
            UUID.randomUUID()
        );
        repository.save(activity2);

        // when
        Page<DataProcessingActivity> consentActivities = repository.findByLegalBasis(
            DataProcessingActivity.LegalBasis.CONSENT,
            PageRequest.of(0, 10)
        );

        // then
        assertThat(consentActivities.getContent()).hasSize(1);
        assertThat(consentActivities.getContent().get(0).getName()).isEqualTo("Test Processing Activity");
    }

    @Test
    @DisplayName("should update data processing activity")
    void shouldUpdateDataProcessingActivity() {
        // given
        DataProcessingActivity saved = repository.save(testActivity);

        // when
        saved.setPurpose("Updated purpose");
        saved.setRetentionPeriod("10 years");
        DataProcessingActivity updated = repository.save(saved);

        // then
        assertThat(updated.getPurpose()).isEqualTo("Updated purpose");
        assertThat(updated.getRetentionPeriod()).isEqualTo("10 years");
    }

    @Test
    @DisplayName("should delete data processing activity")
    void shouldDeleteDataProcessingActivity() {
        // given
        DataProcessingActivity saved = repository.save(testActivity);

        // when
        repository.delete(saved);

        // then
        assertThat(repository.findById(saved.getId())).isEmpty();
    }
}
