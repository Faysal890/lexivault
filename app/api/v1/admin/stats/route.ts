import { requireAdminId } from "@/lib/server/auth";
import { corsHandle, ok } from "@/lib/server/http";
import { adminService } from "@/lib/server/services/admin.service";

export const GET = corsHandle(async () => {
  await requireAdminId();
  const stats = await adminService.getStats();
  return ok(stats);
});

export { corsOptions as OPTIONS } from "@/lib/server/http";
