import { forgotPasswordSchema } from "@/lib/server/dto/auth";
import { handle, ok } from "@/lib/server/http";
import { rateLimit } from "@/lib/server/rate-limit";
import { authService } from "@/lib/server/services/auth.service";

export const POST = handle(async (req: Request) => {
  const input = forgotPasswordSchema.parse(await req.json());
  // Rate-limit per IP and per email — prevents email bombing of a single victim.
  await rateLimit(req, { name: "forgot-pw-ip", limit: 10, windowMs: 60 * 60 * 1000 });
  await rateLimit(req, { name: "forgot-pw-email", limit: 3, windowMs: 60 * 60 * 1000, key: input.email.toLowerCase() });
  const result = await authService.forgotPassword(input);
  return ok(result);
});
