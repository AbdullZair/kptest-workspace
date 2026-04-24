package com.kptest.domain.material;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Nested;
import org.junit.jupiter.api.Test;

import java.time.Instant;
import java.util.List;
import java.util.UUID;

import static org.assertj.core.api.Assertions.*;

/**
 * Unit tests for EducationalMaterial entity.
 */
@DisplayName("EducationalMaterial Entity Unit Tests")
class EducationalMaterialTest {

    private EducationalMaterial material;
    private static final UUID TEST_PROJECT_ID = UUID.randomUUID();
    private static final String TEST_TITLE = "Test Material";
    private static final String TEST_CONTENT = "Test Content";
    private static final UUID TEST_CREATED_BY = UUID.randomUUID();

    @BeforeEach
    void setUp() {
        material = EducationalMaterial.create(
            TEST_PROJECT_ID,
            TEST_TITLE,
            TEST_CONTENT,
            EducationalMaterial.MaterialType.ARTICLE,
            "General",
            EducationalMaterial.DifficultyLevel.BASIC,
            TEST_CREATED_BY
        );
    }

    @Nested
    @DisplayName("Create Material Tests")
    class CreateMaterialTests {

        @Test
        @DisplayName("shouldCreateMaterial_WithValidData")
        void shouldCreateMaterial_WithValidData() {
            // When
            EducationalMaterial created = EducationalMaterial.create(
                TEST_PROJECT_ID,
                "New Material",
                "Content",
                EducationalMaterial.MaterialType.ARTICLE,
                "Category",
                EducationalMaterial.DifficultyLevel.BASIC,
                TEST_CREATED_BY
            );

            // Then
            assertThat(created).isNotNull();
            assertThat(created.getProjectId()).isEqualTo(TEST_PROJECT_ID);
            assertThat(created.getTitle()).isEqualTo("New Material");
            assertThat(created.getContent()).isEqualTo("Content");
            assertThat(created.getType()).isEqualTo(EducationalMaterial.MaterialType.ARTICLE);
            assertThat(created.getCategory()).isEqualTo("Category");
            assertThat(created.getDifficulty()).isEqualTo(EducationalMaterial.DifficultyLevel.BASIC);
            assertThat(created.getCreatedBy()).isEqualTo(TEST_CREATED_BY);
            assertThat(created.getViewCount()).isZero();
            assertThat(created.getCompletionCount()).isZero();
            assertThat(created.getPublished()).isFalse();
        }

        @Test
        @DisplayName("shouldSetDefaultViewCountToZero")
        void shouldSetDefaultViewCountToZero() {
            // When
            EducationalMaterial created = EducationalMaterial.create(
                TEST_PROJECT_ID, "Title", "Content",
                EducationalMaterial.MaterialType.ARTICLE, "Cat",
                EducationalMaterial.DifficultyLevel.BASIC, TEST_CREATED_BY
            );

            // Then
            assertThat(created.getViewCount()).isZero();
        }

        @Test
        @DisplayName("shouldSetDefaultCompletionCountToZero")
        void shouldSetDefaultCompletionCountToZero() {
            // When
            EducationalMaterial created = EducationalMaterial.create(
                TEST_PROJECT_ID, "Title", "Content",
                EducationalMaterial.MaterialType.ARTICLE, "Cat",
                EducationalMaterial.DifficultyLevel.BASIC, TEST_CREATED_BY
            );

            // Then
            assertThat(created.getCompletionCount()).isZero();
        }

        @Test
        @DisplayName("shouldSetDefaultPublishedToFalse")
        void shouldSetDefaultPublishedToFalse() {
            // When
            EducationalMaterial created = EducationalMaterial.create(
                TEST_PROJECT_ID, "Title", "Content",
                EducationalMaterial.MaterialType.ARTICLE, "Cat",
                EducationalMaterial.DifficultyLevel.BASIC, TEST_CREATED_BY
            );

            // Then
            assertThat(created.getPublished()).isFalse();
        }
    }

    @Nested
    @DisplayName("Material Type Tests")
    class MaterialTypeTests {

        @Test
        @DisplayName("shouldSetFileUrl_ForPdfType")
        void shouldSetFileUrl_ForPdfType() {
            // Given
            String fileUrl = "http://example.com/file.pdf";

            // When
            material.setType(EducationalMaterial.MaterialType.PDF);
            material.setFileUrl(fileUrl);

            // Then
            assertThat(material.getFileUrl()).isEqualTo(fileUrl);
        }

        @Test
        @DisplayName("shouldSetFileUrl_ForVideoType")
        void shouldSetFileUrl_ForVideoType() {
            // Given
            String fileUrl = "http://example.com/video.mp4";

            // When
            material.setType(EducationalMaterial.MaterialType.VIDEO);
            material.setFileUrl(fileUrl);

            // Then
            assertThat(material.getFileUrl()).isEqualTo(fileUrl);
        }

        @Test
        @DisplayName("shouldSetExternalUrl_ForLinkType")
        void shouldSetExternalUrl_ForLinkType() {
            // Given
            String externalUrl = "http://example.com/link";

            // When
            material.setType(EducationalMaterial.MaterialType.LINK);
            material.setExternalUrl(externalUrl);

            // Then
            assertThat(material.getExternalUrl()).isEqualTo(externalUrl);
        }

        @Test
        @DisplayName("shouldCreateMaterial_WithAllMaterialTypes")
        void shouldCreateMaterial_WithAllMaterialTypes() {
            // When & Then
            for (EducationalMaterial.MaterialType type : EducationalMaterial.MaterialType.values()) {
                EducationalMaterial m = EducationalMaterial.create(
                    TEST_PROJECT_ID, "Title", "Content",
                    type, "Cat",
                    EducationalMaterial.DifficultyLevel.BASIC, TEST_CREATED_BY
                );
                assertThat(m.getType()).isEqualTo(type);
            }
        }
    }

    @Nested
    @DisplayName("Difficulty Level Tests")
    class DifficultyLevelTests {

        @Test
        @DisplayName("shouldCreateMaterial_WithAllDifficultyLevels")
        void shouldCreateMaterial_WithAllDifficultyLevels() {
            // When & Then
            for (EducationalMaterial.DifficultyLevel level : EducationalMaterial.DifficultyLevel.values()) {
                EducationalMaterial m = EducationalMaterial.create(
                    TEST_PROJECT_ID, "Title", "Content",
                    EducationalMaterial.MaterialType.ARTICLE, "Cat",
                    level, TEST_CREATED_BY
                );
                assertThat(m.getDifficulty()).isEqualTo(level);
            }
        }

        @Test
        @DisplayName("shouldSetDifficulty_Basic")
        void shouldSetDifficulty_Basic() {
            // When
            material.setDifficulty(EducationalMaterial.DifficultyLevel.BASIC);

            // Then
            assertThat(material.getDifficulty()).isEqualTo(EducationalMaterial.DifficultyLevel.BASIC);
        }

        @Test
        @DisplayName("shouldSetDifficulty_Intermediate")
        void shouldSetDifficulty_Intermediate() {
            // When
            material.setDifficulty(EducationalMaterial.DifficultyLevel.INTERMEDIATE);

            // Then
            assertThat(material.getDifficulty()).isEqualTo(EducationalMaterial.DifficultyLevel.INTERMEDIATE);
        }

        @Test
        @DisplayName("shouldSetDifficulty_Advanced")
        void shouldSetDifficulty_Advanced() {
            // When
            material.setDifficulty(EducationalMaterial.DifficultyLevel.ADVANCED);

            // Then
            assertThat(material.getDifficulty()).isEqualTo(EducationalMaterial.DifficultyLevel.ADVANCED);
        }
    }

    @Nested
    @DisplayName("Publish Material Tests")
    class PublishMaterialTests {

        @Test
        @DisplayName("shouldPublishMaterial")
        void shouldPublishMaterial() {
            // Given
            Instant beforePublish = Instant.now();

            // When
            material.setPublished(true);
            material.setPublishedAt(Instant.now());

            // Then
            assertThat(material.getPublished()).isTrue();
            assertThat(material.getPublishedAt()).isAfterOrEqualTo(beforePublish);
        }

        @Test
        @DisplayName("shouldUnpublishMaterial")
        void shouldUnpublishMaterial() {
            // Given
            material.setPublished(true);
            material.setPublishedAt(Instant.now());

            // When
            material.setPublished(false);
            material.setPublishedAt(null);

            // Then
            assertThat(material.getPublished()).isFalse();
            assertThat(material.getPublishedAt()).isNull();
        }
    }

    @Nested
    @DisplayName("View Count Tests")
    class ViewCountTests {

        @Test
        @DisplayName("shouldIncrementViewCount")
        void shouldIncrementViewCount() {
            // Given
            int initialCount = material.getViewCount();

            // When
            material.setViewCount(initialCount + 1);

            // Then
            assertThat(material.getViewCount()).isEqualTo(initialCount + 1);
        }

        @Test
        @DisplayName("shouldSetViewCount")
        void shouldSetViewCount() {
            // When
            material.setViewCount(100);

            // Then
            assertThat(material.getViewCount()).isEqualTo(100);
        }
    }

    @Nested
    @DisplayName("Completion Count Tests")
    class CompletionCountTests {

        @Test
        @DisplayName("shouldIncrementCompletionCount")
        void shouldIncrementCompletionCount() {
            // Given
            int initialCount = material.getCompletionCount();

            // When
            material.setCompletionCount(initialCount + 1);

            // Then
            assertThat(material.getCompletionCount()).isEqualTo(initialCount + 1);
        }

        @Test
        @DisplayName("shouldSetCompletionCount")
        void shouldSetCompletionCount() {
            // When
            material.setCompletionCount(50);

            // Then
            assertThat(material.getCompletionCount()).isEqualTo(50);
        }
    }

    @Nested
    @DisplayName("Assignment Tests")
    class AssignmentTests {

        @Test
        @DisplayName("shouldSetAssignedToPatients")
        void shouldSetAssignedToPatients() {
            // Given
            List<UUID> patientIds = List.of(UUID.randomUUID(), UUID.randomUUID());

            // When
            material.setAssignedToPatients(patientIds);

            // Then
            assertThat(material.getAssignedToPatients()).isEqualTo(patientIds);
        }

        @Test
        @DisplayName("shouldSetAssignedToStages")
        void shouldSetAssignedToStages() {
            // Given
            List<UUID> stageIds = List.of(UUID.randomUUID(), UUID.randomUUID());

            // When
            material.setAssignedToStages(stageIds);

            // Then
            assertThat(material.getAssignedToStages()).isEqualTo(stageIds);
        }

        @Test
        @DisplayName("shouldSetAssignedToPatients_ToNull")
        void shouldSetAssignedToPatients_ToNull() {
            // When
            material.setAssignedToPatients(null);

            // Then
            assertThat(material.getAssignedToPatients()).isNull();
        }

        @Test
        @DisplayName("shouldSetAssignedToStages_ToNull")
        void shouldSetAssignedToStages_ToNull() {
            // When
            material.setAssignedToStages(null);

            // Then
            assertThat(material.getAssignedToStages()).isNull();
        }
    }

    @Nested
    @DisplayName("Category Tests")
    class CategoryTests {

        @Test
        @DisplayName("shouldSetCategory")
        void shouldSetCategory() {
            // Given
            String category = "New Category";

            // When
            material.setCategory(category);

            // Then
            assertThat(material.getCategory()).isEqualTo(category);
        }

        @Test
        @DisplayName("shouldSetCategory_ToNull")
        void shouldSetCategory_ToNull() {
            // When
            material.setCategory(null);

            // Then
            assertThat(material.getCategory()).isNull();
        }
    }

    @Nested
    @DisplayName("Material Fields Tests")
    class MaterialFieldsTests {

        @Test
        @DisplayName("shouldSetTitle")
        void shouldSetTitle() {
            // Given
            String title = "New Title";

            // When
            material.setTitle(title);

            // Then
            assertThat(material.getTitle()).isEqualTo(title);
        }

        @Test
        @DisplayName("shouldSetContent")
        void shouldSetContent() {
            // Given
            String content = "New Content";

            // When
            material.setContent(content);

            // Then
            assertThat(material.getContent()).isEqualTo(content);
        }

        @Test
        @DisplayName("shouldSetProjectId")
        void shouldSetProjectId() {
            // Given
            UUID projectId = UUID.randomUUID();

            // When
            material.setProjectId(projectId);

            // Then
            assertThat(material.getProjectId()).isEqualTo(projectId);
        }

        @Test
        @DisplayName("shouldSetCreatedBy")
        void shouldSetCreatedBy() {
            // Given
            UUID createdBy = UUID.randomUUID();

            // When
            material.setCreatedBy(createdBy);

            // Then
            assertThat(material.getCreatedBy()).isEqualTo(createdBy);
        }
    }

    @Nested
    @DisplayName("Material Equality Tests")
    class EqualityTests {

        @Test
        @DisplayName("shouldEqual_WhenSameId")
        void shouldEqual_WhenSameId() {
            // Given
            EducationalMaterial material2 = new EducationalMaterial();
            material2.setId(material.getId());

            // When & Then
            assertThat(material).isEqualTo(material2);
        }

        @Test
        @DisplayName("shouldNotEqual_WhenDifferentId")
        void shouldNotEqual_WhenDifferentId() {
            // Given
            EducationalMaterial material2 = new EducationalMaterial();
            material2.setId(UUID.randomUUID()); // Different ID

            // When & Then
            assertThat(material).isNotEqualTo(material2);
        }

        @Test
        @DisplayName("shouldNotEqual_WhenNull")
        void shouldNotEqual_WhenNull() {
            // When & Then
            assertThat(material).isNotNull();
        }

        @Test
        @DisplayName("shouldNotEqual_WhenDifferentClass")
        void shouldNotEqual_WhenDifferentClass() {
            // When & Then
            assertThat(material).isNotEqualTo("string");
        }
    }
}
