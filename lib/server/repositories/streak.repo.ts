import { prisma } from "@/lib/prisma";

export const streakRepo = {
  async findByUserId(userId: string) {
    return prisma.streak.findUnique({ where: { userId } });
  },

  async update(userId: string, data: { currentDays?: number; longestDays?: number; lastActivity?: Date; totalXP?: number; level?: number }) {
    return prisma.streak.update({ where: { userId }, data });
  },
};
