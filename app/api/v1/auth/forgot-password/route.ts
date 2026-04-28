import { forgotPasswordSchema } from "@/lib/server/dto/auth";
import { handle, ok } from "@/lib/server/http";
import { authService } from "@/lib/server/services/auth.service";

export const POST = handle(async (req: Request) => {
  const input = forgotPasswordSchema.parse(await req.json());
  const result = await authService.forgotPassword(input);
  return ok(result);
});
