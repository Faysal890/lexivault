import { requireSessionUserId } from "@/lib/server/auth";
import { createApiKeySchema } from "@/lib/server/dto/apiKey";
import { corsHandle, created, ok } from "@/lib/server/http";
import { rateLimit } from "@/lib/server/rate-limit";
import { apiKeyService } from "@/lib/server/services/apiKey.service";

export const GET = corsHandle(async () => {
  const userId = await requireSessionUserId();
  const keys = await apiKeyService.list(userId);
  return ok(keys);
});

export const POST = corsHandle(async (req: Request) => {
  const userId = await requireSessionUserId();
  await rateLimit(req, { name: "api-key-create", limit: 5, windowMs: 60_000, key: userId });
  const input = createApiKeySchema.parse(await req.json());
  const result = await apiKeyService.create(userId, input);
  return created(result);
});

export { corsOptions as OPTIONS } from "@/lib/server/http";
