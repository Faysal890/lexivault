import { registerSchema } from "@/lib/server/dto/auth";
import { created, corsHandle } from "@/lib/server/http";
import { rateLimit } from "@/lib/server/rate-limit";
import { authService } from "@/lib/server/services/auth.service";

export const POST = corsHandle(async (req: Request) => {
  await rateLimit(req, { name: "register", limit: 5, windowMs: 60 * 60 * 1000 });
  const input = registerSchema.parse(await req.json());
  const result = await authService.register(input);
  return created(result);
});

export { corsOptions as OPTIONS } from "@/lib/server/http";
