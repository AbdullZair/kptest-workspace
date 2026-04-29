-- V6: backfill staff records for ADMIN/DOCTOR/COORDINATOR users.
--
-- Seeded auth users (admin@kptest.com, doctor@kptest.com,
-- coordinator@kptest.com) had no matching row in the staff table,
-- which broke ProjectController.createProject (lookup by staff.id =
-- userId returned 404 "Staff not found"). This migration creates a
-- minimal staff row for every staff-role user that does not yet have
-- one, so project / event / material flows can be exercised by E2E
-- and by real users.
--
-- Idempotent: WHERE NOT EXISTS guard means re-applying does nothing.

INSERT INTO staff (
    id, user_id, employee_id, first_name, last_name,
    specialization, email, active, created_at, updated_at
)
SELECT
    u.id,
    u.id,
    'EMP-' || SUBSTR(u.id::text, 1, 8),
    CASE u.role
        WHEN 'ADMIN' THEN 'Admin'
        WHEN 'DOCTOR' THEN 'Lekarz'
        WHEN 'COORDINATOR' THEN 'Koordynator'
        ELSE 'Staff'
    END,
    'KPTEST',
    CASE u.role WHEN 'DOCTOR' THEN 'general' ELSE NULL END,
    u.email,
    TRUE,
    now(),
    now()
FROM users u
WHERE u.role IN ('ADMIN', 'DOCTOR', 'COORDINATOR')
  AND NOT EXISTS (
    SELECT 1 FROM staff s WHERE s.user_id = u.id
  );
