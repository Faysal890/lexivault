import { apiClient } from "./client";
import type { ApiKeyCreatedDto, ApiKeyDto, CreateApiKeyInput } from "@/lib/server/dto/apiKey";

export const apiKeysApi = {
  list: () => apiClient.get<ApiKeyDto[]>("/api-keys"),
  create: (input: CreateApiKeyInput) =>
    apiClient.post<ApiKeyCreatedDto>("/api-keys", input),
  revoke: (id: string) => apiClient.delete<void>(`/api-keys/${id}`),
};
