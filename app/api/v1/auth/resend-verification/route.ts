import { resendVerificationSchema } from "@/lib/server/dto/auth";
import { handle, ok } from "@/lib/server/http";
import { rateLimit } from "@/lib/server/rate-limit";
import { authService } from "@/lib/server/services/auth.service";

export const POST = handle(async (req: Request) => {
  const input = resendVerificationSchema.parse(await req.json());
  await rateLimit(req, { name: "resend-verify-ip", limit: 10, windowMs: 60 * 60 * 1000 });
  await rateLimit(req, { name: "resend-verify-email", limit: 3, windowMs: 60 * 60 * 1000, key: input.email.toLowerCase() });
  const result = await authService.resendVerification(input);
  return ok(result);
});
