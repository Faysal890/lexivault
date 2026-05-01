import { prisma } from "@/lib/prisma";
import type { Prisma } from "@prisma/client";

export const wordRepo = {
  async list(userId: string, opts: { q?: string; tag?: string }) {
    return prisma.word.findMany({
      where: {
        userId,
        ...(opts.q ? { englishWord: { contains: opts.q } } : {}),
        ...(opts.tag ? { tags: { contains: opts.tag } } : {}),
      },
      orderBy: { createdAt: "desc" },
      include: { wordStats: true },
    });
  },

  async listAllTags(userId: string) {
    const rows = await prisma.word.findMany({
      where: { userId },
      select: { tags: true },
    });
    const set = new Set<string>();
    for (const r of rows) {
      for (const t of r.tags.split(",").map((s) => s.trim()).filter(Boolean)) {
        set.add(t);
      }
    }
    return Array.from(set);
  },

  async getById(userId: string, id: string) {
    return prisma.word.findFirst({
      where: { id, userId },
      include: { wordStats: true },
    });
  },

  async findRecent(userId: string, take = 100) {
    return prisma.word.findMany({
      where: { userId },
      include: { wordStats: true },
      orderBy: { createdAt: "desc" },
      take,
    });
  },

  // Look up specific words by id constrained to the owner — used by quiz submission anti-cheat.
  async findByIdsForUser(userId: string, ids: string[]) {
    if (ids.length === 0) return [];
    return prisma.word.findMany({
      where: { userId, id: { in: ids } },
      select: { id: true, englishWord: true, meaning: true },
    });
  },

  async findRecentMinimal(userId: string, take = 5) {
    return prisma.word.findMany({
      where: { userId },
      orderBy: { createdAt: "desc" },
      take,
      include: { wordStats: { select: { correctCount: true } } },
    });
  },

  async create(userId: string, data: Prisma.WordCreateWithoutUserInput) {
    return prisma.word.create({
      data: {
        ...data,
        user: { connect: { id: userId } },
        wordStats: { create: {} },
      },
    });
  },

  async update(userId: string, id: string, data: Prisma.WordUpdateInput) {
    return prisma.word.update({ where: { id, userId }, data });
  },

  async delete(userId: string, id: string) {
    await prisma.word.delete({ where: { id, userId } });
  },

  async count(userId: string) {
    return prisma.word.count({ where: { userId } });
  },

  async countMastered(userId: string) {
    return prisma.word.count({
      where: { userId, wordStats: { correctCount: { gte: 3 } } },
    });
  },

  async countCreatedBetween(userId: string, gte: Date, lt: Date) {
    return prisma.word.count({ where: { userId, createdAt: { gte, lt } } });
  },

  async findWeak(userId: string, take = 5) {
    return prisma.word.findMany({
      where: { userId, wordStats: { wrongCount: { gte: 2 } } },
      include: { wordStats: true },
      orderBy: { wordStats: { wrongCount: "desc" } },
      take,
    });
  },
};
