import { requireUserId } from "@/lib/server/auth";
import { handle, ok, parseJson } from "@/lib/server/http";
import { rateLimit } from "@/lib/server/rate-limit";
import { wordService } from "@/lib/server/services/word.service";
import { z } from "zod";

const bodySchema = z.object({
  regenerate: z.boolean().optional().default(false),
});

export const POST = handle(async (req: Request, ctx: { params: { id: string } }) => {
  const userId = await requireUserId();
  // Throttle AI calls per user — coins are the primary gate, but this caps cost spikes
  // from a compromised account or runaway client.
  await rateLimit(req, { name: "ai-gen", limit: 30, windowMs: 60 * 1000, key: userId });
  const { regenerate } = bodySchema.parse(await parseJson(req, (r) => r));
  const result = await wordService.generateExample(userId, ctx.params.id, regenerate);
  return ok(result);
});
