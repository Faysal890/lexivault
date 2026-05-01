import { requireSessionUserId } from "@/lib/server/auth";
import { corsHandle, noContent } from "@/lib/server/http";
import { apiKeyService } from "@/lib/server/services/apiKey.service";

export const DELETE = corsHandle(async (_req: Request, ctx: { params: Promise<{ id: string }> }) => {
  const userId = await requireSessionUserId();
  const { id } = await ctx.params;
  await apiKeyService.revoke(id, userId);
  return noContent();
});

export { corsOptions as OPTIONS } from "@/lib/server/http";
