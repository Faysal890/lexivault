import { prisma } from "@/lib/prisma";
import type { CoinTransactionType } from "@prisma/client";

export const coinRepo = {
  async getBalance(userId: string) {
    const user = await prisma.user.findUnique({ where: { id: userId }, select: { coins: true } });
    return user?.coins ?? 0;
  },

  async addCoins(
    userId: string,
    amount: number,
    type: CoinTransactionType,
    description: string,
    lsOrderId?: string
  ) {
    const [, user] = await prisma.$transaction([
      prisma.coinTransaction.create({
        data: { userId, amount, type, description, lsOrderId },
      }),
      prisma.user.update({
        where: { id: userId },
        data: { coins: { increment: amount } },
        select: { coins: true },
      }),
    ]);
    return user.coins;
  },

  async deductCoins(userId: string, amount: number, description: string) {
    // Atomic check-and-decrement: updateMany only succeeds when coins >= amount.
    // Prevents a TOCTOU race where two concurrent requests could both pass a
    // findUnique balance check and overdraw the account into negative coins.
    return prisma.$transaction(async (tx) => {
      const result = await tx.user.updateMany({
        where: { id: userId, coins: { gte: amount } },
        data: { coins: { decrement: amount } },
      });
      if (result.count === 0) return null;

      await tx.coinTransaction.create({
        data: { userId, amount: -amount, type: "GENERATION", description },
      });
      const updated = await tx.user.findUnique({
        where: { id: userId },
        select: { coins: true },
      });
      return updated?.coins ?? null;
    });
  },

  async setCoins(
    userId: string,
    targetAmount: number,
    description: string
  ) {
    const user = await prisma.user.findUnique({ where: { id: userId }, select: { coins: true } });
    const current = user?.coins ?? 0;
    const delta = targetAmount - current;

    await prisma.$transaction([
      prisma.coinTransaction.create({
        data: { userId, amount: delta, type: "ADMIN_GRANT", description },
      }),
      prisma.user.update({
        where: { id: userId },
        data: { coins: targetAmount },
      }),
    ]);
    return targetAmount;
  },

  async getTransactions(userId: string, limit = 20) {
    return prisma.coinTransaction.findMany({
      where: { userId },
      orderBy: { createdAt: "desc" },
      take: limit,
    });
  },
};
