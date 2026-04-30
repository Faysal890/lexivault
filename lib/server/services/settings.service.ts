import { settingsRepo } from "../repositories/settings.repo";

export const settingsService = {
  async getSettings() {
    return settingsRepo.get();
  },

  async updateSettings(data: { newUserCoins?: number; generationCost?: number; dailyQuizCoins?: number }) {
    return settingsRepo.update(data);
  },
};
