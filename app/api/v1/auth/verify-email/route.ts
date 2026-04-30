import { verifyEmailSchema } from "@/lib/server/dto/auth";
import { handle, ok } from "@/lib/server/http";
import { rateLimit } from "@/lib/server/rate-limit";
import { authService } from "@/lib/server/services/auth.service";

export const POST = handle(async (req: Request) => {
  // Brute-force protection on the 6-digit code: limit per IP and per email.
  await rateLimit(req, { name: "verify-email-ip", limit: 20, windowMs: 60 * 60 * 1000 });
  const body = await req.json();
  const input = verifyEmailSchema.parse(body);
  await rateLimit(req, { name: "verify-email", limit: 10, windowMs: 60 * 60 * 1000, key: input.email.toLowerCase() });
  const result = await authService.verifyEmail(input);
  return ok(result);
});
