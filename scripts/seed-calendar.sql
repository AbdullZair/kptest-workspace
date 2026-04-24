-- Seed Calendar Events for KPTEST
-- Creates test therapy events and appointments

-- Clear existing data (optional)
-- DELETE FROM therapy_events WHERE title LIKE 'Wizyta%' OR title LIKE 'Sesja%';

-- Therapy events
INSERT INTO therapy_events (project_id, patient_id, title, description, type, scheduled_at, duration_minutes, status, created_by, created_at, updated_at)
VALUES 
  -- Project 1, Patient 1 events
  (1, 1, 'Wizyta kontrolna', 'Pierwsza wizyta kontrolna po urazie', 'VISIT', NOW() + INTERVAL '1 day' + INTERVAL '9 hours', 60, 'SCHEDULED', 2, NOW(), NOW()),
  (1, 1, 'Sesja terapeutyczna - ćwiczenia', 'Indywidualne ćwiczenia rehabilitacyjne', 'SESSION', NOW() + INTERVAL '2 days' + INTERVAL '10 hours', 45, 'SCHEDULED', 3, NOW(), NOW()),
  (1, 1, 'Ocena postępów', 'Miesięczna ocena postępów rehabilitacji', 'ASSESSMENT', NOW() + INTERVAL '7 days' + INTERVAL '11 hours', 90, 'SCHEDULED', 2, NOW(), NOW()),
  
  -- Project 2, Patient 1 events
  (2, 1, 'Konsultacja sportowa', 'Konsultacja dla sportowców', 'CONSULTATION', NOW() + INTERVAL '3 days' + INTERVAL '14 hours', 30, 'SCHEDULED', 3, NOW(), NOW()),
  (2, 1, 'Trening funkcjonalny', 'Trening przywracający pełną sprawność', 'SESSION', NOW() + INTERVAL '5 days' + INTERVAL '16 hours', 60, 'SCHEDULED', 3, NOW(), NOW()),
  
  -- Completed events for history
  (1, 1, 'Wizyta wstępna', 'Pierwsza wizyta i wywiad', 'VISIT', NOW() - INTERVAL '14 days' + INTERVAL '9 hours', 60, 'COMPLETED', 2, NOW() - INTERVAL '14 days', NOW() - INTERVAL '14 days'),
  (1, 1, 'Sesja wprowadzająca', 'Zapoznanie z ćwiczeniami', 'SESSION', NOW() - INTERVAL '7 days' + INTERVAL '10 hours', 45, 'COMPLETED', 3, NOW() - INTERVAL '7 days', NOW() - INTERVAL '7 days');

-- Additional events for Patient 2 (pending verification)
INSERT INTO therapy_events (project_id, patient_id, title, description, type, scheduled_at, duration_minutes, status, created_by, created_at, updated_at)
SELECT 
  1,
  p.id,
  'Wizyta weryfikacyjna',
  'Wizyta w celu weryfikacji stanu pacjenta',
  'VISIT',
  NOW() + INTERVAL '4 days' + INTERVAL '12 hours',
  45,
  'PENDING',
  2,
  NOW(),
  NOW()
FROM patients p
JOIN users u ON p.user_id = u.id
WHERE u.email = 'patient2@kptest.com';
