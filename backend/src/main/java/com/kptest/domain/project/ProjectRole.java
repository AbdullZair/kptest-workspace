package com.kptest.domain.project;

import jakarta.persistence.*;
import lombok.*;
import org.springframework.data.annotation.CreatedDate;
import org.springframework.data.annotation.LastModifiedDate;
import org.springframework.data.jpa.domain.support.AuditingEntityListener;

import java.time.Instant;
import java.util.UUID;

/**
 * Role of staff member in a project.
 */
public enum ProjectRole {
    COORDINATOR,
    DOCTOR,
    THERAPIST,
    NURSE,
    CONSULTANT
}
