import { Role } from "@prisma/client";
import { ForbiddenError, NotFoundError } from "../errors";
import { adminRepo } from "../repositories/admin.repo";
import type {
  AdminListUsersQuery,
  AdminListWordsQuery,
  AdminUpdateRoleInput,
  AdminUserRowDto,
  AdminUserDetailDto,
  AdminWordRowDto,
  AdminPlatformStatsDto,
  PaginatedDto,
} from "../dto/admin";

export const adminService = {
  async getStats(): Promise<AdminPlatformStatsDto> {
    return adminRepo.getPlatformStats();
  },

  async listUsers(query: AdminListUsersQuery): Promise<PaginatedDto<AdminUserRowDto>> {
    const { users, total } = await adminRepo.listUsers(query);
    const items: AdminUserRowDto[] = users.map((u) => ({
      id: u.id,
      name: u.name,
      email: u.email,
      role: u.role,
      emailVerified: u.emailVerified,
      createdAt: u.createdAt,
      wordCount: u._count.words,
      quizCount: u._count.quizzes,
      coins: u.coins,
    }));
    return {
      items,
      total,
      page: query.page,
      limit: query.limit,
      totalPages: Math.ceil(total / query.limit),
    };
  },

  async getUserDetail(userId: string): Promise<AdminUserDetailDto> {
    const user = await adminRepo.getUserById(userId);
    if (!user) throw new NotFoundError("User not found");
    return {
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
      nativeLanguage: user.nativeLanguage,
      dailyGoal: user.dailyGoal,
      emailVerified: user.emailVerified,
      createdAt: user.createdAt,
      wordCount: user._count.words,
      quizCount: user._count.quizzes,
      streak: user.streak
        ? {
            currentDays: user.streak.currentDays,
            longestDays: user.streak.longestDays,
            totalXP: user.streak.totalXP,
            level: user.streak.level,
          }
        : null,
      recentWords: user.words,
      recentQuizzes: user.quizzes,
    };
  },

  async updateRole(adminId: string, targetUserId: string, input: AdminUpdateRoleInput) {
    if (adminId === targetUserId) throw new ForbiddenError("Cannot change your own role");
    const target = await adminRepo.getUserById(targetUserId);
    if (!target) throw new NotFoundError("User not found");
    return adminRepo.updateUserRole(targetUserId, input.role as Role);
  },

  async deleteUser(adminId: string, targetUserId: string) {
    if (adminId === targetUserId) throw new ForbiddenError("Cannot delete your own account");
    const target = await adminRepo.getUserById(targetUserId);
    if (!target) throw new NotFoundError("User not found");
    await adminRepo.deleteUser(targetUserId);
  },

  async listWords(query: AdminListWordsQuery): Promise<PaginatedDto<AdminWordRowDto>> {
    const { words, total } = await adminRepo.listAllWords(query);
    const items: AdminWordRowDto[] = words.map((w) => ({
      id: w.id,
      englishWord: w.englishWord,
      meaning: w.meaning,
      difficultyLevel: w.difficultyLevel,
      tags: w.tags,
      createdAt: w.createdAt,
      userId: w.user.id,
      userName: w.user.name,
      userEmail: w.user.email,
    }));
    return {
      items,
      total,
      page: query.page,
      limit: query.limit,
      totalPages: Math.ceil(total / query.limit),
    };
  },

  async deleteWord(wordId: string) {
    const existing = await adminRepo.findWordById(wordId);
    if (!existing) throw new NotFoundError("Word not found");
    await adminRepo.deleteWord(wordId);
  },
};
