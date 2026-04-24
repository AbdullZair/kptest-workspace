-- Seed Projects for KPTEST
-- Creates test rehabilitation projects

-- Clear existing data (optional)
-- DELETE FROM projects WHERE name LIKE 'Projekt Rehabilitacji%';

-- Rehabilitation projects
INSERT INTO projects (name, description, start_date, end_date, status, created_by, created_at, updated_at)
VALUES 
  (
    'Projekt Rehabilitacji A', 
    'Kompleksowy projekt rehabilitacji dla pacjentów z urazami kręgosłupa', 
    NOW(), 
    NOW() + INTERVAL '6 months',
    'ACTIVE', 
    1,
    NOW(),
    NOW()
  ),
  (
    'Projekt Rehabilitacji B', 
    'Projekt rehabilitacji pourazowej dla sportowców', 
    NOW(), 
    NOW() + INTERVAL '3 months',
    'ACTIVE', 
    1,
    NOW(),
    NOW()
  ),
  (
    'Projekt Rehabilitacji C', 
    'Rehabilitacja neurologiczna - projekt badawczy', 
    NOW() - INTERVAL '1 month', 
    NOW() + INTERVAL '12 months',
    'ACTIVE', 
    2,
    NOW(),
    NOW()
  );
