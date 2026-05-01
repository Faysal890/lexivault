import { requireUserId } from "@/lib/server/auth";
import { updateWordSchema } from "@/lib/server/dto/word";
import { corsHandle, noContent, ok } from "@/lib/server/http";
import { wordService } from "@/lib/server/services/word.service";

export const GET = corsHandle(async (_req: Request, ctx: { params: Promise<{ id: string }> }) => {
  const userId = await requireUserId();
  const { id } = await ctx.params;
  const word = await wordService.get(userId, id);
  return ok(word);
});

export const PUT = corsHandle(async (req: Request, ctx: { params: Promise<{ id: string }> }) => {
  const userId = await requireUserId();
  const { id } = await ctx.params;
  const input = updateWordSchema.parse(await req.json());
  const word = await wordService.update(userId, id, input);
  return ok(word);
});

export const DELETE = corsHandle(async (_req: Request, ctx: { params: Promise<{ id: string }> }) => {
  const userId = await requireUserId();
  const { id } = await ctx.params;
  await wordService.remove(userId, id);
  return noContent();
});

export { corsOptions as OPTIONS } from "@/lib/server/http";
