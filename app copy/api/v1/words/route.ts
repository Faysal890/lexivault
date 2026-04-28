import { requireUserId } from "@/lib/server/auth";
import { listWordsQuerySchema, createWordSchema } from "@/lib/server/dto/word";
import { created, handle, ok } from "@/lib/server/http";
import { wordService } from "@/lib/server/services/word.service";

export const GET = handle(async (req: Request) => {
  const userId = await requireUserId();
  const { searchParams } = new URL(req.url);
  const query = listWordsQuerySchema.parse({
    q: searchParams.get("q") ?? undefined,
    tag: searchParams.get("tag") ?? undefined,
  });
  const words = await wordService.list(userId, query);
  return ok(words);
});

export const POST = handle(async (req: Request) => {
  const userId = await requireUserId();
  const input = createWordSchema.parse(await req.json());
  const word = await wordService.create(userId, input);
  return created(word);
});
