import { NotFoundError } from "../errors";
import { wordRepo } from "../repositories/word.repo";
import { userRepo } from "../repositories/user.repo";
import { streakService } from "./streak.service";
import { aiService } from "./ai.service";
import { coinService } from "./coin.service";
import { settingsService } from "./settings.service";
import type { CreateWordInput, UpdateWordInput, ListWordsQuery } from "../dto/word";

const XP_PER_WORD = 5;

export const wordService = {
  async list(userId: string, query: ListWordsQuery) {
    return wordRepo.list(userId, { q: query.q, tag: query.tag });
  },

  async listAllTags(userId: string) {
    return wordRepo.listAllTags(userId);
  },

  async get(userId: string, id: string) {
    const word = await wordRepo.getById(userId, id);
    if (!word) throw new NotFoundError("Word not found");
    return word;
  },

  async create(userId: string, input: CreateWordInput) {
    const word = await wordRepo.create(userId, {
      englishWord: input.englishWord,
      meaning: input.meaning,
      exampleSentence: input.exampleSentence ? input.exampleSentence : null,
      difficultyLevel: input.difficultyLevel,
      tags: input.tags ?? "",
    });
    await streakService.addXp(userId, XP_PER_WORD);
    return word;
  },

  async update(userId: string, id: string, input: UpdateWordInput) {
    const existing = await wordRepo.getById(userId, id);
    if (!existing) throw new NotFoundError("Word not found");

    return wordRepo.update(userId, id, {
      ...input,
      exampleSentence:
        input.exampleSentence === undefined
          ? undefined
          : input.exampleSentence === ""
            ? null
            : input.exampleSentence,
    });
  },

  async remove(userId: string, id: string) {
    const existing = await wordRepo.getById(userId, id);
    if (!existing) throw new NotFoundError("Word not found");
    await wordRepo.delete(userId, id);
  },

  async generateExample(
    userId: string,
    id: string,
    regenerate = false
  ): Promise<{ generated: boolean; sentence?: string; translation?: string; remainingCoins?: number }> {
    const [word, user, settings] = await Promise.all([
      wordRepo.getById(userId, id),
      userRepo.findById(userId),
      settingsService.getSettings(),
    ]);

    if (!word) throw new NotFoundError("Word not found");
    if (!regenerate && word.exampleSentence) return { generated: false };

    // Deduct coins first to enforce the spending limit (throws InsufficientCoinsError if low).
    const remainingCoins = await coinService.deductCoins(
      userId,
      settings.generationCost,
      `Generated sentence for "${word.englishWord}"`
    );

    let result: { sentence: string; translation: string };
    try {
      result = await aiService.exampleSentence(
        word.englishWord,
        word.meaning,
        user?.nativeLanguage ?? "Bengali",
        regenerate ? (word.exampleSentence ?? undefined) : undefined
      );
    } catch (err) {
      // AI threw — refund the user and re-throw so the route returns the right error.
      await coinService.addCoins(
        userId,
        settings.generationCost,
        "ADMIN_GRANT",
        `Refund: AI generation failed for "${word.englishWord}"`
      );
      throw err;
    }

    if (!result.sentence) {
      // AI returned empty — no usable output, refund the user.
      const refundedBalance = await coinService.addCoins(
        userId,
        settings.generationCost,
        "ADMIN_GRANT",
        `Refund: AI returned empty for "${word.englishWord}"`
      );
      return { generated: false, remainingCoins: refundedBalance };
    }

    await wordRepo.update(userId, id, {
      exampleSentence: result.sentence,
      exampleSentenceTranslation: result.translation || null,
    });

    return { generated: true, sentence: result.sentence, translation: result.translation, remainingCoins };
  },
};
