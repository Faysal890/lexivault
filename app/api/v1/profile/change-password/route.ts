import { requireUserId } from "@/lib/server/auth";
import { changePasswordSchema } from "@/lib/server/dto/profile";
import { corsHandle, ok } from "@/lib/server/http";
import { rateLimit } from "@/lib/server/rate-limit";
import { profileService } from "@/lib/server/services/profile.service";

export const POST = corsHandle(async (req: Request) => {
  const userId = await requireUserId();
  await rateLimit(req, { name: "change-pw", limit: 10, windowMs: 60 * 60 * 1000, key: userId });
  const input = changePasswordSchema.parse(await req.json());
  await profileService.changePassword(userId, input);
  return ok({ message: "Password changed successfully." });
});

export { corsOptions as OPTIONS } from "@/lib/server/http";
