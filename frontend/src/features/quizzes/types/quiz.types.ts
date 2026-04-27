/**
 * Quiz types for the quizzes feature
 */

export type QuestionType = 'SINGLE_CHOICE' | 'MULTI_CHOICE' | 'TRUE_FALSE';

export interface QuizAnswer {
  id: string;
  question_id: string;
  order_index: number;
  answer: string;
  correct: boolean;
  explanation?: string;
  created_at: string;
  updated_at: string;
}

export interface QuizQuestion {
  id: string;
  quiz_id: string;
  order_index: number;
  question: string;
  type: QuestionType;
  points: number;
  explanation?: string;
  answers: QuizAnswer[];
  created_at: string;
  updated_at: string;
}

export interface Quiz {
  id: string;
  title: string;
  description?: string;
  project_id: string;
  pass_threshold: number;
  time_limit_seconds?: number;
  active: boolean;
  created_by: string;
  questions: QuizQuestion[];
  max_score: number;
  created_at: string;
  updated_at: string;
}

export interface QuizAttempt {
  id: string;
  quiz_id: string;
  quiz_title: string;
  patient_id: string;
  patient_name: string;
  started_at: string;
  completed_at?: string;
  score: number;
  max_score: number;
  percentage: number;
  passed: boolean;
  time_spent_seconds?: number;
  answer_selections?: QuizAnswerSelection[];
  created_at: string;
  updated_at: string;
}

export interface QuizAnswerSelection {
  id: string;
  question_id: string;
  question_text: string;
  selected_answer_ids: string[];
  is_correct: boolean;
  points_earned: number;
  correct_answers: QuizAnswer[];
  created_at: string;
}

export interface QuizFormData {
  title: string;
  description?: string;
  project_id: string;
  pass_threshold: number;
  time_limit_seconds?: number;
  active?: boolean;
  questions?: QuizQuestionFormData[];
}

export interface QuizQuestionFormData {
  order_index: number;
  question: string;
  type: QuestionType;
  points: number;
  explanation?: string;
  answers?: QuizAnswerFormData[];
}

export interface QuizAnswerFormData {
  order_index: number;
  answer: string;
  correct: boolean;
  explanation?: string;
}

export interface SubmitQuizAnswers {
  quiz_id: string;
  patient_id: string;
  answers: {
    question_id: string;
    selected_answer_ids: string[];
  }[];
}
