/**
 * Quiz types for mobile
 */

export type QuestionType = 'SINGLE_CHOICE' | 'MULTI_CHOICE' | 'TRUE_FALSE';

export interface QuizAnswer {
  id: string;
  question_id: string;
  order_index: number;
  answer: string;
  correct: boolean;
  explanation?: string;
}

export interface QuizQuestion {
  id: string;
  quiz_id: string;
  order_index: number;
  question: string;
  type: QuestionType;
  points: number;
  answers: QuizAnswer[];
}

export interface Quiz {
  id: string;
  title: string;
  description?: string;
  project_id: string;
  pass_threshold: number;
  time_limit_seconds?: number;
  active: boolean;
  questions: QuizQuestion[];
  max_score: number;
}

export interface QuizAnswerSelection {
  id: string;
  question_id: string;
  question_text: string;
  points_earned: number;
  is_correct: boolean;
}

export interface QuizAttempt {
  id: string;
  quiz_id: string;
  quiz_title: string;
  patient_id: string;
  score: number;
  max_score: number;
  percentage: number;
  passed: boolean;
  time_spent_seconds?: number;
  completed_at?: string;
  answer_selections?: QuizAnswerSelection[];
}

export interface SubmitQuizAnswers {
  quiz_id: string;
  patient_id: string;
  answers: {
    question_id: string;
    selected_answer_ids: string[];
  }[];
}
