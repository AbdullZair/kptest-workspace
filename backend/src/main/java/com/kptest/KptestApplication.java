package com.kptest;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.boot.context.properties.ConfigurationPropertiesScan;
import org.springframework.data.jpa.repository.config.EnableJpaAuditing;
import org.springframework.scheduling.annotation.EnableScheduling;

/**
 * KPTEST Backend Application
 * 
 * Telemedicine system for post-cochlear implantation therapy management.
 */
@SpringBootApplication
@ConfigurationPropertiesScan
@EnableJpaAuditing
@EnableScheduling
public class KptestApplication {

    public static void main(String[] args) {
        SpringApplication.run(KptestApplication.class, args);
    }
}
