package com.kptest.application.service;

import com.kptest.domain.patient.Patient;
import com.kptest.domain.patient.PatientRepository;
import com.kptest.domain.user.AccountStatus;
import com.kptest.domain.user.User;
import com.kptest.domain.user.UserRepository;
import com.kptest.domain.user.UserRole;
import com.kptest.exception.DuplicateResourceException;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.UUID;

/**
 * Service handling user registration.
 */
@Slf4j
@Service
@RequiredArgsConstructor
@Transactional
public class RegistrationService {

    private final UserRepository userRepository;
    private final PatientRepository patientRepository;
    private final PasswordEncoder passwordEncoder;

    /**
     * Register a new patient user.
     * 
     * @param identifier Email or phone
     * @param rawPassword Raw password
     * @param pesel Patient PESEL number
     * @param firstName Patient first name
     * @param lastName Patient last name
     * @param email Optional email (if identifier is phone)
     * @param phone Optional phone (if identifier is email)
     * @return Created user entity
     */
    public User registerPatient(
            String identifier,
            String rawPassword,
            String pesel,
            String firstName,
            String lastName,
            String email,
            String phone) {
        
        // Determine if identifier is email or phone
        String userEmail = identifier.contains("@") ? identifier : email;
        String userPhone = identifier.contains("@") ? phone : identifier;

        // Check for existing user
        if (userRepository.existsByEmail(userEmail)) {
            throw new DuplicateResourceException("User", "email", userEmail);
        }
        
        if (userPhone != null && userRepository.existsByPhone(userPhone)) {
            throw new DuplicateResourceException("User", "phone", userPhone);
        }

        // Check for existing patient by PESEL
        if (patientRepository.existsByPesel(pesel)) {
            throw new DuplicateResourceException("Patient", "pesel", pesel);
        }

        // Create user
        String passwordHash = passwordEncoder.encode(rawPassword);
        User user = User.create(userEmail, passwordHash, UserRole.PATIENT);
        user.setPhone(userPhone);
        user.setStatus(AccountStatus.PENDING_VERIFICATION); // Requires HIS verification
        userRepository.save(user);

        // Create patient profile
        Patient patient = Patient.create(user, pesel, firstName, lastName);
        patientRepository.save(patient);

        log.info("Registered new patient user: {} with PESEL: {}", userEmail, pesel);
        
        return user;
    }

    /**
     * Register a new staff user (admin only).
     */
    public User registerStaff(
            String email,
            String rawPassword,
            UserRole role,
            String firstName,
            String lastName,
            String employeeId,
            String specialization) {
        
        // Check for existing user
        if (userRepository.existsByEmail(email)) {
            throw new DuplicateResourceException("User", "email", email);
        }

        // Create user
        String passwordHash = passwordEncoder.encode(rawPassword);
        User user = User.create(email, passwordHash, role);
        user.setStatus(AccountStatus.ACTIVE);
        userRepository.save(user);

        // TODO: Create staff profile
        
        log.info("Registered new staff user: {} with role: {}", email, role);
        
        return user;
    }
}
