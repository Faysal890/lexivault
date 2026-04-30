import { generateExampleSentence, type GeneratedExample } from "@/lib/ai";
import { DependencyError, RateLimitedError } from "../errors";

export const aiService = {
  async exampleSentence(
    word: string,
    meaning: string,
    nativeLanguage: string,
    currentSentence?: string
  ): Promise<GeneratedExample> {
    try {
      return await generateExampleSentence(word, meaning, nativeLanguage, currentSentence);
    } catch (err) {
      if (err instanceof Error && err.message === "QUOTA_EXCEEDED") {
        throw new RateLimitedError("AI quota exceeded");
      }
      throw new DependencyError("AI generation failed");
    }
  },
};
