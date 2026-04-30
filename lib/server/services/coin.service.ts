import { coinRepo } from "../repositories/coin.repo";
import { InsufficientCoinsError } from "../errors";
import type { CoinTransactionType } from "@prisma/client";

export const coinService = {
  async getBalance(userId: string) {
    return { coins: await coinRepo.getBalance(userId) };
  },

  async addCoins(userId: string, amount: number, type: CoinTransactionType, description: string, stripeSessionId?: string) {
    return coinRepo.addCoins(userId, amount, type, description, stripeSessionId);
  },

  async deductCoins(userId: string, amount: number, description: string) {
    const remaining = await coinRepo.deductCoins(userId, amount, description);
    if (remaining === null) {
      throw new InsufficientCoinsError(
        `Not enough coins. You need ${amount} coins to generate a sentence.`
      );
    }
    return remaining;
  },

  async setCoins(userId: string, targetAmount: number, description: string) {
    return coinRepo.setCoins(userId, targetAmount, description);
  },

  async getTransactions(userId: string) {
    return coinRepo.getTransactions(userId);
  },
};
