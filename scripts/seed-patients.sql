-- Seed Patients for KPTEST
-- Links patient profiles to user accounts

-- Clear existing data (optional)
-- DELETE FROM patients;

-- Patient profiles linked to user accounts
INSERT INTO patients (user_id, pesel, first_name, last_name, verification_status, created_at, updated_at)
SELECT 
  id, 
  '90010101234', 
  'Jan', 
  'Kowalski', 
  'APPROVED',
  NOW(),
  NOW()
FROM users 
WHERE email = 'patient1@kptest.com';

INSERT INTO patients (user_id, pesel, first_name, last_name, verification_status, created_at, updated_at)
SELECT 
  id, 
  '92020202345', 
  'Anna', 
  'Nowak', 
  'PENDING',
  NOW(),
  NOW()
FROM users 
WHERE email = 'patient2@kptest.com';
