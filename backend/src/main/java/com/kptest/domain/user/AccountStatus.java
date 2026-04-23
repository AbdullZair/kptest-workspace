package com.kptest.domain.user;

/**
 * Account status indicating user's access level.
 */
public enum AccountStatus {
    /** Pending HIS verification (patients only) */
    PENDING_VERIFICATION,
    
    /** Active and verified */
    ACTIVE,
    
    /** Temporarily blocked after failed login attempts */
    BLOCKED,
    
    /** Rejected during verification (patients only) */
    REJECTED,
    
    /** Deactivated by administrator */
    DEACTIVATED
}
