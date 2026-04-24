-- Seed Users for KPTEST
-- All passwords: TestP@ssw0rd123
-- BCrypt hash: $2a$12$IZj5EE7EqpkJQzQbYMvrSexhgEEWtWD3ndh2lKEWosV1.oPC7umk2

-- Clear existing data (optional, comment out for production)
-- DELETE FROM users WHERE email LIKE '%@kptest.com';

-- Admin users
INSERT INTO users (email, password_hash, role, status, two_factor_enabled, created_at, updated_at)
VALUES (
  'admin@kptest.com',
  '$2a$12$IZj5EE7EqpkJQzQbYMvrSexhgEEWtWD3ndh2lKEWosV1.oPC7umk2',
  'ADMIN',
  'ACTIVE',
  false,
  NOW(),
  NOW()
);

-- Staff users (Koordynator, Lekarz)
INSERT INTO users (email, password_hash, role, status, created_at, updated_at)
VALUES
  (
    'coordinator@kptest.com',
  '$2a$12$IZj5EE7EqpkJQzQbYMvrSexhgEEWtWD3ndh2lKEWosV1.oPC7umk2',
    'COORDINATOR',
    'ACTIVE',
    NOW(),
    NOW()
  ),
  (
    'doctor@kptest.com',
    '$2a$12$IZj5EE7EqpkJQzQbYMvrSexhgEEWtWD3ndh2lKEWosV1.oPC7umk2',
    'DOCTOR',
    'ACTIVE',
    NOW(),
    NOW()
  );

-- Patient users (testowi)
INSERT INTO users (email, password_hash, role, status, created_at, updated_at)
VALUES
  (
    'patient1@kptest.com',
    '$2a$12$IZj5EE7EqpkJQzQbYMvrSexhgEEWtWD3ndh2lKEWosV1.oPC7umk2',
    'PATIENT',
    'ACTIVE',
    NOW(),
    NOW()
  ),
  (
    'patient2@kptest.com',
    '$2a$12$IZj5EE7EqpkJQzQbYMvrSexhgEEWtWD3ndh2lKEWosV1.oPC7umk2',
    'PATIENT',
    'PENDING_VERIFICATION',
    NOW(),
    NOW()
  );
