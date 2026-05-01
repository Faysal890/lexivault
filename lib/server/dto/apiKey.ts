import { z } from "zod";

export const createApiKeySchema = z.object({
  name: z.string().min(1).max(60).trim(),
  expiresInDays: z.number().int().positive().max(365).optional(),
});
export type CreateApiKeyInput = z.infer<typeof createApiKeySchema>;

export interface ApiKeyDto {
  id: string;
  name: string;
  prefix: string;
  scopes: string;
  lastUsedAt: Date | null;
  expiresAt: Date | null;
  revokedAt: Date | null;
  createdAt: Date;
}

export interface ApiKeyCreatedDto extends ApiKeyDto {
  raw: string;
}
