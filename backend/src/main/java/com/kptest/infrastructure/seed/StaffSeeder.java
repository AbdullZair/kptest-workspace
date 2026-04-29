package com.kptest.infrastructure.seed;

import com.kptest.domain.staff.Staff;
import com.kptest.domain.staff.StaffRepository;
import com.kptest.domain.user.User;
import com.kptest.domain.user.UserRepository;
import com.kptest.domain.user.UserRole;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.boot.CommandLineRunner;
import org.springframework.context.annotation.Profile;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

import java.util.Set;

/**
 * Backfills Staff rows for ADMIN/DOCTOR/COORDINATOR users on dev startup.
 *
 * <p>Flyway is disabled in the dev profile (Hibernate {@code ddl-auto:update}
 * owns the schema there), so V6__seed_staff_for_seeded_users.sql does not run
 * locally. ProjectController.createProject relies on
 * {@code staffRepository.findById(userId)}, which would 404 on every staff
 * user that was created via /auth/login seeds without a matching Staff row.</p>
 *
 * <p>This runner is idempotent — it only inserts when no Staff row already
 * exists for the user. Safe to leave on permanently in dev.</p>
 */
@Slf4j
@Component
@Profile("dev")
@RequiredArgsConstructor
public class StaffSeeder implements CommandLineRunner {

    private static final Set<UserRole> STAFF_ROLES = Set.of(
        UserRole.ADMIN, UserRole.DOCTOR, UserRole.COORDINATOR
    );

    private final UserRepository userRepository;
    private final StaffRepository staffRepository;

    @Override
    @Transactional
    public void run(String... args) {
        userRepository.findAll().stream()
            .filter(u -> STAFF_ROLES.contains(u.getRole()))
            .filter(u -> staffRepository.findByUserId(u.getId()).isEmpty())
            .forEach(this::seedStaff);
    }

    private void seedStaff(User user) {
        Staff staff = Staff.create(
            user,
            firstNameForRole(user.getRole()),
            "KPTEST",
            "EMP-" + user.getId().toString().substring(0, 8),
            user.getRole() == UserRole.DOCTOR ? "general" : null
        );
        // Force the Staff PK to equal the User PK so existing controllers that
        // pass userId straight into staffRepository.findById(...) keep working.
        java.lang.reflect.Field idField;
        try {
            idField = Staff.class.getDeclaredField("id");
            idField.setAccessible(true);
            idField.set(staff, user.getId());
        } catch (ReflectiveOperationException ex) {
            log.warn("Could not align Staff.id with User.id, will be auto-generated", ex);
        }
        staffRepository.save(staff);
        log.info("Seeded Staff for user {} ({}, {})", user.getEmail(), user.getRole(), user.getId());
    }

    private static String firstNameForRole(UserRole role) {
        return switch (role) {
            case ADMIN -> "Admin";
            case DOCTOR -> "Lekarz";
            case COORDINATOR -> "Koordynator";
            default -> "Staff";
        };
    }
}
