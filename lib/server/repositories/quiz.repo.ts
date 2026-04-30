import { prisma } from "@/lib/prisma";
import type { Prisma } from "@prisma/client";

export const quizRepo = {
  async create(data: Prisma.QuizCreateInput) {
    return prisma.quiz.create({ data });
  },

  async findLatest(userId: string) {
    return prisma.quiz.findFirst({ where: { userId }, orderBy: { createdAt: "desc" } });
  },

  async listRecent(userId: string, take = 20) {
    return prisma.quiz.findMany({
      where: { userId },
      orderBy: { createdAt: "desc" },
      take,
    });
  },

  async count(userId: string) {
    return prisma.quiz.count({ where: { userId } });
  },

  async aggregate(userId: string) {
    return prisma.quiz.aggregate({
      where: { userId },
      _avg: { score: true },
      _sum: { totalQuestions: true },
    });
  },

  async countQuizzesToday(userId: string, todayStart: Date) {
    return prisma.quiz.count({
      where: { userId, createdAt: { gte: todayStart } },
    });
  },
};
