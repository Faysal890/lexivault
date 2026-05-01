import { requireUserId } from "@/lib/server/auth";
import { generateQuizQuerySchema } from "@/lib/server/dto/quiz";
import { corsHandle, ok } from "@/lib/server/http";
import { quizService } from "@/lib/server/services/quiz.service";

export const GET = corsHandle(async (req: Request) => {
  const userId = await requireUserId();
  const { searchParams } = new URL(req.url);
  const query = generateQuizQuerySchema.parse({
    type: searchParams.get("type") ?? undefined,
    size: searchParams.get("size") ?? undefined,
  });
  const questions = await quizService.generate(userId, query);
  return ok(questions);
});

export { corsOptions as OPTIONS } from "@/lib/server/http";
