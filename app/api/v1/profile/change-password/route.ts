import { requireUserId } from "@/lib/server/auth";
import { changePasswordSchema } from "@/lib/server/dto/profile";
import { handle, ok } from "@/lib/server/http";
import { profileService } from "@/lib/server/services/profile.service";

export const POST = handle(async (req: Request) => {
  const userId = await requireUserId();
  const input = changePasswordSchema.parse(await req.json());
  await profileService.changePassword(userId, input);
  return ok({ message: "Password changed successfully." });
});
