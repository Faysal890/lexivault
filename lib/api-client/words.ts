import { apiClient } from "./client";
import type { CreateWordInput, UpdateWordInput, WordWithStatsDto } from "@/lib/server/dto/word";

export const wordsApi = {
  list: (params?: { q?: string; tag?: string }) =>
    apiClient.get<WordWithStatsDto[]>("/words", { query: params }),

  get: (id: string) => apiClient.get<WordWithStatsDto>(`/words/${id}`),

  create: (input: CreateWordInput) => apiClient.post<WordWithStatsDto>("/words", input),

  update: (id: string, input: UpdateWordInput) =>
    apiClient.put<WordWithStatsDto>(`/words/${id}`, input),

  remove: (id: string) => apiClient.delete(`/words/${id}`),

  generateExample: (id: string) =>
    apiClient.post<{ generated: boolean; sentence?: string }>(`/words/${id}/generate-example`),
};
