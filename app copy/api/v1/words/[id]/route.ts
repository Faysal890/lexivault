import { requireUserId } from "@/lib/server/auth";
import { updateWordSchema } from "@/lib/server/dto/word";
import { handle, noContent, ok } from "@/lib/server/http";
import { wordService } from "@/lib/server/services/word.service";

export const GET = handle(async (_req: Request, ctx: { params: { id: string } }) => {
  const userId = await requireUserId();
  const word = await wordService.get(userId, ctx.params.id);
  return ok(word);
});

export const PUT = handle(async (req: Request, ctx: { params: { id: string } }) => {
  const userId = await requireUserId();
  const input = updateWordSchema.parse(await req.json());
  const word = await wordService.update(userId, ctx.params.id, input);
  return ok(word);
});

export const DELETE = handle(async (_req: Request, ctx: { params: { id: string } }) => {
  const userId = await requireUserId();
  await wordService.remove(userId, ctx.params.id);
  return noContent();
});
