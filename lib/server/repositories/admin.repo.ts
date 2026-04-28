import { Role } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import type { AdminListUsersQuery, AdminListWordsQuery } from "../dto/admin";

export const adminRepo = {
  async getPlatformStats() {
    const now = new Date();
    const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const weekStart = new Date(todayStart.getTime() - 6 * 86_400_000);

    const [totalUsers, newUsersToday, newUsersThisWeek, totalWords, totalQuizzes, activeToday] =
      await Promise.all([
        prisma.user.count(),
        prisma.user.count({ where: { createdAt: { gte: todayStart } } }),
        prisma.user.count({ where: { createdAt: { gte: weekStart } } }),
        prisma.word.count(),
        prisma.quiz.count(),
        prisma.user.count({
          where: {
            OR: [
              { words: { some: { createdAt: { gte: todayStart } } } },
              { quizzes: { some: { createdAt: { gte: todayStart } } } },
            ],
          },
        }),
      ]);

    return { totalUsers, newUsersToday, newUsersThisWeek, totalWords, totalQuizzes, activeToday };
  },

  async listUsers(query: AdminListUsersQuery) {
    const where = {
      ...(query.search
        ? {
            OR: [
              { name: { contains: query.search, mode: "insensitive" as const } },
              { email: { contains: query.search, mode: "insensitive" as const } },
            ],
          }
        : {}),
      ...(query.role ? { role: query.role as Role } : {}),
    };

    const [users, total] = await Promise.all([
      prisma.user.findMany({
        where,
        orderBy: { createdAt: "desc" },
        skip: (query.page - 1) * query.limit,
        take: query.limit,
        select: {
          id: true,
          name: true,
          email: true,
          role: true,
          emailVerified: true,
          createdAt: true,
          _count: { select: { words: true, quizzes: true } },
        },
      }),
      prisma.user.count({ where }),
    ]);

    return { users, total };
  },

  async getUserById(id: string) {
    return prisma.user.findUnique({
      where: { id },
      include: {
        streak: true,
        words: {
          orderBy: { createdAt: "desc" },
          take: 10,
          select: { id: true, englishWord: true, meaning: true, createdAt: true },
        },
        quizzes: {
          orderBy: { createdAt: "desc" },
          take: 10,
          select: { id: true, score: true, totalQuestions: true, createdAt: true },
        },
        _count: { select: { words: true, quizzes: true } },
      },
    });
  },

  async updateUserRole(id: string, role: Role) {
    return prisma.user.update({ where: { id }, data: { role } });
  },

  async deleteUser(id: string) {
    await prisma.user.delete({ where: { id } });
  },

  async listAllWords(query: AdminListWordsQuery) {
    const where = {
      ...(query.search ? { englishWord: { contains: query.search, mode: "insensitive" as const } } : {}),
      ...(query.userId ? { userId: query.userId } : {}),
    };

    const [words, total] = await Promise.all([
      prisma.word.findMany({
        where,
        orderBy: { createdAt: "desc" },
        skip: (query.page - 1) * query.limit,
        take: query.limit,
        include: { user: { select: { id: true, name: true, email: true } } },
      }),
      prisma.word.count({ where }),
    ]);

    return { words, total };
  },

  async findWordById(id: string) {
    return prisma.word.findUnique({ where: { id } });
  },

  async deleteWord(id: string) {
    await prisma.word.delete({ where: { id } });
  },
};
