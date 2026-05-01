import { requireUserId } from "@/lib/server/auth";
import { corsHandle, ok } from "@/lib/server/http";
import { statsService } from "@/lib/server/services/stats.service";

export const GET = corsHandle(async () => {
  const userId = await requireUserId();
  const summary = await statsService.summary(userId);
  return ok(summary);
});

export { corsOptions as OPTIONS } from "@/lib/server/http";
