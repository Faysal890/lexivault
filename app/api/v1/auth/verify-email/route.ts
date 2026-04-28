import { verifyEmailQuerySchema } from "@/lib/server/dto/auth";
import { handle, ok } from "@/lib/server/http";
import { authService } from "@/lib/server/services/auth.service";

export const GET = handle(async (req: Request) => {
  const { searchParams } = new URL(req.url);
  const query = verifyEmailQuerySchema.parse({ token: searchParams.get("token") ?? "" });
  const result = await authService.verifyEmail(query);
  return ok(result);
});
