package com.kptest.domain.schedule;

/**
 * Status of a therapy event.
 */
public enum EventStatus {
    /**
     * Event is scheduled but not yet completed.
     */
    SCHEDULED,

    /**
     * Event has been completed.
     */
    COMPLETED,

    /**
     * Event was missed (not attended).
     */
    MISSED,

    /**
     * Event was cancelled.
     */
    CANCELLED
}
