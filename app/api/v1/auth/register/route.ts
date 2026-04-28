import { registerSchema } from "@/lib/server/dto/auth";
import { created, handle } from "@/lib/server/http";
import { authService } from "@/lib/server/services/auth.service";

export const POST = handle(async (req: Request) => {
  const input = registerSchema.parse(await req.json());
  const result = await authService.register(input);
  return created(result);
});
