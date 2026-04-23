package com.kptest.domain.user;

/**
 * Verification status for patient identity verification.
 */
public enum VerificationStatus {
    /** Awaiting staff verification */
    PENDING,
    
    /** Verified successfully */
    APPROVED,
    
    /** Rejected by staff */
    REJECTED
}
