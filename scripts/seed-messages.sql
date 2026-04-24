-- Seed Messages for KPTEST
-- Creates test message threads and messages

-- Clear existing data (optional)
-- DELETE FROM messages WHERE thread_id IN (SELECT id FROM message_threads WHERE title LIKE 'Wątek testowy%');
-- DELETE FROM message_threads WHERE title LIKE 'Wątek testowy%';

-- Message threads
INSERT INTO message_threads (project_id, title, type, created_by, created_at, updated_at)
VALUES 
  (1, 'Wątek testowy - indywidualny', 'INDIVIDUAL', 2, NOW(), NOW()),
  (1, 'Wątek grupowy - zespół A', 'GROUP', 2, NOW(), NOW()),
  (2, 'Konsultacja lekarska', 'INDIVIDUAL', 3, NOW(), NOW());

-- Messages within threads
INSERT INTO messages (thread_id, sender_id, content, priority, is_read, created_at, updated_at)
VALUES 
  -- Thread 1 messages
  (1, 3, 'Dzień dobry, proszę o informacje dotyczące postępu rehabilitacji pacjenta Jana Kowalskiego.', 'NORMAL', false, NOW(), NOW()),
  (1, 2, 'Witaj, pacjent wykonuje wszystkie ćwiczenia zgodnie z planem. Postępy są zadowalające.', 'NORMAL', true, NOW() + INTERVAL '1 hour', NOW()),
  (1, 3, 'Świetnie! Proszę o przesłanie raportu do końca tygodnia.', 'HIGH', false, NOW() + INTERVAL '2 hours', NOW()),
  
  -- Thread 2 messages
  (2, 2, 'Cześć wszystkim, przypominam o spotkaniu zespołu w czwartek.', 'NORMAL', false, NOW(), NOW()),
  (2, 1, 'Dziękuję za przypomnienie, będę obecny.', 'LOW', true, NOW() + INTERVAL '30 minutes', NOW()),
  
  -- Thread 3 messages
  (3, 3, 'Proszę o pilną konsultację dotyczącą zmiany planu terapii.', 'URGENT', false, NOW(), NOW()),
  (3, 2, 'Oczywiście, mogę spotkać się jutro o 10:00.', 'HIGH', false, NOW() + INTERVAL '15 minutes', NOW());
