package com.kptest.domain.project;

import com.kptest.domain.patient.Patient;
import com.kptest.domain.staff.Staff;
import jakarta.persistence.*;
import lombok.*;
import org.springframework.data.annotation.CreatedDate;
import org.springframework.data.annotation.LastModifiedDate;
import org.springframework.data.jpa.domain.support.AuditingEntityListener;

import java.time.Instant;
import java.util.UUID;

/**
 * Therapy stage within a project.
 */
public enum TherapyStage {
    NOT_STARTED,
    IN_PROGRESS,
    COMPLETED,
    REMOVED
}
