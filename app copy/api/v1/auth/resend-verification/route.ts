import { resendVerificationSchema } from "@/lib/server/dto/auth";
import { handle, ok } from "@/lib/server/http";
import { authService } from "@/lib/server/services/auth.service";

export const POST = handle(async (req: Request) => {
  const input = resendVerificationSchema.parse(await req.json());
  const result = await authService.resendVerification(input);
  return ok(result);
});
