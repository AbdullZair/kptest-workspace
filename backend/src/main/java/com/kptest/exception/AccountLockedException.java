package com.kptest.exception;

/**
 * Thrown when user account is locked.
 */
public class AccountLockedException extends DomainException {
    
    public AccountLockedException() {
        super("ACCOUNT_LOCKED", "Account is temporarily locked due to too many failed login attempts");
    }
    
    public AccountLockedException(String message) {
        super("ACCOUNT_LOCKED", message);
    }
}
