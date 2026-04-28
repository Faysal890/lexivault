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

export const submitQuizSchema = z.object({
  quizType: z.enum(QUIZ_TYPES).default("mixed"),
  score: z.number().int().min(0),
  totalQuestions: z.number().int().min(1),
  timeTaken: z.number().int().min(0).optional(),
  questions: z
    .array(
      z.object({
        wordId: z.string().min(1),
        questionType: z.enum(QUESTION_TYPES),
        userAnswer: z.string().optional().default(""),
        correctAnswer: z.string(),
        isCorrect: z.boolean(),
        options: z.array(z.string()).optional(),
      })
    )
    .min(1),
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
}
