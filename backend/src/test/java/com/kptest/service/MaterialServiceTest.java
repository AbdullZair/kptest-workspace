package com.kptest.service;

import com.kptest.api.dto.*;
import com.kptest.application.service.MaterialService;
import com.kptest.domain.material.EducationalMaterial;
import com.kptest.domain.material.MaterialProgress;
import com.kptest.domain.material.repository.EducationalMaterialRepository;
import com.kptest.domain.material.repository.MaterialProgressRepository;
import com.kptest.domain.patient.Patient;
import com.kptest.domain.patient.PatientRepository;
import com.kptest.domain.user.User;
import com.kptest.domain.user.UserRole;
import com.kptest.exception.ResourceNotFoundException;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Nested;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.ArgumentCaptor;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.data.domain.Pageable;

import java.time.Instant;
import java.util.*;

import static org.assertj.core.api.Assertions.*;
import static org.mockito.ArgumentMatchers.*;
import static org.mockito.BDDMockito.*;

/**
 * Unit tests for MaterialService.
 */
@ExtendWith(MockitoExtension.class)
@DisplayName("MaterialService Unit Tests")
class MaterialServiceTest {

    @Mock
    private EducationalMaterialRepository materialRepository;

    @Mock
    private MaterialProgressRepository progressRepository;

    @Mock
    private PatientRepository patientRepository;

    private MaterialService materialService;

    private EducationalMaterial testMaterial;
    private MaterialProgress testProgress;
    private static final UUID TEST_MATERIAL_ID = UUID.randomUUID();
    private static final UUID TEST_PROJECT_ID = UUID.randomUUID();
    private static final UUID TEST_PATIENT_ID = UUID.randomUUID();
    private static final UUID TEST_USER_ID = UUID.randomUUID();

    @BeforeEach
    void setUp() {
        materialService = new MaterialService(materialRepository, progressRepository, patientRepository);
        testMaterial = createTestMaterial();
        testProgress = createTestProgress();
    }

    private EducationalMaterial createTestMaterial() {
        EducationalMaterial material = EducationalMaterial.create(
            TEST_PROJECT_ID,
            "Test Material",
            "Test Content",
            EducationalMaterial.MaterialType.ARTICLE,
            "General",
            EducationalMaterial.DifficultyLevel.BASIC,
            TEST_USER_ID
        );
        material.setId(TEST_MATERIAL_ID);
        material.setPublished(false);
        material.setViewCount(0);
        material.setCompletionCount(0);
        material.setCreatedAt(Instant.now());
        material.setUpdatedAt(Instant.now());
        return material;
    }

    private MaterialProgress createTestProgress() {
        MaterialProgress progress = MaterialProgress.create(TEST_MATERIAL_ID, TEST_PATIENT_ID);
        progress.setId(UUID.randomUUID());
        progress.setCreatedAt(Instant.now());
        return progress;
    }

    @Nested
    @DisplayName("Get Materials Tests")
    class GetMaterialsTests {

        @Test
        @DisplayName("shouldGetMaterials_WithFilters")
        void shouldGetMaterials_WithFilters() {
            // Given
            MaterialFilters filters = MaterialFilters.builder()
                .projectId(TEST_PROJECT_ID)
                .category("General")
                .difficulty(EducationalMaterial.DifficultyLevel.BASIC)
                .type(EducationalMaterial.MaterialType.ARTICLE)
                .published(true)
                .build();
            given(materialRepository.findAllWithFilters(any(), any(), any(), any(), any(), any()))
                .willReturn(List.of(testMaterial));

            // When
            List<EducationalMaterialDto> result = materialService.getMaterials(filters);

            // Then
            assertThat(result).hasSize(1);
            assertThat(result.get(0).title()).isEqualTo("Test Material");
        }

        @Test
        @DisplayName("shouldGetMaterials_WithProjectIdOnly")
        void shouldGetMaterials_WithProjectIdOnly() {
            // Given
            MaterialFilters filters = MaterialFilters.builder()
                .projectId(TEST_PROJECT_ID)
                .build();
            given(materialRepository.findAllWithFilters(eq(TEST_PROJECT_ID), any(), any(), any(), any(), any()))
                .willReturn(List.of(testMaterial));

            // When
            List<EducationalMaterialDto> result = materialService.getMaterials(filters);

            // Then
            assertThat(result).hasSize(1);
        }

        @Test
        @DisplayName("shouldReturnEmptyList_WhenNoMaterialsFound")
        void shouldReturnEmptyList_WhenNoMaterialsFound() {
            // Given
            MaterialFilters filters = MaterialFilters.builder()
                .projectId(TEST_PROJECT_ID)
                .build();
            given(materialRepository.findAllWithFilters(any(), any(), any(), any(), any(), any()))
                .willReturn(Collections.emptyList());

            // When
            List<EducationalMaterialDto> result = materialService.getMaterials(filters);

            // Then
            assertThat(result).isEmpty();
        }

        @Test
        @DisplayName("shouldThrowIllegalArgumentException_WhenProjectIdIsNull")
        void shouldThrowIllegalArgumentException_WhenProjectIdIsNull() {
            // Given
            MaterialFilters filters = MaterialFilters.builder().build();

            // When & Then
            assertThatThrownBy(() -> materialService.getMaterials(filters))
                .isInstanceOf(IllegalArgumentException.class)
                .hasMessageContaining("Project ID is required");
        }
    }

    @Nested
    @DisplayName("Get Material By ID Tests")
    class GetMaterialByIdTests {

        @Test
        @DisplayName("shouldGetMaterialById_WhenMaterialExists")
        void shouldGetMaterialById_WhenMaterialExists() {
            // Given
            given(materialRepository.findById(TEST_MATERIAL_ID)).willReturn(Optional.of(testMaterial));

            // When
            EducationalMaterialDto result = materialService.getMaterialById(TEST_MATERIAL_ID);

            // Then
            assertThat(result).isNotNull();
            assertThat(result.id()).isEqualTo(TEST_MATERIAL_ID);
        }

        @Test
        @DisplayName("shouldThrowResourceNotFoundException_WhenMaterialNotFound")
        void shouldThrowResourceNotFoundException_WhenMaterialNotFound() {
            // Given
            given(materialRepository.findById(TEST_MATERIAL_ID)).willReturn(Optional.empty());

            // When & Then
            assertThatThrownBy(() -> materialService.getMaterialById(TEST_MATERIAL_ID))
                .isInstanceOf(ResourceNotFoundException.class)
                .hasMessageContaining("Material not found");
        }
    }

    @Nested
    @DisplayName("Create Material Tests")
    class CreateMaterialTests {

        @Test
        @DisplayName("shouldCreateMaterial_WithValidData")
        void shouldCreateMaterial_WithValidData() {
            // Given
            EducationalMaterialDto dto = createMaterialDto();
            given(materialRepository.save(any(EducationalMaterial.class))).willReturn(testMaterial);

            // When
            EducationalMaterialDto result = materialService.createMaterial(dto);

            // Then
            assertThat(result).isNotNull();
            then(materialRepository).should().save(any(EducationalMaterial.class));
        }

        @Test
        @DisplayName("shouldCreateMaterial_WithFileUrl")
        void shouldCreateMaterial_WithFileUrl() {
            // Given
            EducationalMaterialDto dto = createMaterialDtoBuilder()
                .type(EducationalMaterial.MaterialType.PDF)
                .fileUrl("http://example.com/file.pdf")
                .build();
            given(materialRepository.save(any(EducationalMaterial.class))).willReturn(testMaterial);

            // When
            EducationalMaterialDto result = materialService.createMaterial(dto);

            // Then
            assertThat(result).isNotNull();
        }

        @Test
        @DisplayName("shouldCreateMaterial_WithExternalUrl")
        void shouldCreateMaterial_WithExternalUrl() {
            // Given
            EducationalMaterialDto dto = createMaterialDtoBuilder()
                .type(EducationalMaterial.MaterialType.LINK)
                .externalUrl("http://example.com")
                .build();
            given(materialRepository.save(any(EducationalMaterial.class))).willReturn(testMaterial);

            // When
            EducationalMaterialDto result = materialService.createMaterial(dto);

            // Then
            assertThat(result).isNotNull();
        }

        @Test
        @DisplayName("shouldCreateMaterial_WithPublished")
        void shouldCreateMaterial_WithPublished() {
            // Given
            EducationalMaterialDto dto = createMaterialDtoBuilder()
                .published(true)
                .build();
            given(materialRepository.save(any(EducationalMaterial.class))).willReturn(testMaterial);

            // When
            EducationalMaterialDto result = materialService.createMaterial(dto);

            // Then
            ArgumentCaptor<EducationalMaterial> captor = ArgumentCaptor.forClass(EducationalMaterial.class);
            then(materialRepository).should().save(captor.capture());
            assertThat(captor.getValue().getPublished()).isTrue();
        }

        @Test
        @DisplayName("shouldThrowIllegalArgumentException_WhenPdfMissingFileUrl")
        void shouldThrowIllegalArgumentException_WhenPdfMissingFileUrl() {
            // Given
            EducationalMaterialDto dto = createMaterialDtoBuilder()
                .type(EducationalMaterial.MaterialType.PDF)
                .fileUrl(null)
                .build();

            // When & Then
            assertThatThrownBy(() -> materialService.createMaterial(dto))
                .isInstanceOf(IllegalArgumentException.class)
                .hasMessageContaining("File URL is required");
        }

        @Test
        @DisplayName("shouldThrowIllegalArgumentException_WhenVideoMissingFileUrl")
        void shouldThrowIllegalArgumentException_WhenVideoMissingFileUrl() {
            // Given
            EducationalMaterialDto dto = createMaterialDtoBuilder()
                .type(EducationalMaterial.MaterialType.VIDEO)
                .fileUrl(null)
                .build();

            // When & Then
            assertThatThrownBy(() -> materialService.createMaterial(dto))
                .isInstanceOf(IllegalArgumentException.class)
                .hasMessageContaining("File URL is required");
        }

        @Test
        @DisplayName("shouldThrowIllegalArgumentException_WhenLinkMissingExternalUrl")
        void shouldThrowIllegalArgumentException_WhenLinkMissingExternalUrl() {
            // Given
            EducationalMaterialDto dto = createMaterialDtoBuilder()
                .type(EducationalMaterial.MaterialType.LINK)
                .externalUrl(null)
                .build();

            // When & Then
            assertThatThrownBy(() -> materialService.createMaterial(dto))
                .isInstanceOf(IllegalArgumentException.class)
                .hasMessageContaining("External URL is required");
        }
    }

    @Nested
    @DisplayName("Update Material Tests")
    class UpdateMaterialTests {

        @Test
        @DisplayName("shouldUpdateMaterial_WithTitle")
        void shouldUpdateMaterial_WithTitle() {
            // Given
            EducationalMaterialDto dto = createMaterialDtoBuilder().title("Updated Title").build();
            given(materialRepository.findById(TEST_MATERIAL_ID)).willReturn(Optional.of(testMaterial));
            given(materialRepository.save(any(EducationalMaterial.class))).willReturn(testMaterial);

            // When
            EducationalMaterialDto result = materialService.updateMaterial(TEST_MATERIAL_ID, dto);

            // Then
            assertThat(result).isNotNull();
            assertThat(testMaterial.getTitle()).isEqualTo("Updated Title");
        }

        @Test
        @DisplayName("shouldUpdateMaterial_WithContent")
        void shouldUpdateMaterial_WithContent() {
            // Given
            EducationalMaterialDto dto = createMaterialDtoBuilder().content("Updated Content").build();
            given(materialRepository.findById(TEST_MATERIAL_ID)).willReturn(Optional.of(testMaterial));
            given(materialRepository.save(any(EducationalMaterial.class))).willReturn(testMaterial);

            // When
            EducationalMaterialDto result = materialService.updateMaterial(TEST_MATERIAL_ID, dto);

            // Then
            assertThat(testMaterial.getContent()).isEqualTo("Updated Content");
        }

        @Test
        @DisplayName("shouldUpdateMaterial_WithType")
        void shouldUpdateMaterial_WithType() {
            // Given
            EducationalMaterialDto dto = createMaterialDtoBuilder()
                .type(EducationalMaterial.MaterialType.VIDEO)
                .build();
            given(materialRepository.findById(TEST_MATERIAL_ID)).willReturn(Optional.of(testMaterial));
            given(materialRepository.save(any(EducationalMaterial.class))).willReturn(testMaterial);

            // When
            EducationalMaterialDto result = materialService.updateMaterial(TEST_MATERIAL_ID, dto);

            // Then
            assertThat(testMaterial.getType()).isEqualTo(EducationalMaterial.MaterialType.VIDEO);
        }

        @Test
        @DisplayName("shouldUpdateMaterial_WithCategory")
        void shouldUpdateMaterial_WithCategory() {
            // Given
            EducationalMaterialDto dto = createMaterialDtoBuilder().category("Updated Category").build();
            given(materialRepository.findById(TEST_MATERIAL_ID)).willReturn(Optional.of(testMaterial));
            given(materialRepository.save(any(EducationalMaterial.class))).willReturn(testMaterial);

            // When
            EducationalMaterialDto result = materialService.updateMaterial(TEST_MATERIAL_ID, dto);

            // Then
            assertThat(testMaterial.getCategory()).isEqualTo("Updated Category");
        }

        @Test
        @DisplayName("shouldUpdateMaterial_WithDifficulty")
        void shouldUpdateMaterial_WithDifficulty() {
            // Given
            EducationalMaterialDto dto = createMaterialDtoBuilder()
                .difficulty(EducationalMaterial.DifficultyLevel.ADVANCED)
                .build();
            given(materialRepository.findById(TEST_MATERIAL_ID)).willReturn(Optional.of(testMaterial));
            given(materialRepository.save(any(EducationalMaterial.class))).willReturn(testMaterial);

            // When
            EducationalMaterialDto result = materialService.updateMaterial(TEST_MATERIAL_ID, dto);

            // Then
            assertThat(testMaterial.getDifficulty()).isEqualTo(EducationalMaterial.DifficultyLevel.ADVANCED);
        }

        @Test
        @DisplayName("shouldUpdateMaterial_WithFileUrl")
        void shouldUpdateMaterial_WithFileUrl() {
            // Given
            EducationalMaterialDto dto = createMaterialDtoBuilder()
                .fileUrl("http://example.com/new-file.pdf")
                .build();
            given(materialRepository.findById(TEST_MATERIAL_ID)).willReturn(Optional.of(testMaterial));
            given(materialRepository.save(any(EducationalMaterial.class))).willReturn(testMaterial);

            // When
            EducationalMaterialDto result = materialService.updateMaterial(TEST_MATERIAL_ID, dto);

            // Then
            assertThat(testMaterial.getFileUrl()).isEqualTo("http://example.com/new-file.pdf");
        }

        @Test
        @DisplayName("shouldUpdateMaterial_WithExternalUrl")
        void shouldUpdateMaterial_WithExternalUrl() {
            // Given
            EducationalMaterialDto dto = createMaterialDtoBuilder()
                .externalUrl("http://example.com/new-link")
                .build();
            given(materialRepository.findById(TEST_MATERIAL_ID)).willReturn(Optional.of(testMaterial));
            given(materialRepository.save(any(EducationalMaterial.class))).willReturn(testMaterial);

            // When
            EducationalMaterialDto result = materialService.updateMaterial(TEST_MATERIAL_ID, dto);

            // Then
            assertThat(testMaterial.getExternalUrl()).isEqualTo("http://example.com/new-link");
        }

        @Test
        @DisplayName("shouldUpdateMaterial_WithAssignedToPatients")
        void shouldUpdateMaterial_WithAssignedToPatients() {
            // Given
            List<UUID> patientIds = List.of(UUID.randomUUID(), UUID.randomUUID());
            EducationalMaterialDto dto = createMaterialDtoBuilder()
                .assignedToPatients(patientIds)
                .build();
            given(materialRepository.findById(TEST_MATERIAL_ID)).willReturn(Optional.of(testMaterial));
            given(materialRepository.save(any(EducationalMaterial.class))).willReturn(testMaterial);

            // When
            EducationalMaterialDto result = materialService.updateMaterial(TEST_MATERIAL_ID, dto);

            // Then
            assertThat(testMaterial.getAssignedToPatients()).isEqualTo(patientIds);
        }

        @Test
        @DisplayName("shouldUpdateMaterial_WithAssignedToStages")
        void shouldUpdateMaterial_WithAssignedToStages() {
            // Given
            List<UUID> stageIds = List.of(UUID.randomUUID(), UUID.randomUUID());
            EducationalMaterialDto dto = createMaterialDtoBuilder()
                .assignedToStages(stageIds)
                .build();
            given(materialRepository.findById(TEST_MATERIAL_ID)).willReturn(Optional.of(testMaterial));
            given(materialRepository.save(any(EducationalMaterial.class))).willReturn(testMaterial);

            // When
            EducationalMaterialDto result = materialService.updateMaterial(TEST_MATERIAL_ID, dto);

            // Then
            assertThat(testMaterial.getAssignedToStages()).isEqualTo(stageIds);
        }

        @Test
        @DisplayName("shouldThrowResourceNotFoundException_WhenMaterialNotFoundForUpdate")
        void shouldThrowResourceNotFoundException_WhenMaterialNotFoundForUpdate() {
            // Given
            EducationalMaterialDto dto = createMaterialDto();
            given(materialRepository.findById(TEST_MATERIAL_ID)).willReturn(Optional.empty());

            // When & Then
            assertThatThrownBy(() -> materialService.updateMaterial(TEST_MATERIAL_ID, dto))
                .isInstanceOf(ResourceNotFoundException.class)
                .hasMessageContaining("Material not found");
        }
    }

    @Nested
    @DisplayName("Delete Material Tests")
    class DeleteMaterialTests {

        @Test
        @DisplayName("shouldDeleteMaterial_WhenMaterialExists")
        void shouldDeleteMaterial_WhenMaterialExists() {
            // Given
            given(materialRepository.findById(TEST_MATERIAL_ID)).willReturn(Optional.of(testMaterial));
            given(progressRepository.findByMaterialId(TEST_MATERIAL_ID)).willReturn(List.of(testProgress));
            willDoNothing().given(materialRepository).delete(testMaterial);

            // When
            materialService.deleteMaterial(TEST_MATERIAL_ID);

            // Then
            then(materialRepository).should().delete(testMaterial);
            then(progressRepository).should().deleteAll(List.of(testProgress));
        }

        @Test
        @DisplayName("shouldThrowResourceNotFoundException_WhenMaterialNotFoundForDelete")
        void shouldThrowResourceNotFoundException_WhenMaterialNotFoundForDelete() {
            // Given
            given(materialRepository.findById(TEST_MATERIAL_ID)).willReturn(Optional.empty());

            // When & Then
            assertThatThrownBy(() -> materialService.deleteMaterial(TEST_MATERIAL_ID))
                .isInstanceOf(ResourceNotFoundException.class)
                .hasMessageContaining("Material not found");
        }
    }

    @Nested
    @DisplayName("Publish Material Tests")
    class PublishMaterialTests {

        @Test
        @DisplayName("shouldPublishMaterial_WhenMaterialExists")
        void shouldPublishMaterial_WhenMaterialExists() {
            // Given
            given(materialRepository.findById(TEST_MATERIAL_ID)).willReturn(Optional.of(testMaterial));
            given(materialRepository.save(any(EducationalMaterial.class))).willReturn(testMaterial);

            // When
            EducationalMaterialDto result = materialService.publishMaterial(TEST_MATERIAL_ID);

            // Then
            assertThat(result).isNotNull();
            assertThat(testMaterial.getPublished()).isTrue();
            assertThat(testMaterial.getPublishedAt()).isNotNull();
        }

        @Test
        @DisplayName("shouldThrowResourceNotFoundException_WhenMaterialNotFoundForPublish")
        void shouldThrowResourceNotFoundException_WhenMaterialNotFoundForPublish() {
            // Given
            given(materialRepository.findById(TEST_MATERIAL_ID)).willReturn(Optional.empty());

            // When & Then
            assertThatThrownBy(() -> materialService.publishMaterial(TEST_MATERIAL_ID))
                .isInstanceOf(ResourceNotFoundException.class)
                .hasMessageContaining("Material not found");
        }
    }

    @Nested
    @DisplayName("Unpublish Material Tests")
    class UnpublishMaterialTests {

        @Test
        @DisplayName("shouldUnpublishMaterial_WhenMaterialExists")
        void shouldUnpublishMaterial_WhenMaterialExists() {
            // Given
            testMaterial.publish();
            given(materialRepository.findById(TEST_MATERIAL_ID)).willReturn(Optional.of(testMaterial));
            given(materialRepository.save(any(EducationalMaterial.class))).willReturn(testMaterial);

            // When
            EducationalMaterialDto result = materialService.unpublishMaterial(TEST_MATERIAL_ID);

            // Then
            assertThat(result).isNotNull();
            assertThat(testMaterial.getPublished()).isFalse();
            assertThat(testMaterial.getPublishedAt()).isNull();
        }

        @Test
        @DisplayName("shouldThrowResourceNotFoundException_WhenMaterialNotFoundForUnpublish")
        void shouldThrowResourceNotFoundException_WhenMaterialNotFoundForUnpublish() {
            // Given
            given(materialRepository.findById(TEST_MATERIAL_ID)).willReturn(Optional.empty());

            // When & Then
            assertThatThrownBy(() -> materialService.unpublishMaterial(TEST_MATERIAL_ID))
                .isInstanceOf(ResourceNotFoundException.class)
                .hasMessageContaining("Material not found");
        }
    }

    @Nested
    @DisplayName("Record View Tests")
    class RecordViewTests {

        @Test
        @DisplayName("shouldRecordView_WhenMaterialExists")
        void shouldRecordView_WhenMaterialExists() {
            // Given
            int initialViewCount = testMaterial.getViewCount();
            given(materialRepository.findById(TEST_MATERIAL_ID)).willReturn(Optional.of(testMaterial));
            given(materialRepository.save(any(EducationalMaterial.class))).willReturn(testMaterial);
            given(progressRepository.save(any(MaterialProgress.class))).willReturn(testProgress);

            // When
            EducationalMaterialDto result = materialService.recordView(TEST_MATERIAL_ID, TEST_PATIENT_ID);

            // Then
            assertThat(result).isNotNull();
            assertThat(testMaterial.getViewCount()).isEqualTo(initialViewCount + 1);
        }

        @Test
        @DisplayName("shouldThrowResourceNotFoundException_WhenMaterialNotFoundForView")
        void shouldThrowResourceNotFoundException_WhenMaterialNotFoundForView() {
            // Given
            given(materialRepository.findById(TEST_MATERIAL_ID)).willReturn(Optional.empty());

            // When & Then
            assertThatThrownBy(() -> materialService.recordView(TEST_MATERIAL_ID, TEST_PATIENT_ID))
                .isInstanceOf(ResourceNotFoundException.class)
                .hasMessageContaining("Material not found");
        }
    }

    @Nested
    @DisplayName("Mark As Complete Tests")
    class MarkAsCompleteTests {

        @Test
        @DisplayName("shouldMarkAsComplete_WithQuizScore")
        void shouldMarkAsComplete_WithQuizScore() {
            // Given
            int initialCompletionCount = testMaterial.getCompletionCount();
            given(materialRepository.findById(TEST_MATERIAL_ID)).willReturn(Optional.of(testMaterial));
            given(materialRepository.save(any(EducationalMaterial.class))).willReturn(testMaterial);
            given(progressRepository.save(any(MaterialProgress.class))).willReturn(testProgress);

            // When
            EducationalMaterialDto result = materialService.markAsComplete(TEST_MATERIAL_ID, TEST_PATIENT_ID, 85);

            // Then
            assertThat(result).isNotNull();
            assertThat(testMaterial.getCompletionCount()).isEqualTo(initialCompletionCount + 1);
            assertThat(testProgress.getQuizScore()).isEqualTo(85);
        }

        @Test
        @DisplayName("shouldMarkAsComplete_WithoutQuizScore")
        void shouldMarkAsComplete_WithoutQuizScore() {
            // Given
            given(materialRepository.findById(TEST_MATERIAL_ID)).willReturn(Optional.of(testMaterial));
            given(materialRepository.save(any(EducationalMaterial.class))).willReturn(testMaterial);
            given(progressRepository.save(any(MaterialProgress.class))).willReturn(testProgress);

            // When
            EducationalMaterialDto result = materialService.markAsComplete(TEST_MATERIAL_ID, TEST_PATIENT_ID, null);

            // Then
            assertThat(result).isNotNull();
            assertThat(testProgress.getQuizScore()).isNull();
        }

        @Test
        @DisplayName("shouldThrowResourceNotFoundException_WhenMaterialNotFoundForComplete")
        void shouldThrowResourceNotFoundException_WhenMaterialNotFoundForComplete() {
            // Given
            given(materialRepository.findById(TEST_MATERIAL_ID)).willReturn(Optional.empty());

            // When & Then
            assertThatThrownBy(() -> materialService.markAsComplete(TEST_MATERIAL_ID, TEST_PATIENT_ID, 85))
                .isInstanceOf(ResourceNotFoundException.class)
                .hasMessageContaining("Material not found");
        }
    }

    @Nested
    @DisplayName("Get Patient Materials Tests")
    class GetPatientMaterialsTests {

        @Test
        @DisplayName("shouldGetPatientMaterials_WhenPatientExists")
        void shouldGetPatientMaterials_WhenPatientExists() {
            // Given
            Patient patient = createTestPatient();
            given(patientRepository.findById(TEST_PATIENT_ID)).willReturn(Optional.of(patient));
            given(patientRepository.findAllWithFilters(any(), any(), any(), any(), any(), any(), any()))
                .willReturn(List.of());
            given(materialRepository.findAllWithFilters(any(), any(), any(), any(), eq(true), any()))
                .willReturn(List.of(testMaterial));

            // When
            List<EducationalMaterialDto> result = materialService.getPatientMaterials(TEST_PATIENT_ID);

            // Then
            assertThat(result).hasSize(1);
        }

        @Test
        @DisplayName("shouldThrowResourceNotFoundException_WhenPatientNotFound")
        void shouldThrowResourceNotFoundException_WhenPatientNotFound() {
            // Given
            given(patientRepository.findById(TEST_PATIENT_ID)).willReturn(Optional.empty());

            // When & Then
            assertThatThrownBy(() -> materialService.getPatientMaterials(TEST_PATIENT_ID))
                .isInstanceOf(ResourceNotFoundException.class)
                .hasMessageContaining("Patient not found");
        }
    }

    @Nested
    @DisplayName("Get Patient Progress Tests")
    class GetPatientProgressTests {

        @Test
        @DisplayName("shouldGetPatientProgress_WhenProgressExists")
        void shouldGetPatientProgress_WhenProgressExists() {
            // Given
            given(progressRepository.findByPatientId(TEST_PATIENT_ID)).willReturn(List.of(testProgress));

            // When
            List<MaterialProgressDto> result = materialService.getPatientProgress(TEST_PATIENT_ID);

            // Then
            assertThat(result).hasSize(1);
        }

        @Test
        @DisplayName("shouldReturnEmptyList_WhenNoProgressFound")
        void shouldReturnEmptyList_WhenNoProgressFound() {
            // Given
            given(progressRepository.findByPatientId(TEST_PATIENT_ID)).willReturn(Collections.emptyList());

            // When
            List<MaterialProgressDto> result = materialService.getPatientProgress(TEST_PATIENT_ID);

            // Then
            assertThat(result).isEmpty();
        }
    }

    @Nested
    @DisplayName("Get Progress Tests")
    class GetProgressTests {

        @Test
        @DisplayName("shouldGetProgress_WhenProgressExists")
        void shouldGetProgress_WhenProgressExists() {
            // Given
            given(progressRepository.findByMaterialIdAndPatientId(TEST_MATERIAL_ID, TEST_PATIENT_ID))
                .willReturn(Optional.of(testProgress));

            // When
            MaterialProgressDto result = materialService.getProgress(TEST_MATERIAL_ID, TEST_PATIENT_ID);

            // Then
            assertThat(result).isNotNull();
        }

        @Test
        @DisplayName("shouldReturnNull_WhenProgressNotFound")
        void shouldReturnNull_WhenProgressNotFound() {
            // Given
            given(progressRepository.findByMaterialIdAndPatientId(TEST_MATERIAL_ID, TEST_PATIENT_ID))
                .willReturn(Optional.empty());

            // When
            MaterialProgressDto result = materialService.getProgress(TEST_MATERIAL_ID, TEST_PATIENT_ID);

            // Then
            assertThat(result).isNull();
        }
    }

    @Nested
    @DisplayName("EducationalMaterial Entity Tests")
    class EducationalMaterialEntityTests {

        @Test
        @DisplayName("shouldPublish")
        void shouldPublish() {
            // Given
            EducationalMaterial material = createTestMaterial();

            // When
            material.publish();

            // Then
            assertThat(material.getPublished()).isTrue();
            assertThat(material.getPublishedAt()).isNotNull();
        }

        @Test
        @DisplayName("shouldUnpublish")
        void shouldUnpublish() {
            // Given
            EducationalMaterial material = createTestMaterial();
            material.publish();

            // When
            material.unpublish();

            // Then
            assertThat(material.getPublished()).isFalse();
            assertThat(material.getPublishedAt()).isNull();
        }

        @Test
        @DisplayName("shouldIncrementViewCount")
        void shouldIncrementViewCount() {
            // Given
            EducationalMaterial material = createTestMaterial();
            int initialCount = material.getViewCount();

            // When
            material.incrementViewCount();

            // Then
            assertThat(material.getViewCount()).isEqualTo(initialCount + 1);
        }

        @Test
        @DisplayName("shouldIncrementCompletionCount")
        void shouldIncrementCompletionCount() {
            // Given
            EducationalMaterial material = createTestMaterial();
            int initialCount = material.getCompletionCount();

            // When
            material.incrementCompletionCount();

            // Then
            assertThat(material.getCompletionCount()).isEqualTo(initialCount + 1);
        }

        @Test
        @DisplayName("shouldCheckIsAssignedToAllPatients_WhenListIsEmpty")
        void shouldCheckIsAssignedToAllPatients_WhenListIsEmpty() {
            // Given
            EducationalMaterial material = createTestMaterial();
            material.setAssignedToPatients(new ArrayList<>());

            // When
            boolean result = material.isAssignedToAllPatients();

            // Then
            assertThat(result).isTrue();
        }

        @Test
        @DisplayName("shouldCheckIsAssignedToAllPatients_WhenListIsNull")
        void shouldCheckIsAssignedToAllPatients_WhenListIsNull() {
            // Given
            EducationalMaterial material = createTestMaterial();

            // When
            boolean result = material.isAssignedToAllPatients();

            // Then
            assertThat(result).isTrue();
        }

        @Test
        @DisplayName("shouldCheckIsAssignedToPatient_WhenAssignedToAll")
        void shouldCheckIsAssignedToPatient_WhenAssignedToAll() {
            // Given
            EducationalMaterial material = createTestMaterial();

            // When
            boolean result = material.isAssignedToPatient(TEST_PATIENT_ID);

            // Then
            assertThat(result).isTrue();
        }

        @Test
        @DisplayName("shouldCheckIsAssignedToPatient_WhenInList")
        void shouldCheckIsAssignedToPatient_WhenInList() {
            // Given
            EducationalMaterial material = createTestMaterial();
            material.setAssignedToPatients(List.of(TEST_PATIENT_ID));

            // When
            boolean result = material.isAssignedToPatient(TEST_PATIENT_ID);

            // Then
            assertThat(result).isTrue();
        }

        @Test
        @DisplayName("shouldCheckIsAssignedToStage_WhenAssignedToAll")
        void shouldCheckIsAssignedToStage_WhenAssignedToAll() {
            // Given
            EducationalMaterial material = createTestMaterial();

            // When
            boolean result = material.isAssignedToStage(UUID.randomUUID());

            // Then
            assertThat(result).isTrue();
        }

        @Test
        @DisplayName("shouldCheckIsAssignedToStage_WhenInList")
        void shouldCheckIsAssignedToStage_WhenInList() {
            // Given
            EducationalMaterial material = createTestMaterial();
            UUID stageId = UUID.randomUUID();
            material.setAssignedToStages(List.of(stageId));

            // When
            boolean result = material.isAssignedToStage(stageId);

            // Then
            assertThat(result).isTrue();
        }
    }

    @Nested
    @DisplayName("MaterialProgress Entity Tests")
    class MaterialProgressEntityTests {

        @Test
        @DisplayName("shouldStart_WhenPending")
        void shouldStart_WhenPending() {
            // Given
            MaterialProgress progress = createTestProgress();

            // When
            progress.start();

            // Then
            assertThat(progress.getStatus()).isEqualTo(MaterialProgress.MaterialStatus.IN_PROGRESS);
            assertThat(progress.getStartedAt()).isNotNull();
        }

        @Test
        @DisplayName("shouldNotStart_WhenAlreadyInProgress")
        void shouldNotStart_WhenAlreadyInProgress() {
            // Given
            MaterialProgress progress = createTestProgress();
            progress.start();
            Instant firstStartedAt = progress.getStartedAt();

            // When
            progress.start();

            // Then
            assertThat(progress.getStartedAt()).isEqualTo(firstStartedAt);
        }

        @Test
        @DisplayName("shouldComplete_WithQuizScore")
        void shouldComplete_WithQuizScore() {
            // Given
            MaterialProgress progress = createTestProgress();

            // When
            progress.complete(90);

            // Then
            assertThat(progress.getStatus()).isEqualTo(MaterialProgress.MaterialStatus.COMPLETED);
            assertThat(progress.getCompletedAt()).isNotNull();
            assertThat(progress.getQuizScore()).isEqualTo(90);
        }

        @Test
        @DisplayName("shouldComplete_WithoutQuizScore")
        void shouldComplete_WithoutQuizScore() {
            // Given
            MaterialProgress progress = createTestProgress();

            // When
            progress.complete(null);

            // Then
            assertThat(progress.getStatus()).isEqualTo(MaterialProgress.MaterialStatus.COMPLETED);
            assertThat(progress.getQuizScore()).isNull();
        }

        @Test
        @DisplayName("shouldAddTimeSpent")
        void shouldAddTimeSpent() {
            // Given
            MaterialProgress progress = createTestProgress();
            int initialTime = progress.getTimeSpentSeconds();

            // When
            progress.addTimeSpent(60);

            // Then
            assertThat(progress.getTimeSpentSeconds()).isEqualTo(initialTime + 60);
        }

        @Test
        @DisplayName("shouldCheckIsCompleted_WhenCompleted")
        void shouldCheckIsCompleted_WhenCompleted() {
            // Given
            MaterialProgress progress = createTestProgress();
            progress.complete(null);

            // When
            boolean result = progress.isCompleted();

            // Then
            assertThat(result).isTrue();
        }

        @Test
        @DisplayName("shouldCheckIsInProgress_WhenInProgress")
        void shouldCheckIsInProgress_WhenInProgress() {
            // Given
            MaterialProgress progress = createTestProgress();
            progress.start();

            // When
            boolean result = progress.isInProgress();

            // Then
            assertThat(result).isTrue();
        }
    }

    private EducationalMaterialDto createMaterialDto() {
        return createMaterialDtoBuilder().build();
    }

    private EducationalMaterialDto.Builder createMaterialDtoBuilder() {
        return EducationalMaterialDto.builder()
            .projectId(TEST_PROJECT_ID)
            .title("Test Material")
            .content("Test Content")
            .type(EducationalMaterial.MaterialType.ARTICLE)
            .category("General")
            .difficulty(EducationalMaterial.DifficultyLevel.BASIC)
            .createdBy(TEST_USER_ID);
    }

    private Patient createTestPatient() {
        User user = User.create("test@example.com", "passwordHash", UserRole.PATIENT);
        user.setId(UUID.randomUUID());
        Patient patient = Patient.create(user, "90010112345", "Test", "Patient");
        patient.setId(TEST_PATIENT_ID);
        return patient;
    }
}
