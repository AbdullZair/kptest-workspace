package com.kptest.domain.message;

/**
 * Message priority enum for categorizing message urgency.
 */
public enum MessagePriority {
    /**
     * Informational message with low priority.
     */
    INFO,

    /**
     * Question requiring a response.
     */
    QUESTION,

    /**
     * Urgent message requiring immediate attention.
     */
    URGENT
}
