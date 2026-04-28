import { generateExampleSentence } from "@/lib/ai";
import { DependencyError, RateLimitedError } from "../errors";

export const aiService = {
  /**
   * Returns the generated sentence, or "" if AI is unavailable / disabled.
   * Throws RateLimitedError if the upstream signaled quota exhaustion.
   */
  async exampleSentence(word: string, meaning: string): Promise<string> {
    try {
      return await generateExampleSentence(word, meaning);
    } catch (err) {
      if (err instanceof Error && err.message === "QUOTA_EXCEEDED") {
        throw new RateLimitedError("AI quota exceeded");
      }
      throw new DependencyError("AI generation failed");
    }
  },
};
