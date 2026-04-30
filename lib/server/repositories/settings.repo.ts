import { prisma } from "@/lib/prisma";

export const settingsRepo = {
  async get() {
    return prisma.appSettings.upsert({
      where: { id: "singleton" },
      update: {},
      create: { id: "singleton" },
    });
  },

  async update(data: { newUserCoins?: number; generationCost?: number; dailyQuizCoins?: number }) {
    return prisma.appSettings.upsert({
      where: { id: "singleton" },
      update: data,
      create: { id: "singleton", ...data },
    });
  },
};
