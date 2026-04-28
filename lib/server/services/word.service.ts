import { NotFoundError } from "../errors";
import { wordRepo } from "../repositories/word.repo";
import { streakService } from "./streak.service";
import { aiService } from "./ai.service";
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

    return wordRepo.update(id, {
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
    await wordRepo.delete(id);
  },

  /**
   * Generate an example sentence for the given word via AI.
   * Returns { generated: false } when the word already has an example
   * (we never overwrite a user-provided sentence) or when AI returned nothing.
   */
  async generateExample(userId: string, id: string): Promise<{ generated: boolean; sentence?: string }> {
    const word = await wordRepo.getById(userId, id);
    if (!word) throw new NotFoundError("Word not found");
    if (word.exampleSentence) return { generated: false };

    const sentence = await aiService.exampleSentence(word.englishWord, word.meaning);
    if (!sentence) return { generated: false };

    await wordRepo.update(id, { exampleSentence: sentence });
    return { generated: true, sentence };
  },
};
