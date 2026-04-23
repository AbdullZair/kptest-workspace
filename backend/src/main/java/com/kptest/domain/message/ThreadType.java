package com.kptest.domain.message;

/**
 * Thread type enum distinguishing between individual and group conversations.
 */
public enum ThreadType {
    /**
     * One-to-one conversation between two users.
     */
    INDIVIDUAL,

    /**
     * Group conversation with multiple participants.
     */
    GROUP
}
