import { prisma } from "@/lib/prisma";

export const statsRepo = {
  async listWordStatsForUser(userId: string) {
    return prisma.wordStats.findMany({
      where: { word: { userId } },
      include: { word: { select: { englishWord: true, meaning: true } } },
    });
  },

  async findManyByWordIds(wordIds: string[]) {
    return prisma.wordStats.findMany({ where: { wordId: { in: wordIds } } });
  },

  async update(
    wordId: string,
    data: { correctCount?: number | { increment: number }; wrongCount?: number | { increment: number }; lastReviewed?: Date; nextReview?: Date; easeFactor?: number }
  ) {
    return prisma.wordStats.update({ where: { wordId }, data });
  },
};
