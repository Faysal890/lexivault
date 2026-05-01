import crypto from "crypto";
import { NotFoundError, UnauthorizedError } from "../errors";
import { apiKeyRepo } from "../repositories/apiKey.repo";
import type { ApiKeyCreatedDto, ApiKeyDto, CreateApiKeyInput } from "../dto/apiKey";

const KEY_REGEX = /^lx_[a-f0-9]{8}_[a-f0-9]{48}$/;

function sha256(input: string): string {
  return crypto.createHash("sha256").update(input).digest("hex");
}

export const apiKeyService = {
  /**
   * Validate a raw bearer key, return its userId+role on success.
   * Touches lastUsedAt as a fire-and-forget side effect.
   * Throws UnauthorizedError on any failure (revoked, expired, unknown, malformed).
   */
  async authenticate(rawKey: string): Promise<{ userId: string; role: string }> {
    if (!KEY_REGEX.test(rawKey)) throw new UnauthorizedError();
    const secret = rawKey.split("_")[2];
    const tokenHash = sha256(secret);
    const row = await apiKeyRepo.findByHash(tokenHash);
    if (!row) throw new UnauthorizedError();
    if (row.revokedAt) throw new UnauthorizedError("API key revoked");
    if (row.expiresAt && row.expiresAt < new Date()) {
      throw new UnauthorizedError("API key expired");
    }
    void apiKeyRepo.touchLastUsed(row.id).catch(() => {});
    return { userId: row.userId, role: row.user.role };
  },

  async create(userId: string, input: CreateApiKeyInput): Promise<ApiKeyCreatedDto> {
    const secret = crypto.randomBytes(24).toString("hex");
    const prefixSuffix = crypto.randomBytes(4).toString("hex");
    const prefix = `lx_${prefixSuffix}`;
    const raw = `${prefix}_${secret}`;
    const tokenHash = sha256(secret);
    const expiresAt = input.expiresInDays
      ? new Date(Date.now() + input.expiresInDays * 86_400_000)
      : null;

    const row = await apiKeyRepo.create({
      userId,
      name: input.name,
      prefix,
      tokenHash,
      expiresAt,
    });

    return { ...row, raw };
  },

  async list(userId: string): Promise<ApiKeyDto[]> {
    return apiKeyRepo.listForUser(userId);
  },

  async revoke(id: string, userId: string): Promise<void> {
    const row = await apiKeyRepo.findByIdForUser(id, userId);
    if (!row) throw new NotFoundError("API key not found");
    await apiKeyRepo.revokeByIdForUser(id, userId);
  },
};
