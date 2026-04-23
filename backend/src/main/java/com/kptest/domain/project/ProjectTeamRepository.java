package com.kptest.domain.project;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.UUID;

/**
 * Repository for ProjectTeam entity.
 */
@Repository
public interface ProjectTeamRepository extends JpaRepository<ProjectTeam, UUID> {

    /**
     * Find all team members for a project.
     */
    @Query("SELECT pt FROM ProjectTeam pt WHERE pt.project.id = :projectId ORDER BY pt.role ASC, pt.createdAt ASC")
    List<ProjectTeam> findByProjectId(@Param("projectId") UUID projectId);

    /**
     * Find team members by user ID.
     */
    @Query("SELECT pt FROM ProjectTeam pt WHERE pt.user.id = :userId ORDER BY pt.project.name ASC")
    List<ProjectTeam> findByUserId(@Param("userId") UUID userId);

    /**
     * Find active projects for a user.
     */
    @Query("""
        SELECT pt FROM ProjectTeam pt 
        JOIN pt.project p 
        WHERE pt.user.id = :userId 
        AND p.status = com.kptest.domain.project.ProjectStatus.ACTIVE 
        ORDER BY p.name ASC
    """)
    List<ProjectTeam> findActiveProjectsByUserId(@Param("userId") UUID userId);

    /**
     * Check if user is in project team.
     */
    @Query("SELECT COUNT(pt) > 0 FROM ProjectTeam pt WHERE pt.project.id = :projectId AND pt.user.id = :userId")
    boolean existsByProjectIdAndUserId(@Param("projectId") UUID projectId, 
                                       @Param("userId") UUID userId);

    /**
     * Delete team members by project ID.
     */
    void deleteByProjectId(@Param("projectId") UUID projectId);

    /**
     * Count team members for a project.
     */
    @Query("SELECT COUNT(pt) FROM ProjectTeam pt WHERE pt.project.id = :projectId")
    long countByProjectId(@Param("projectId") UUID projectId);
}
