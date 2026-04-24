package com.kptest.infrastructure.config;

import org.springframework.context.annotation.Configuration;
import org.springframework.data.jpa.repository.config.EnableJpaAuditing;

/**
 * JPA configuration for entity auditing.
 * Separated from main application to allow exclusion in tests.
 */
@Configuration
@EnableJpaAuditing
public class JpaConfig {
    // JPA auditing configuration
}
