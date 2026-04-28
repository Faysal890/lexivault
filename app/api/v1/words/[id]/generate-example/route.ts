import { requireUserId } from "@/lib/server/auth";
import { handle, ok } from "@/lib/server/http";
import { wordService } from "@/lib/server/services/word.service";

export const POST = handle(async (_req: Request, ctx: { params: { id: string } }) => {
  const userId = await requireUserId();
  const result = await wordService.generateExample(userId, ctx.params.id);
  return ok(result);
});
