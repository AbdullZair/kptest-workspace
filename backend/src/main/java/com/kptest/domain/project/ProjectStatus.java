package com.kptest.domain.project;

import jakarta.persistence.*;
import lombok.*;
import org.springframework.data.annotation.CreatedDate;
import org.springframework.data.annotation.LastModifiedDate;
import org.springframework.data.jpa.domain.support.AuditingEntityListener;

import java.time.Instant;
import java.util.UUID;

/**
 * Project status.
 */
public enum ProjectStatus {
    PLANNED,
    ACTIVE,
    COMPLETED,
    ARCHIVED,
    CANCELLED
}
