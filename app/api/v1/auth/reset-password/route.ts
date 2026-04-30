import { resetPasswordSchema } from "@/lib/server/dto/auth";
import { handle, ok } from "@/lib/server/http";
import { rateLimit } from "@/lib/server/rate-limit";
import { authService } from "@/lib/server/services/auth.service";

export const POST = handle(async (req: Request) => {
  await rateLimit(req, { name: "reset-pw", limit: 10, windowMs: 60 * 60 * 1000 });
  const input = resetPasswordSchema.parse(await req.json());
  const result = await authService.resetPassword(input);
  return ok(result);
});
