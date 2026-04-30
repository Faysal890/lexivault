import { z } from "zod";

export const QUIZ_TYPES = ["mixed", "multiple_choice", "fill_blank", "reverse"] as const;
export type QuizType = (typeof QUIZ_TYPES)[number];

export const QUESTION_TYPES = ["multiple_choice", "fill_blank", "reverse"] as const;
export type QuestionType = (typeof QUESTION_TYPES)[number];

export const generateQuizQuerySchema = z.object({
  type: z.enum(QUIZ_TYPES).default("mixed"),
  size: z.coerce.number().int().min(5).max(20).default(10),
});
export type GenerateQuizQuery = z.infer<typeof generateQuizQuerySchema>;

// Mirror the upper bound on generateQuizQuerySchema.size — keep submissions in line with
// what the server hands out. Cap individual answer/option lengths so a malicious client
// can't ship a multi-megabyte payload through the JSON parser.
const QUIZ_MAX_QUESTIONS = 50;
const QUIZ_ANSWER_MAX = 500;

export const submitQuizSchema = z.object({
  quizType: z.enum(QUIZ_TYPES).default("mixed"),
  score: z.number().int().min(0).max(QUIZ_MAX_QUESTIONS),
  totalQuestions: z.number().int().min(1).max(QUIZ_MAX_QUESTIONS),
  timeTaken: z.number().int().min(0).max(86_400).optional(), // 24h sanity cap
  questions: z
    .array(
      z.object({
        wordId: z.string().min(1).max(64),
        questionType: z.enum(QUESTION_TYPES),
        userAnswer: z.string().max(QUIZ_ANSWER_MAX).optional().default(""),
        correctAnswer: z.string().max(QUIZ_ANSWER_MAX),
        isCorrect: z.boolean(),
        options: z.array(z.string().max(QUIZ_ANSWER_MAX)).max(10).optional(),
      })
    )
    .min(1)
    .max(QUIZ_MAX_QUESTIONS),
});
export type SubmitQuizInput = z.infer<typeof submitQuizSchema>;

export interface QuizQuestionDto {
  wordId: string;
  word: string;
  meaning: string;
  questionType: QuestionType;
  question: string;
  options?: string[];
  correctAnswer: string;
}

export interface QuizSubmitResultDto {
  quizId: string;
  xpGained: number;
  coinsEarned: number;
  newCoinBalance?: number;
}
