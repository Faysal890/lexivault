import { requireUserId } from "@/lib/server/auth";
import { updateProfileSchema } from "@/lib/server/dto/profile";
import { handle, ok } from "@/lib/server/http";
import { profileService } from "@/lib/server/services/profile.service";

export const GET = handle(async () => {
  const userId = await requireUserId();
  const profile = await profileService.get(userId);
  return ok(profile);
});

export const PUT = handle(async (req: Request) => {
  const userId = await requireUserId();
  const input = updateProfileSchema.parse(await req.json());
  const profile = await profileService.update(userId, input);
  return ok(profile);
});
