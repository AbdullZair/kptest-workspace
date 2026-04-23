package com.kptest.domain.user;

/**
 * User role in the system.
 */
public enum UserRole {
    /** System administrator with full access */
    ADMIN,
    
    /** Therapy project coordinator */
    COORDINATOR,
    
    /** Medical doctor */
    DOCTOR,
    
    /** Therapist */
    THERAPIST,
    
    /** Nurse or other medical staff */
    NURSE,
    
    /** Patient (mobile app user) */
    PATIENT
}
