import { z } from "zod";

export const createWordSchema = z.object({
  englishWord: z.string().min(1).max(100).trim(),
  meaning: z.string().min(1).max(500).trim(),
  exampleSentence: z.string().max(500).optional().default(""),
  difficultyLevel: z.number().int().min(1).max(3).default(1),
  tags: z.string().max(200).optional().default(""),
});
export type CreateWordInput = z.infer<typeof createWordSchema>;

export const updateWordSchema = z.object({
  englishWord: z.string().min(1).max(100).trim().optional(),
  meaning: z.string().min(1).max(500).trim().optional(),
  exampleSentence: z.string().max(500).optional(),
  difficultyLevel: z.number().int().min(1).max(3).optional(),
  tags: z.string().max(200).optional(),
});
export type UpdateWordInput = z.infer<typeof updateWordSchema>;

export const listWordsQuerySchema = z.object({
  q: z.string().optional().default(""),
  tag: z.string().optional().default(""),
});
export type ListWordsQuery = z.infer<typeof listWordsQuerySchema>;

export interface WordWithStatsDto {
  id: string;
  userId: string;
  englishWord: string;
  meaning: string;
  exampleSentence: string | null;
  difficultyLevel: number;
  tags: string;
  createdAt: Date;
  updatedAt: Date;
  wordStats: {
    correctCount: number;
    wrongCount: number;
    lastReviewed: Date | null;
    nextReview: Date | null;
    easeFactor: number;
  } | null;
}
