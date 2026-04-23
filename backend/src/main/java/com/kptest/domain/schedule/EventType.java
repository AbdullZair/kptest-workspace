package com.kptest.domain.schedule;

/**
 * Type of therapy event.
 */
public enum EventType {
    /**
     * Medical visit / appointment.
     */
    VISIT,

    /**
     * Therapy session.
     */
    SESSION,

    /**
     * Medication reminder.
     */
    MEDICATION,

    /**
     * Exercise to perform.
     */
    EXERCISE,

    /**
     * Health measurement.
     */
    MEASUREMENT,

    /**
     * Other custom event type.
     */
    OTHER
}
