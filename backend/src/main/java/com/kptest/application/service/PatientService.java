package com.kptest.application.service;

import com.kptest.api.dto.*;
import com.kptest.domain.patient.Patient;
import com.kptest.domain.patient.PatientRepository;
import com.kptest.domain.user.User;
import com.kptest.domain.user.UserRepository;
import com.kptest.domain.user.VerificationStatus;
import com.kptest.exception.ResourceNotFoundException;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Instant;
import java.util.*;

/**
 * Patient service handling all patient-related operations.
 */
@Slf4j
@Service
@RequiredArgsConstructor
@Transactional
public class PatientService {

    private final PatientRepository patientRepository;
    private final UserRepository userRepository;

    /**
     * Find all patients with filtering and pagination.
     *
     * @param filters Search filters
     * @return Paginated list of patients
     */
    @Transactional(readOnly = true)
    public PatientSearchResponse findAll(PatientSearchRequest filters) {
        log.debug("Finding patients with filters: {}", filters);

        Pageable pageable = createPageable(filters);
        List<Patient> patients = patientRepository.findAllWithFilters(
            filters.pesel(),
            filters.name(),
            filters.hisPatientId(),
            filters.status(),
            filters.verificationStatus(),
            pageable
        );

        long total = patientRepository.countWithFilters(
            filters.pesel(),
            filters.name(),
            filters.hisPatientId(),
            filters.status(),
            filters.verificationStatus()
        );

        List<PatientDto> patientDtos = patients.stream()
            .map(PatientDto::fromPatient)
            .toList();

        return PatientSearchResponse.fromPage(
            patientDtos,
            total,
            filters.page(),
            filters.size()
        );
    }

    /**
     * Find patient by ID.
     *
     * @param id Patient ID
     * @return Patient DTO
     * @throws ResourceNotFoundException if patient not found
     */
    @Transactional(readOnly = true)
    public PatientDto findById(UUID id) {
        log.debug("Finding patient by ID: {}", id);

        Patient patient = patientRepository.findById(id)
            .orElseThrow(() -> new ResourceNotFoundException("Patient not found with id: " + id));

        return PatientDto.fromPatient(patient);
    }

    /**
     * Create a new patient.
     *
     * @param patientDto Patient DTO
     * @return Created patient DTO
     */
    public PatientDto create(PatientDto patientDto) {
        log.info("Creating patient with PESEL: {}", patientDto.pesel());

        // Check if PESEL already exists
        if (patientRepository.existsByPesel(patientDto.pesel())) {
            throw new IllegalArgumentException("Patient with PESEL " + patientDto.pesel() + " already exists");
        }

        // Create or find user
        User user = findOrCreateUser(patientDto);

        // Create patient
        Patient patient = Patient.create(
            user,
            patientDto.pesel(),
            patientDto.firstName(),
            patientDto.lastName()
        );

        // Set additional fields
        patient.setDateOfBirth(patientDto.dateOfBirth());
        patient.setGender(patientDto.gender());
        patient.setAddressStreet(patientDto.addressStreet());
        patient.setAddressCity(patientDto.addressCity());
        patient.setAddressPostalCode(patientDto.addressPostalCode());
        patient.setHisPatientId(patientDto.hisPatientId());

        if (patientDto.verificationStatus() != null) {
            patient.setVerificationStatus(patientDto.verificationStatus());
        }

        Patient savedPatient = patientRepository.save(patient);
        log.info("Created patient with ID: {}", savedPatient.getId());

        return PatientDto.fromPatient(savedPatient);
    }

    /**
     * Update an existing patient.
     *
     * @param id Patient ID
     * @param patientDto Patient DTO with updated data
     * @return Updated patient DTO
     * @throws ResourceNotFoundException if patient not found
     */
    public PatientDto update(UUID id, PatientDto patientDto) {
        log.info("Updating patient with ID: {}", id);

        Patient patient = patientRepository.findById(id)
            .orElseThrow(() -> new ResourceNotFoundException("Patient not found with id: " + id));

        // Update fields
        if (patientDto.firstName() != null) {
            patient.setFirstName(patientDto.firstName());
        }
        if (patientDto.lastName() != null) {
            patient.setLastName(patientDto.lastName());
        }
        if (patientDto.dateOfBirth() != null) {
            patient.setDateOfBirth(patientDto.dateOfBirth());
        }
        if (patientDto.gender() != null) {
            patient.setGender(patientDto.gender());
        }
        if (patientDto.addressStreet() != null) {
            patient.setAddressStreet(patientDto.addressStreet());
        }
        if (patientDto.addressCity() != null) {
            patient.setAddressCity(patientDto.addressCity());
        }
        if (patientDto.addressPostalCode() != null) {
            patient.setAddressPostalCode(patientDto.addressPostalCode());
        }
        if (patientDto.hisPatientId() != null) {
            patient.setHisPatientId(patientDto.hisPatientId());
        }
        if (patientDto.verificationStatus() != null) {
            patient.setVerificationStatus(patientDto.verificationStatus());
        }

        // Update user info if provided
        User user = patient.getUser();
        if (patientDto.email() != null) {
            user.setEmail(patientDto.email());
        }
        if (patientDto.phone() != null) {
            user.setPhone(patientDto.phone());
        }

        Patient updatedPatient = patientRepository.save(patient);
        log.info("Updated patient with ID: {}", updatedPatient.getId());

        return PatientDto.fromPatient(updatedPatient);
    }

    /**
     * Soft delete a patient.
     *
     * @param id Patient ID
     * @throws ResourceNotFoundException if patient not found
     */
    public void delete(UUID id) {
        log.info("Soft deleting patient with ID: {}", id);

        Patient patient = patientRepository.findById(id)
            .orElseThrow(() -> new ResourceNotFoundException("Patient not found with id: " + id));

        // Soft delete by deactivating the user
        patient.getUser().deactivate();
        patientRepository.delete(patient);

        log.info("Soft deleted patient with ID: {}", id);
    }

    /**
     * Verify patient with HIS (Hospital Information System).
     *
     * @param pesel Patient PESEL
     * @param cartNumber Cart number for verification
     * @return Verification result
     */
    @Transactional(readOnly = true)
    public PatientVerifyResponse verifyWithHIS(String pesel, String cartNumber) {
        log.info("Verifying patient with HIS. PESEL: {}, Cart: {}", pesel, cartNumber);

        // Simulate HIS verification
        // In production, this would call an external HIS API
        try {
            // Simulate API call delay
            Thread.sleep(100);

            // For demo purposes, verify if PESEL is valid format
            if (pesel == null || pesel.length() != 11 || !pesel.matches("\\d{11}")) {
                return PatientVerifyResponse.error("Invalid PESEL format");
            }

            // Check if patient exists in local database
            Optional<Patient> existingPatient = patientRepository.findByPesel(pesel);

            if (existingPatient.isPresent()) {
                Patient patient = existingPatient.get();
                return PatientVerifyResponse.success(
                    patient.getHisPatientId() != null ? patient.getHisPatientId() : "HIS-" + pesel,
                    pesel,
                    patient.getFirstName(),
                    patient.getLastName(),
                    patient.getDateOfBirth() != null ? patient.getDateOfBirth().toString() : null
                );
            }

            // Simulate finding patient in HIS
            String hisPatientId = "HIS-" + pesel;
            return PatientVerifyResponse.success(
                hisPatientId,
                pesel,
                "Jan",
                "Kowalski",
                "1990-01-01"
            );

        } catch (InterruptedException e) {
            Thread.currentThread().interrupt();
            return PatientVerifyResponse.error("HIS verification interrupted");
        } catch (Exception e) {
            log.error("HIS verification failed", e);
            return PatientVerifyResponse.error("HIS verification failed: " + e.getMessage());
        }
    }

    /**
     * Search patients by query.
     *
     * @param query Search query (PESEL, name, or HIS ID)
     * @return List of matching patients
     */
    @Transactional(readOnly = true)
    public List<PatientDto> search(String query) {
        log.debug("Searching patients with query: {}", query);

        if (query == null || query.isBlank()) {
            return Collections.emptyList();
        }

        List<Patient> patients = patientRepository.search(query.trim());

        return patients.stream()
            .map(PatientDto::fromPatient)
            .toList();
    }

    /**
     * Find patient by PESEL.
     *
     * @param pesel Patient PESEL
     * @return Patient DTO
     */
    @Transactional(readOnly = true)
    public Optional<PatientDto> findByPesel(String pesel) {
        return patientRepository.findByPesel(pesel)
            .map(PatientDto::fromPatient);
    }

    /**
     * Create pageable for sorting and pagination.
     */
    private Pageable createPageable(PatientSearchRequest filters) {
        String sortField = filters.sort() != null ? filters.sort() : "lastName";
        String sortOrder = filters.sortOrder() != null ? filters.sortOrder() : "asc";

        Sort.Direction direction = sortOrder.equalsIgnoreCase("desc")
            ? Sort.Direction.DESC
            : Sort.Direction.ASC;

        // Map sort field to entity field
        String entityField = mapSortField(sortField);

        return PageRequest.of(filters.page(), filters.size(), Sort.by(direction, entityField));
    }

    /**
     * Map sort field to entity field name.
     */
    private String mapSortField(String sortField) {
        return switch (sortField.toLowerCase()) {
            case "name", "first_name", "firstname" -> "firstName";
            case "last_name", "lastname" -> "lastName";
            case "created_at", "createdat", "created" -> "createdAt";
            case "updated_at", "updatedat", "updated" -> "updatedAt";
            case "pesel" -> "pesel";
            case "status" -> "verificationStatus";
            default -> "lastName";
        };
    }

    /**
     * Find or create user for patient.
     */
    private User findOrCreateUser(PatientDto patientDto) {
        // Try to find user by email
        if (patientDto.email() != null) {
            Optional<User> existingUser = userRepository.findByEmailOrPhone(patientDto.email());
            if (existingUser.isPresent()) {
                return existingUser.get();
            }
        }

        // Try to find user by phone
        if (patientDto.phone() != null) {
            Optional<User> existingUser = userRepository.findByEmailOrPhone(patientDto.phone());
            if (existingUser.isPresent()) {
                return existingUser.get();
            }
        }

        // Create new user for patient
        User user = User.create(
            patientDto.email() != null ? patientDto.email() : patientDto.pesel() + "@patient.local",
            "", // Empty password - user will set it later
            com.kptest.domain.user.UserRole.PATIENT
        );
        user.setPhone(patientDto.phone());

        return userRepository.save(user);
    }
}
