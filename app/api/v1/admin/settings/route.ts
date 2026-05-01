import { requireAdminId } from "@/lib/server/auth";
import { corsHandle, ok, parseJson } from "@/lib/server/http";
import { settingsService } from "@/lib/server/services/settings.service";
import { z } from "zod";

// Caps mirror the per-op limit in admin/users/[id]/coins so settings can't push values
// beyond what individual coin operations allow (and well below Prisma Int 32-bit max).
const SETTINGS_MAX = 1_000_000;
const updateSchema = z.object({
  newUserCoins: z.number().int().min(0).max(SETTINGS_MAX).optional(),
  generationCost: z.number().int().min(0).max(SETTINGS_MAX).optional(),
  dailyQuizCoins: z.number().int().min(0).max(SETTINGS_MAX).optional(),
});

export const GET = corsHandle(async () => {
  await requireAdminId();
  return ok(await settingsService.getSettings());
});

export const PATCH = corsHandle(async (req: Request) => {
  await requireAdminId();
  const data = updateSchema.parse(await parseJson(req, (r) => r));
  return ok(await settingsService.updateSettings(data));
});

export { corsOptions as OPTIONS } from "@/lib/server/http";
