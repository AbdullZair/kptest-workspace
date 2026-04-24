package com.kptest;

import org.junit.jupiter.api.AfterAll;
import org.junit.jupiter.api.BeforeAll;
import org.junit.jupiter.api.extension.ExtendWith;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.context.DynamicPropertyRegistry;
import org.springframework.test.context.DynamicPropertySource;
import org.springframework.test.context.junit.jupiter.SpringExtension;
import org.testcontainers.containers.GenericContainer;
import org.testcontainers.containers.PostgreSQLContainer;
import org.testcontainers.junit.jupiter.Container;
import org.testcontainers.junit.jupiter.Testcontainers;
import org.testcontainers.utility.DockerImageName;

/**
 * Base integration test class with TestContainers support.
 * Provides PostgreSQL and Redis containers for isolated integration tests.
 */
@SpringBootTest
@ActiveProfiles("test")
@Testcontainers
@ExtendWith(SpringExtension.class)
public abstract class AbstractIntegrationTest {

    private static final DockerImageName POSTGRES_IMAGE = DockerImageName.parse("postgres:15-alpine");
    private static final DockerImageName REDIS_IMAGE = DockerImageName.parse("redis:7-alpine");

    @Container
    static PostgreSQLContainer<?> postgres = new PostgreSQLContainer<>(POSTGRES_IMAGE)
        .withDatabaseName("kptest_test")
        .withUsername("kptest")
        .withPassword("kptest");

    @Container
    static GenericContainer<?> redis = new GenericContainer<>(REDIS_IMAGE)
        .withExposedPorts(6379);

    static {
        // Start containers before any test runs
        postgres.start();
        redis.start();
    }

    @DynamicPropertySource
    static void configureTestProperties(DynamicPropertyRegistry registry) {
        registry.add("spring.datasource.url", postgres::getJdbcUrl);
        registry.add("spring.datasource.username", postgres::getUsername);
        registry.add("spring.datasource.password", postgres::getPassword);
        registry.add("spring.datasource.driver-class-name", () -> "org.postgresql.Driver");
        registry.add("spring.data.redis.host", redis::getHost);
        registry.add("spring.data.redis.port", () -> redis.getMappedPort(6379).toString());
        registry.add("spring.flyway.enabled", () -> "true");
        registry.add("spring.flyway.locations", () -> "classpath:db/migration");
    }

    @BeforeAll
    static void beforeAll() {
        System.out.println("Starting TestContainers...");
        System.out.println("PostgreSQL URL: " + postgres.getJdbcUrl());
        System.out.println("Redis Host: " + redis.getHost() + ":" + redis.getMappedPort(6379));
    }

    @AfterAll
    static void afterAll() {
        System.out.println("Stopping TestContainers...");
    }
}
