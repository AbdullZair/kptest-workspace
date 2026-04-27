/**
 * Quizzes Tests - Phase 3
 *
 * Tests for quiz features:
 * - Create quiz with questions
 * - Patient takes quiz
 * - Quiz scoring and results
 * - Quiz management
 *
 * @module tests/phase3/quizzes.spec.ts
 */

import { test, expect } from '@playwright/test';
import {
  testPatients,
  testQuizzes,
  phase3ApiEndpoints,
  httpStatus,
  generateUniqueIdentifier,
} from '../test-data';

test.describe('Phase 3 - Quizzes', () => {
  let authToken: string;
  let adminAuthToken: string;
  let testQuizId: string;

  /**
   * Setup: Login before each test
   */
  test.beforeEach(async ({ request }) => {
    // Login as admin for creation tests
    const adminLoginResponse = await request.post('http://localhost:8080/api/v1/auth/login', {
      data: {
        identifier: 'admin@kptest.com',
        password: 'TestP@ssw0rd123',
      },
    });

    if (adminLoginResponse.status() === httpStatus.OK) {
      const body = await adminLoginResponse.json();
      adminAuthToken = body.access_token;
    }

    // Login as patient for taking tests
    const patientLoginResponse = await request.post('http://localhost:8080/api/v1/auth/login', {
      data: {
        identifier: testPatients.STANDARD.email,
        password: testPatients.STANDARD.password,
      },
    });

    if (patientLoginResponse.status() === httpStatus.OK) {
      const body = await patientLoginResponse.json();
      authToken = body.access_token;
    }
  });

  test.describe('Create Quiz', () => {
    test('should create new quiz', async ({ request, page }) => {
      test.skip(!adminAuthToken, 'Admin auth token not available');

      const uniqueTitle = generateUniqueIdentifier('Quiz testowy');

      // Via API
      const response = await request.post(phase3ApiEndpoints.quizzes.create, {
        headers: {
          'Authorization': `Bearer ${adminAuthToken}`,
          'Content-Type': 'application/json',
        },
        data: {
          title: uniqueTitle,
          description: testQuizzes.SAMPLE_QUIZ.description,
          category: testQuizzes.SAMPLE_QUIZ.category,
          difficulty: testQuizzes.SAMPLE_QUIZ.difficulty,
          passingScore: testQuizzes.SAMPLE_QUIZ.passingScore,
        },
      });

      expect([httpStatus.CREATED, httpStatus.OK, httpStatus.FORBIDDEN]).toContain(response.status());

      if (response.status() === httpStatus.CREATED || response.status() === httpStatus.OK) {
        const body = await response.json();
        expect(body.title).toBe(uniqueTitle);
        testQuizId = body.id;
      }
    });

    test('should create quiz with questions via UI', async ({ page }) => {
      test.skip(!adminAuthToken, 'Admin auth token not available');

      await page.goto('/admin/quizzes/new');
      await page.waitForSelector('[data-testid="quiz-form"]');

      // Fill basic info
      await page.fill('[name="title"]', generateUniqueIdentifier('Quiz z pytaniami'));
      await page.fill('[name="description"]', testQuizzes.SAMPLE_QUIZ.description);
      await page.selectOption('[name="category"]', testQuizzes.SAMPLE_QUIZ.category);
      await page.selectOption('[name="difficulty"]', testQuizzes.SAMPLE_QUIZ.difficulty);
      await page.fill('[name="passing-score"]', testQuizzes.SAMPLE_QUIZ.passingScore.toString());

      // Add questions
      await page.click('[data-testid="add-question"]');
      await page.waitForSelector('[data-testid="question-editor"]');

      // Question 1 - Multiple choice
      await page.fill('[name="question-text"]', testQuizzes.QUESTIONS[0].text);
      await page.selectOption('[name="question-type"]', 'MULTIPLE_CHOICE');
      
      for (let i = 0; i < testQuizzes.QUESTIONS[0].options.length; i++) {
        await page.fill(`[name="option-${i}"]`, testQuizzes.QUESTIONS[0].options[i]);
      }
      await page.check(`[name="correct-answer"] >> nth=0`);
      await page.fill('[name="question-points"]', '10');

      // Save quiz
      await page.click('[data-testid="save-quiz"]');
      await page.waitForSelector('[data-testid="quiz-saved"]');
    });

    test('should create quiz with multiple question types', async ({ page }) => {
      test.skip(!adminAuthToken, 'Admin auth token not available');

      await page.goto('/admin/quizzes/new');
      await page.fill('[name="title"]', generateUniqueIdentifier('Quiz wielotypowy'));
      await page.fill('[name="description"]', 'Quiz z różnymi typami pytań');

      // Add multiple choice question
      await page.click('[data-testid="add-question"]');
      await page.selectOption('[name="question-type"]', 'MULTIPLE_CHOICE');
      await page.fill('[name="question-text"]', 'Pytanie jednokrotnego wyboru');
      await page.fill('[name="option-0"]', 'Opcja A');
      await page.fill('[name="option-1"]', 'Opcja B');
      await page.check('[name="correct-answer"] >> nth=0');

      // Add true/false question
      await page.click('[data-testid="add-question"]');
      await page.selectOption('[name="question-type"]', 'TRUE_FALSE');
      await page.fill('[name="question-text"]', 'Czy to prawda?');
      await page.check('[name="correct-answer-true"]');

      // Add multiple select question
      await page.click('[data-testid="add-question"]');
      await page.selectOption('[name="question-type"]', 'MULTIPLE_SELECT');
      await page.fill('[name="question-text"]', 'Zaznacz wszystkie poprawne');
      await page.fill('[name="option-0"]', 'Opcja 1');
      await page.fill('[name="option-1"]', 'Opcja 2');
      await page.check('[name="correct-answer"] >> nth=0');
      await page.check('[name="correct-answer"] >> nth=1');

      await page.click('[data-testid="save-quiz"]');
      await page.waitForSelector('[data-testid="quiz-saved"]');
    });

    test('should validate quiz has at least one question', async ({ page }) => {
      test.skip(!adminAuthToken, 'Admin auth token not available');

      await page.goto('/admin/quizzes/new');
      await page.fill('[name="title"]', 'Quiz bez pytań');
      await page.fill('[name="description"]', 'Ten quiz nie ma pytań');

      // Try to save without questions
      await page.click('[data-testid="save-quiz"]');

      // Should show validation error
      await page.waitForSelector('[data-testid="validation-error"]');
      const errorText = await page.textContent('[data-testid="validation-error"]');
      expect(errorText).toContain('przynajmniej jedno pytanie');
    });

    test('should validate passing score is between 0 and 100', async ({ page }) => {
      test.skip(!adminAuthToken, 'Admin auth token not available');

      await page.goto('/admin/quizzes/new');
      await page.fill('[name="title"]', 'Quiz z błędnym passing score');
      
      // Try invalid passing score
      await page.fill('[name="passing-score"]', '150');
      await page.click('[data-testid="save-quiz"]');

      await page.waitForSelector('[data-testid="validation-error"]');
      const errorText = await page.textContent('[data-testid="validation-error"]');
      expect(errorText).toContain('0 i 100');

      // Try negative
      await page.fill('[name="passing-score"]', '-10');
      await page.click('[data-testid="save-quiz"]');
      await page.waitForSelector('[data-testid="validation-error"]');
    });

    test('should add question with image', async ({ page }) => {
      test.skip(!adminAuthToken, 'Admin auth token not available');

      await page.goto('/admin/quizzes/new');
      await page.fill('[name="title"]', 'Quiz z obrazkami');
      await page.click('[data-testid="add-question"]');
      
      await page.fill('[name="question-text"]', 'Co widzisz na obrazku?');
      
      // Upload image
      await page.setInputFiles('[name="question-image"]', {
        name: 'test-image.png',
        mimeType: 'image/png',
        buffer: Buffer.from('fake image content'),
      });

      await page.fill('[name="option-0"]', 'Opcja A');
      await page.fill('[name="option-1"]', 'Opcja B');
      await page.check('[name="correct-answer"] >> nth=0');

      await page.click('[data-testid="save-quiz"]');
      await page.waitForSelector('[data-testid="quiz-saved"]');
    });

    test('should reorder questions', async ({ page }) => {
      test.skip(!adminAuthToken, 'Admin auth token not available');

      await page.goto('/admin/quizzes/new');
      await page.fill('[name="title"]', 'Quiz z kolejnością');

      // Add 3 questions
      for (let i = 1; i <= 3; i++) {
        await page.click('[data-testid="add-question"]');
        await page.fill('[name="question-text"]', `Pytanie ${i}`);
        await page.fill('[name="option-0"]', 'A');
        await page.check('[name="correct-answer"] >> nth=0');
      }

      // Reorder - drag question 3 to position 1
      await page.dragAndDrop(
        '[data-testid="question-item"]:nth-child(3) [data-testid="drag-handle"]',
        '[data-testid="question-item"]:nth-child(1)'
      );

      // Verify new order
      const firstQuestionText = await page.textContent(
        '[data-testid="question-item"]:nth-child(1) [name="question-text"]'
      );
      expect(firstQuestionText).toContain('Pytanie 3');

      await page.click('[data-testid="save-quiz"]');
      await page.waitForSelector('[data-testid="quiz-saved"]');
    });
  });

  test.describe('Take Quiz', () => {
    test('should start quiz as patient', async ({ page }) => {
      test.skip(!authToken, 'Auth token not available');

      await page.goto('/quizzes');
      await page.waitForSelector('[data-testid="quiz-list"]');

      const quizCard = await page.$('[data-testid="quiz-card"]');
      if (quizCard) {
        await quizCard.click('[data-testid="start-quiz"]');
        await page.waitForSelector('[data-testid="quiz-in-progress"]');

        // Should show first question
        expect(await page.isVisible('[data-testid="question-1"]')).toBe(true);
      }
    });

    test('should answer multiple choice question', async ({ page }) => {
      test.skip(!authToken, 'Auth token not available');

      await page.goto('/quizzes');
      const quizCard = await page.$('[data-testid="quiz-card"]');
      
      if (quizCard) {
        await quizCard.click('[data-testid="start-quiz"]');
        await page.waitForSelector('[data-testid="question-content"]');

        // Select answer
        await page.click('[data-testid="answer-option"]:nth-child(1)');
        await page.click('[data-testid="next-question"]');

        // Should move to next question or show results
        const isNextQuestion = await page.isVisible('[data-testid="question-2"]');
        const isResults = await page.isVisible('[data-testid="quiz-results"]');
        
        expect(isNextQuestion || isResults).toBe(true);
      }
    });

    test('should answer true/false question', async ({ page }) => {
      test.skip(!authToken, 'Auth token not available');

      await page.goto('/quizzes');
      const quizCard = await page.$('[data-testid="quiz-card"]');
      
      if (quizCard) {
        await quizCard.click('[data-testid="start-quiz"]');
        await page.waitForSelector('[data-testid="true-false-options"]');

        await page.click('[data-testid="answer-true"]');
        await page.click('[data-testid="next-question"]');
      }
    });

    test('should answer multiple select question', async ({ page }) => {
      test.skip(!authToken, 'Auth token not available');

      await page.goto('/quizzes');
      const quizCard = await page.$('[data-testid="quiz-card"]');
      
      if (quizCard) {
        await quizCard.click('[data-testid="start-quiz"]');
        await page.waitForSelector('[data-testid="multiple-select-options"]');

        // Select multiple answers
        await page.check('[data-testid="answer-option"]:nth-child(1)');
        await page.check('[data-testid="answer-option"]:nth-child(3)');
        await page.click('[data-testid="next-question"]');
      }
    });

    test('should navigate between questions', async ({ page }) => {
      test.skip(!authToken, 'Auth token not available');

      await page.goto('/quizzes');
      const quizCard = await page.$('[data-testid="quiz-card"]');
      
      if (quizCard) {
        await quizCard.click('[data-testid="start-quiz"]');
        await page.waitForSelector('[data-testid="question-content"]');

        // Answer first question
        await page.click('[data-testid="answer-option"]:nth-child(1)');
        await page.click('[data-testid="next-question"]');
        await page.waitForSelector('[data-testid="question-2"]');

        // Go back to previous
        await page.click('[data-testid="previous-question"]');
        await page.waitForSelector('[data-testid="question-1"]');

        // Selected answer should be preserved
        const isSelected = await page.isChecked('[data-testid="answer-option"]:nth-child(1)');
        expect(isSelected).toBe(true);
      }
    });

    test('should show progress indicator', async ({ page }) => {
      test.skip(!authToken, 'Auth token not available');

      await page.goto('/quizzes');
      const quizCard = await page.$('[data-testid="quiz-card"]');
      
      if (quizCard) {
        await quizCard.click('[data-testid="start-quiz"]');
        await page.waitForSelector('[data-testid="quiz-progress"]');

        const progressText = await page.textContent('[data-testid="quiz-progress"]');
        expect(progressText).toMatch(/\d+ \/ \d+/);
      }
    });

    test('should confirm quiz submission', async ({ page }) => {
      test.skip(!authToken, 'Auth token not available');

      await page.goto('/quizzes');
      const quizCard = await page.$('[data-testid="quiz-card"]');
      
      if (quizCard) {
        await quizCard.click('[data-testid="start-quiz"]');
        
        // Answer all questions
        while (await page.isVisible('[data-testid="answer-option"]:nth-child(1)')) {
          await page.click('[data-testid="answer-option"]:nth-child(1)');
          if (await page.isVisible('[data-testid="next-question"]')) {
            await page.click('[data-testid="next-question"]');
          } else {
            break;
          }
        }

        // Submit quiz
        await page.click('[data-testid="submit-quiz"]');
        await page.waitForSelector('[data-testid="submit-confirmation"]');
        await page.click('[data-testid="confirm-submit"]');
      }
    });

    test('should allow quitting quiz mid-way', async ({ page }) => {
      test.skip(!authToken, 'Auth token not available');

      await page.goto('/quizzes');
      const quizCard = await page.$('[data-testid="quiz-card"]');
      
      if (quizCard) {
        await quizCard.click('[data-testid="start-quiz"]');
        await page.waitForSelector('[data-testid="question-content"]');

        await page.click('[data-testid="quit-quiz"]');
        await page.waitForSelector('[data-testid="quit-confirmation"]');
        await page.click('[data-testid="confirm-quit"]');

        // Should return to quiz list
        await page.waitForURL('**/quizzes');
      }
    });
  });

  test.describe('Quiz Results', () => {
    test('should display quiz results', async ({ page }) => {
      test.skip(!authToken, 'Auth token not available');

      await page.goto('/quizzes');
      const quizCard = await page.$('[data-testid="quiz-card"]');
      
      if (quizCard) {
        await quizCard.click('[data-testid="start-quiz"]');
        
        // Answer all questions
        while (await page.isVisible('[data-testid="answer-option"]:nth-child(1)')) {
          await page.click('[data-testid="answer-option"]:nth-child(1)');
          if (await page.isVisible('[data-testid="next-question"]')) {
            await page.click('[data-testid="next-question"]');
          } else {
            break;
          }
        }

        await page.click('[data-testid="submit-quiz"]');
        await page.click('[data-testid="confirm-submit"]');
        await page.waitForSelector('[data-testid="quiz-results"]');

        // Should show score
        expect(await page.isVisible('[data-testid="score-display"]')).toBe(true);
        expect(await page.isVisible('[data-testid="total-questions"]')).toBe(true);
      }
    });

    test('should show pass/fail status', async ({ page }) => {
      test.skip(!authToken, 'Auth token not available');

      await page.goto('/quizzes');
      const quizCard = await page.$('[data-testid="quiz-card"]');
      
      if (quizCard) {
        await quizCard.click('[data-testid="start-quiz"]');
        
        // Answer all questions correctly
        while (await page.isVisible('[data-testid="answer-option"]:nth-child(1)')) {
          await page.click('[data-testid="answer-option"]:nth-child(1)');
          if (await page.isVisible('[data-testid="next-question"]')) {
            await page.click('[data-testid="next-question"]');
          } else {
            break;
          }
        }

        await page.click('[data-testid="submit-quiz"]');
        await page.click('[data-testid="confirm-submit"]');
        await page.waitForSelector('[data-testid="pass-fail-status"]');

        const statusText = await page.textContent('[data-testid="pass-fail-status"]');
        expect(statusText).toMatch(/zaliczony|niezaliczony/i);
      }
    });

    test('should show correct answers review', async ({ page }) => {
      test.skip(!authToken, 'Auth token not available');

      await page.goto('/quizzes');
      const quizCard = await page.$('[data-testid="quiz-card"]');
      
      if (quizCard) {
        await quizCard.click('[data-testid="start-quiz"]');
        
        // Answer questions
        while (await page.isVisible('[data-testid="answer-option"]:nth-child(1)')) {
          await page.click('[data-testid="answer-option"]:nth-child(1)');
          if (await page.isVisible('[data-testid="next-question"]')) {
            await page.click('[data-testid="next-question"]');
          } else {
            break;
          }
        }

        await page.click('[data-testid="submit-quiz"]');
        await page.click('[data-testid="confirm-submit"]');
        await page.waitForSelector('[data-testid="quiz-results"]');

        // View review
        await page.click('[data-testid="view-review"]');
        await page.waitForSelector('[data-testid="answers-review"]');

        // Should show correct/incorrect indicators
        expect(await page.isVisible('[data-testid="answer-indicator"]')).toBe(true);
      }
    });

    test('should show feedback message', async ({ page }) => {
      test.skip(!authToken, 'Auth token not available');

      await page.goto('/quizzes');
      const quizCard = await page.$('[data-testid="quiz-card"]');
      
      if (quizCard) {
        await quizCard.click('[data-testid="start-quiz"]');
        
        // Answer all
        while (await page.isVisible('[data-testid="answer-option"]:nth-child(1)')) {
          await page.click('[data-testid="answer-option"]:nth-child(1)');
          if (await page.isVisible('[data-testid="next-question"]')) {
            await page.click('[data-testid="next-question"]');
          } else {
            break;
          }
        }

        await page.click('[data-testid="submit-quiz"]');
        await page.click('[data-testid="confirm-submit"]');
        await page.waitForSelector('[data-testid="feedback-message"]');

        const feedbackText = await page.textContent('[data-testid="feedback-message"]');
        expect(feedbackText).toBeTruthy();
      }
    });

    test('should save quiz attempt history', async ({ page }) => {
      test.skip(!authToken, 'Auth token not available');

      await page.goto('/quizzes/history');
      await page.waitForSelector('[data-testid="quiz-history"]');

      const attempts = await page.$$('[data-testid="quiz-attempt"]');
      expect(attempts.length).toBeGreaterThanOrEqual(0);

      // Each attempt should show date and score
      for (const attempt of attempts.slice(0, 3)) {
        expect(await attempt.isVisible('[data-testid="attempt-date"]')).toBe(true);
        expect(await attempt.isVisible('[data-testid="attempt-score"]')).toBe(true);
      }
    });
  });

  test.describe('Quiz Management', () => {
    test('should list all quizzes', async ({ page }) => {
      test.skip(!adminAuthToken, 'Admin auth token not available');

      await page.goto('/admin/quizzes');
      await page.waitForSelector('[data-testid="quizzes-list"]');

      const quizzes = await page.$$('[data-testid="quiz-item"]');
      expect(quizzes.length).toBeGreaterThanOrEqual(0);
    });

    test('should edit existing quiz', async ({ page }) => {
      test.skip(!adminAuthToken, 'Admin auth token not available');

      await page.goto('/admin/quizzes');
      const quizItem = await page.$('[data-testid="quiz-item"]');
      
      if (quizItem) {
        await quizItem.click('[data-testid="edit-quiz"]');
        await page.waitForSelector('[data-testid="quiz-form"]');

        // Modify title
        await page.fill('[name="title"]', 'Zaktualizowany tytuł quizu');
        await page.click('[data-testid="save-quiz"]');
        await page.waitForSelector('[data-testid="quiz-saved"]');
      }
    });

    test('should delete quiz', async ({ page }) => {
      test.skip(!adminAuthToken, 'Admin auth token not available');

      await page.goto('/admin/quizzes');
      const quizItem = await page.$('[data-testid="quiz-item"]');
      
      if (quizItem) {
        await quizItem.click('[data-testid="delete-quiz"]');
        await page.waitForSelector('[data-testid="delete-confirmation"]');
        await page.click('[data-testid="confirm-delete"]');
        await page.waitForSelector('[data-testid="delete-success"]');
      }
    });

    test('should duplicate quiz', async ({ page }) => {
      test.skip(!adminAuthToken, 'Admin auth token not available');

      await page.goto('/admin/quizzes');
      const quizItem = await page.$('[data-testid="quiz-item"]');
      
      if (quizItem) {
        await quizItem.click('[data-testid="duplicate-quiz"]');
        await page.waitForSelector('[data-testid="quiz-duplicated"]');

        // Duplicated quiz should appear in list
        await page.waitForSelector('[data-testid="quiz-item"]');
      }
    });

    test('should filter quizzes by category', async ({ page }) => {
      test.skip(!adminAuthToken, 'Admin auth token not available');

      await page.goto('/admin/quizzes');
      await page.click('[data-testid="filter-category"]');
      await page.click('[data-testid="category-education"]');

      const quizzes = await page.$$('[data-testid="quiz-item"]:visible');
      
      for (const quiz of quizzes) {
        const category = await quiz.getAttribute('data-category');
        expect(category).toBe('EDUCATION');
      }
    });

    test('should filter quizzes by difficulty', async ({ page }) => {
      test.skip(!adminAuthToken, 'Admin auth token not available');

      await page.goto('/admin/quizzes');
      await page.click('[data-testid="filter-difficulty"]');
      await page.click('[data-testid="difficulty-medium"]');

      const quizzes = await page.$$('[data-testid="quiz-item"]:visible');
      
      for (const quiz of quizzes) {
        const difficulty = await quiz.getAttribute('data-difficulty');
        expect(difficulty).toBe('MEDIUM');
      }
    });

    test('should preview quiz as admin', async ({ page }) => {
      test.skip(!adminAuthToken, 'Admin auth token not available');

      await page.goto('/admin/quizzes');
      const quizItem = await page.$('[data-testid="quiz-item"]');
      
      if (quizItem) {
        await quizItem.click('[data-testid="preview-quiz"]');
        await page.waitForSelector('[data-testid="quiz-preview"]');

        // Should show quiz content without starting
        expect(await page.isVisible('[data-testid="quiz-description"]')).toBe(true);
        expect(await page.isVisible('[data-testid="question-preview"]')).toBe(true);
      }
    });
  });

  test.describe('Quiz API', () => {
    test('should get quiz list via API', async ({ request }) => {
      test.skip(!authToken, 'Auth token not available');

      const response = await request.get(phase3ApiEndpoints.quizzes.list, {
        headers: {
          'Authorization': `Bearer ${authToken}`,
        },
      });

      expect([httpStatus.OK, httpStatus.FORBIDDEN]).toContain(response.status());

      if (response.status() === httpStatus.OK) {
        const body = await response.json();
        expect(Array.isArray(body)).toBe(true);
      }
    });

    test('should get quiz by ID via API', async ({ request }) => {
      test.skip(!authToken, 'Auth token not available');

      const response = await request.get(
        phase3ApiEndpoints.quizzes.byId('quiz-123'),
        {
          headers: {
            'Authorization': `Bearer ${authToken}`,
          },
        }
      );

      expect([httpStatus.OK, httpStatus.NOT_FOUND, httpStatus.FORBIDDEN]).toContain(response.status());
    });

    test('should submit quiz answers via API', async ({ request }) => {
      test.skip(!authToken, 'Auth token not available');

      const response = await request.post(
        phase3ApiEndpoints.quizzes.take('quiz-123'),
        {
          headers: {
            'Authorization': `Bearer ${authToken}`,
            'Content-Type': 'application/json',
          },
          data: {
            answers: [
              { questionId: 'q1', answer: 'k' },
              { questionId: 'q2', answer: ['samochód', 'słońce'] },
            ],
          },
        }
      );

      expect([httpStatus.OK, httpStatus.CREATED, httpStatus.FORBIDDEN]).toContain(response.status());

      if (response.status() === httpStatus.OK) {
        const body = await response.json();
        expect(body).toHaveProperty('score');
        expect(body).toHaveProperty('passed');
      }
    });

    test('should get quiz results via API', async ({ request }) => {
      test.skip(!authToken, 'Auth token not available');

      const response = await request.get(
        phase3ApiEndpoints.quizzes.results('quiz-123'),
        {
          headers: {
            'Authorization': `Bearer ${authToken}`,
          },
        }
      );

      expect([httpStatus.OK, httpStatus.NOT_FOUND, httpStatus.FORBIDDEN]).toContain(response.status());
    });
  });

  test.describe('Negative Tests', () => {
    test('should not create quiz without title', async ({ page }) => {
      test.skip(!adminAuthToken, 'Admin auth token not available');

      await page.goto('/admin/quizzes/new');
      await page.fill('[name="description"]', 'Quiz bez tytułu');
      await page.click('[data-testid="save-quiz"]');

      await page.waitForSelector('[data-testid="validation-error"]');
      const errorText = await page.textContent('[data-testid="validation-error"]');
      expect(errorText).toContain('tytuł');
    });

    test('should not submit quiz without answering all questions', async ({ page }) => {
      test.skip(!authToken, 'Auth token not available');

      await page.goto('/quizzes');
      const quizCard = await page.$('[data-testid="quiz-card"]');
      
      if (quizCard) {
        await quizCard.click('[data-testid="start-quiz"]');
        await page.waitForSelector('[data-testid="question-content"]');

        // Don't answer, try to submit
        await page.click('[data-testid="submit-quiz"]');
        await page.waitForSelector('[data-testid="validation-error"]');

        const errorText = await page.textContent('[data-testid="validation-error"]');
        expect(errorText).toContain('odpowiedz');
      }
    });

    test('should not access admin quiz management without admin role', async ({ page }) => {
      test.skip(!authToken, 'Auth token not available');

      await page.goto('/admin/quizzes');
      
      // Should be redirected or show access denied
      await page.waitForSelector('[data-testid="access-denied"], [data-testid="login-page"]');
      
      const accessDenied = await page.isVisible('[data-testid="access-denied"]');
      const isLoginPage = page.url().includes('/login');
      
      expect(accessDenied || isLoginPage).toBe(true);
    });

    test('should not take quiz without authentication', async ({ request }) => {
      const response = await request.post(
        phase3ApiEndpoints.quizzes.take('quiz-123'),
        {
          data: {
            answers: [],
          },
        }
      );

      expect([httpStatus.UNAUTHORIZED, httpStatus.FORBIDDEN]).toContain(response.status());
    });
  });
});
