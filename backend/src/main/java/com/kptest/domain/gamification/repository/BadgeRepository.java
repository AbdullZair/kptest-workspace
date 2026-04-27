package com.kptest.domain.gamification.repository;

import com.kptest.domain.gamification.Badge;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.UUID;

/**
 * Repository interface for Badge entity.
 */
@Repository
public interface BadgeRepository extends JpaRepository<Badge, UUID> {

    /**
     * Find all active badges.
     */
    List<Badge> findByActiveOrderByCreatedAtDesc(Boolean active);

    /**
     * Find all active and visible badges.
     */
    List<Badge> findByActiveAndHiddenOrderByCategory(Boolean active, Boolean hidden);

    /**
     * Find badges by category.
     */
    List<Badge> findByActiveAndCategoryOrderByCreatedAtDesc(Boolean active, Badge.BadgeCategory category);

    /**
     * Count badges by category.
     */
    long countByActiveAndCategory(Boolean active, Badge.BadgeCategory category);

    /**
     * Find all badges created by a user.
     */
    List<Badge> findByCreatedBy(UUID createdBy);
}
