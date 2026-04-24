-- Seed Educational Materials for KPTEST
-- Creates test educational content and resources

-- Clear existing data (optional)
-- DELETE FROM educational_materials WHERE title LIKE 'Artykuł%' OR title LIKE 'PDF%';

-- Educational materials
INSERT INTO educational_materials (project_id, title, content, type, category, difficulty, published, author_id, created_at, updated_at)
VALUES 
  (
    1, 
    'Artykuł o rehabilitacji kręgosłupa', 
    '<h1>Rehabilitacja kręgosłupa</h1><p>Rehabilitacja kręgosłupa jest kluczowym elementem procesu zdrowienia...</p><h2>Ćwiczenia podstawowe</h2><p>1. Skłony tułowia...</p>', 
    'ARTICLE', 
    'Edukacja', 
    'BASIC', 
    true,
    3,
    NOW(),
    NOW()
  ),
  (
    1, 
    'PDF z ćwiczeniami domowymi', 
    '', 
    'PDF', 
    'Ćwiczenia', 
    'BASIC', 
    true,
    3,
    NOW(),
    NOW()
  ),
  (
    1, 
    'Wideo: Prawidłowa postawa', 
    'https://example.com/videos/posture.mp4', 
    'VIDEO', 
    'Edukacja', 
    'BASIC', 
    true,
    2,
    NOW(),
    NOW()
  ),
  (
    2, 
    'Trening dla sportowców - poziom zaawansowany', 
    '<h1>Trening funkcjonalny</h1><p>Program treningowy dla sportowców po urazach...</p>', 
    'ARTICLE', 
    'Trening', 
    'ADVANCED', 
    true,
    3,
    NOW(),
    NOW()
  ),
  (
    2, 
    'Checklista powrotu do sportu', 
    '', 
    'PDF', 
    'Dokumenty', 
    'INTERMEDIATE', 
    true,
    2,
    NOW(),
    NOW()
  ),
  (
    3, 
    'Neurorehabilitacja - materiały dla terapeutów', 
    '<h1>Podstawy neurorehabilitacji</h1><p>Materiały szkoleniowe...</p>', 
    'ARTICLE', 
    'Szkolenia', 
    'ADVANCED', 
    false,
    1,
    NOW(),
    NOW()
  );
