import { requireUserId } from "@/lib/server/auth";
import { submitQuizSchema } from "@/lib/server/dto/quiz";
import { created, handle } from "@/lib/server/http";
import { quizService } from "@/lib/server/services/quiz.service";

export const POST = handle(async (req: Request) => {
  const userId = await requireUserId();
  const input = submitQuizSchema.parse(await req.json());
  const result = await quizService.submit(userId, input);
  return created(result);
});
