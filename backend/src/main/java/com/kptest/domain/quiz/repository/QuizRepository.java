package com.kptest.domain.quiz.repository;

import com.kptest.domain.quiz.Quiz;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.UUID;

/**
 * Repository interface for Quiz entity.
 */
@Repository
public interface QuizRepository extends JpaRepository<Quiz, UUID> {

    /**
     * Find all quizzes for a project.
     */
    List<Quiz> findByProjectId(UUID projectId);

    /**
     * Find all active quizzes for a project.
     */
    List<Quiz> findByProjectIdAndActive(UUID projectId, Boolean active);

    /**
     * Find quizzes by title containing text.
     */
    Page<Quiz> findByProjectIdAndTitleContaining(
        UUID projectId,
        String title,
        Pageable pageable
    );

    /**
     * Check if quiz exists by ID and project ID.
     */
    boolean existsByIdAndProjectId(UUID id, UUID projectId);

    /**
     * Count quizzes by project.
     */
    long countByProjectId(UUID projectId);

    /**
     * Find all quizzes by created by user.
     */
    List<Quiz> findByCreatedBy(UUID createdBy);
}
