package com.kptest.support;

import org.springframework.boot.SpringBootConfiguration;
import org.springframework.boot.autoconfigure.EnableAutoConfiguration;
import org.springframework.context.annotation.ComponentScan;
import org.springframework.context.annotation.FilterType;

/**
 * Minimal SpringBootConfiguration for @WebMvcTest controller slices.
 *
 * Replaces KptestApplication as the test context root when paired with
 * @ContextConfiguration(classes = WebMvcTestConfig.class). Avoids the broad
 * @ComponentScan in KptestApplication that drags AdminService and 20 JPA
 * repositories into every controller test.
 *
 * Scans only com.kptest.api.controller and com.kptest.exception so the
 * controller-under-test and the global exception handler are wired up,
 * while service / repository beans come from WebMvcMockBeansConfig.
 */
@SpringBootConfiguration
@EnableAutoConfiguration(exclude = {
    org.springframework.boot.autoconfigure.security.servlet.SecurityAutoConfiguration.class,
    org.springframework.boot.autoconfigure.security.servlet.SecurityFilterAutoConfiguration.class,
    org.springframework.boot.autoconfigure.data.jpa.JpaRepositoriesAutoConfiguration.class,
    org.springframework.boot.autoconfigure.orm.jpa.HibernateJpaAutoConfiguration.class,
    org.springframework.boot.autoconfigure.flyway.FlywayAutoConfiguration.class,
    org.springframework.boot.autoconfigure.data.redis.RedisAutoConfiguration.class,
    org.springframework.boot.autoconfigure.data.redis.RedisRepositoriesAutoConfiguration.class,
    org.springframework.boot.autoconfigure.mail.MailSenderAutoConfiguration.class
})
@ComponentScan(
    basePackages = {
        "com.kptest.api.controller",
        "com.kptest.exception"
    },
    excludeFilters = @ComponentScan.Filter(
        type = FilterType.ASSIGNABLE_TYPE,
        classes = {
            com.kptest.infrastructure.config.JpaConfig.class,
            com.kptest.infrastructure.config.SecurityConfig.class,
            com.kptest.infrastructure.config.RedisConfig.class
        }
    )
)
public class WebMvcTestConfig {
}
