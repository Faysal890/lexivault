import { z } from "zod";

export const adminListUsersQuerySchema = z.object({
  page:   z.coerce.number().int().min(1).max(10_000).default(1),
  limit:  z.coerce.number().int().min(1).max(100).default(20),
  search: z.string().max(100).optional().default(""),
  role:   z.enum(["USER", "ADMIN"]).optional(),
});
export type AdminListUsersQuery = z.infer<typeof adminListUsersQuerySchema>;

export const adminUpdateRoleSchema = z.object({
  role: z.enum(["USER", "ADMIN"]),
});
export type AdminUpdateRoleInput = z.infer<typeof adminUpdateRoleSchema>;

export const adminListWordsQuerySchema = z.object({
  page:   z.coerce.number().int().min(1).max(10_000).default(1),
  limit:  z.coerce.number().int().min(1).max(100).default(20),
  search: z.string().max(100).optional().default(""),
  userId: z.string().max(64).optional(),
});
export type AdminListWordsQuery = z.infer<typeof adminListWordsQuerySchema>;

export interface AdminUserRowDto {
  id: string;
  name: string;
  email: string;
  role: string;
  emailVerified: Date | null;
  createdAt: Date;
  wordCount: number;
  quizCount: number;
  coins: number;
}

export interface AdminUserDetailDto {
  id: string;
  name: string;
  email: string;
  role: string;
  nativeLanguage: string;
  dailyGoal: number;
  emailVerified: Date | null;
  createdAt: Date;
  wordCount: number;
  quizCount: number;
  streak: { currentDays: number; longestDays: number; totalXP: number; level: number } | null;
  recentWords: { id: string; englishWord: string; meaning: string; createdAt: Date }[];
  recentQuizzes: { id: string; score: number; totalQuestions: number; createdAt: Date }[];
}

export interface AdminWordRowDto {
  id: string;
  englishWord: string;
  meaning: string;
  difficultyLevel: number;
  tags: string;
  createdAt: Date;
  userId: string;
  userName: string;
  userEmail: string;
}

export interface AdminPlatformStatsDto {
  totalUsers: number;
  newUsersToday: number;
  newUsersThisWeek: number;
  totalWords: number;
  totalQuizzes: number;
  activeToday: number;
}

export interface PaginatedDto<T> {
  items: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}
