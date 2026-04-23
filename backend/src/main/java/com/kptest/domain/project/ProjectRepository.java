package com.kptest.domain.project;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

/**
 * Repository for Project entity.
 */
@Repository
public interface ProjectRepository extends JpaRepository<Project, UUID> {

    /**
     * Find all projects by status.
     */
    @Query("SELECT p FROM Project p WHERE p.status = :status ORDER BY p.createdAt DESC")
    List<Project> findByStatus(@Param("status") ProjectStatus status);

    /**
     * Find active projects (ACTIVE status).
     */
    @Query("SELECT p FROM Project p WHERE p.status = com.kptest.domain.project.ProjectStatus.ACTIVE ORDER BY p.name ASC")
    List<Project> findActiveProjects();

    /**
     * Find projects by name containing text.
     */
    @Query("SELECT p FROM Project p WHERE LOWER(p.name) LIKE LOWER(CONCAT('%', :name, '%')) ORDER BY p.name ASC")
    List<Project> findByNameContaining(@Param("name") String name);

    /**
     * Count projects by status.
     */
    @Query("SELECT COUNT(p) FROM Project p WHERE p.status = :status")
    long countByStatus(@Param("status") ProjectStatus status);

    /**
     * Count active projects.
     */
    @Query("SELECT COUNT(p) FROM Project p WHERE p.status = com.kptest.domain.project.ProjectStatus.ACTIVE")
    long countActive();
}
