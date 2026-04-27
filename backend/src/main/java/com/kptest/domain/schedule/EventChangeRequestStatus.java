package com.kptest.domain.schedule;

import jakarta.persistence.*;
import lombok.*;
import org.springframework.data.annotation.CreatedDate;
import org.springframework.data.annotation.LastModifiedDate;
import org.springframework.data.jpa.domain.support.AuditingEntityListener;

import java.time.Instant;
import java.util.UUID;

/**
 * Event change request status enum.
 */
public enum EventChangeRequestStatus {
    /**
     * Request is pending review.
     */
    PENDING,

    /**
     * Request has been accepted.
     */
    ACCEPTED,

    /**
     * Request has been rejected.
     */
    REJECTED,

    /**
     * Request has been cancelled by the requester.
     */
    CANCELLED
}
