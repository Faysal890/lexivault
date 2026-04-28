import { requireUserId } from "@/lib/server/auth";
import { handle, ok } from "@/lib/server/http";
import { statsService } from "@/lib/server/services/stats.service";

export const GET = handle(async () => {
  const userId = await requireUserId();
  const summary = await statsService.summary(userId);
  return ok(summary);
});
