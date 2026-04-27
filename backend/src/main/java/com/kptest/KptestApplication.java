package com.kptest;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.boot.context.properties.ConfigurationPropertiesScan;
import org.springframework.context.annotation.ComponentScan;
import org.springframework.scheduling.annotation.EnableScheduling;

/**
 * KPTEST Backend Application
 *
 * Telemedicine system for post-cochlear implantation therapy management.
 */
@SpringBootApplication
@ComponentScan(basePackages = {
    "com.kptest",
    "com.kptest.api",
    "com.kptest.application",
    "com.kptest.domain",
    "com.kptest.infrastructure"
})
@ConfigurationPropertiesScan
@EnableScheduling
public class KptestApplication {

    public static void main(String[] args) {
        SpringApplication.run(KptestApplication.class, args);
    }
}
