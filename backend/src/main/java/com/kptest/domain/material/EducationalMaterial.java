package com.kptest.domain.material;

import jakarta.persistence.*;
import lombok.*;
import org.springframework.data.annotation.CreatedDate;
import org.springframework.data.annotation.LastModifiedDate;
import org.springframework.data.jpa.domain.support.AuditingEntityListener;

import java.time.Instant;
import java.util.ArrayList;
import java.util.Arrays;
import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

/**
 * Educational material entity representing learning resources for patients.
 */
@Entity
@Table(name = "educational_materials")
@EntityListeners(AuditingEntityListener.class)
@Getter
@Setter
@NoArgsConstructor(access = AccessLevel.PROTECTED)
@EqualsAndHashCode(of = "id")
public class EducationalMaterial {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @Column(name = "project_id", nullable = false)
    private UUID projectId;

    @Column(nullable = false, length = 255)
    private String title;

    @Column(nullable = false, columnDefinition = "TEXT")
    private String content;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private MaterialType type;

    @Column(name = "file_url", length = 500)
    private String fileUrl;

    @Column(name = "external_url", length = 500)
    private String externalUrl;

    @Column(length = 100)
    private String category;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private DifficultyLevel difficulty;

    @Column(name = "assigned_to_patients", columnDefinition = "text")
    private String assignedToPatientsJson;

    @Column(name = "assigned_to_stages", columnDefinition = "text")
    private String assignedToStagesJson;
    
    @Transient
    private List<UUID> assignedToPatients;
    
    @Transient
    private List<UUID> assignedToStages;

    @Column(name = "view_count", nullable = false)
    private Integer viewCount;

    @Column(name = "completion_count", nullable = false)
    private Integer completionCount;

    @Column(nullable = false)
    private Boolean published;

    @Column(name = "created_by", nullable = false)
    private UUID createdBy;

    @Column(name = "published_at")
    private Instant publishedAt;

    @CreatedDate
    @Column(name = "created_at", nullable = false, updatable = false)
    private Instant createdAt;

    @LastModifiedDate
    @Column(name = "updated_at", nullable = false)
    private Instant updatedAt;

    /**
     * Material type enum.
     */
    public enum MaterialType {
        ARTICLE,
        PDF,
        IMAGE,
        VIDEO,
        LINK,
        AUDIO
    }

    /**
     * Difficulty level enum.
     */
    public enum DifficultyLevel {
        BASIC,
        INTERMEDIATE,
        ADVANCED
    }

    /**
     * Factory method for creating an educational material.
     */
    public static EducationalMaterial create(
        UUID projectId,
        String title,
        String content,
        MaterialType type,
        String category,
        DifficultyLevel difficulty,
        UUID createdBy
    ) {
        EducationalMaterial material = new EducationalMaterial();
        material.projectId = projectId;
        material.title = title;
        material.content = content;
        material.type = type;
        material.category = category;
        material.difficulty = difficulty;
        material.createdBy = createdBy;
        material.viewCount = 0;
        material.completionCount = 0;
        material.published = false;
        return material;
    }

    /**
     * Set file URL for file-based materials.
     */
    public void setFileUrl(String fileUrl) {
        this.fileUrl = fileUrl;
    }

    /**
     * Set external URL for link materials.
     */
    public void setExternalUrl(String externalUrl) {
        this.externalUrl = externalUrl;
    }

    /**
     * Get patient assignments. Returns the transient list directly (mutable
     * by callers); see {@link #syncAssignmentsToJson} for save-time sync.
     */
    public List<UUID> getAssignedToPatients() {
        return this.assignedToPatients;
    }

    /**
     * Set patient assignments. {@code null} clears both the transient list
     * and the persisted CSV column.
     */
    public void setAssignedToPatients(List<UUID> patientIds) {
        this.assignedToPatients = patientIds;
        this.assignedToPatientsJson = serializeUuids(patientIds);
    }

    /**
     * Get stage assignments. See {@link #getAssignedToPatients}.
     */
    public List<UUID> getAssignedToStages() {
        return this.assignedToStages;
    }

    /**
     * Set stage assignments. {@code null} clears both the transient list
     * and the persisted CSV column.
     */
    public void setAssignedToStages(List<UUID> stageIds) {
        this.assignedToStages = stageIds;
        this.assignedToStagesJson = serializeUuids(stageIds);
    }

    @PostLoad
    private void hydrateAssignmentsFromJson() {
        this.assignedToPatients = parseUuids(this.assignedToPatientsJson);
        this.assignedToStages = parseUuids(this.assignedToStagesJson);
    }

    @PrePersist
    @PreUpdate
    private void syncAssignmentsToJson() {
        this.assignedToPatientsJson = serializeUuids(this.assignedToPatients);
        this.assignedToStagesJson = serializeUuids(this.assignedToStages);
    }

    private static List<UUID> parseUuids(String csv) {
        if (csv == null) return null;
        if (csv.isEmpty()) return new ArrayList<>();
        return Arrays.stream(csv.split(","))
            .map(UUID::fromString)
            .collect(Collectors.toCollection(ArrayList::new));
    }

    private static String serializeUuids(List<UUID> ids) {
        if (ids == null) return null;
        if (ids.isEmpty()) return "";
        return ids.stream().map(UUID::toString).collect(Collectors.joining(","));
    }

    /**
     * Publish the material.
     */
    public void publish() {
        this.published = true;
        this.publishedAt = Instant.now();
    }

    /**
     * Unpublish the material.
     */
    public void unpublish() {
        this.published = false;
        this.publishedAt = null;
    }

    /**
     * Increment view count.
     */
    public void incrementViewCount() {
        this.viewCount = this.viewCount + 1;
    }

    /**
     * Increment completion count.
     */
    public void incrementCompletionCount() {
        this.completionCount = this.completionCount + 1;
    }

    /**
     * Check if material is assigned to all patients.
     */
    public boolean isAssignedToAllPatients() {
        return this.assignedToPatients == null || this.assignedToPatients.isEmpty();
    }

    /**
     * Check if material is assigned to specific patient.
     */
    public boolean isAssignedToPatient(UUID patientId) {
        if (isAssignedToAllPatients()) {
            return true;
        }
        return this.assignedToPatients.contains(patientId);
    }

    /**
     * Check if material is assigned to specific stage.
     */
    public boolean isAssignedToStage(UUID stageId) {
        if (this.assignedToStages == null || this.assignedToStages.isEmpty()) {
            return true;
        }
        return this.assignedToStages.contains(stageId);
    }
}
