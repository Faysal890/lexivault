import { requireAdminId } from "@/lib/server/auth";
import { handle, ok } from "@/lib/server/http";
import { adminService } from "@/lib/server/services/admin.service";

export const GET = handle(async () => {
  await requireAdminId();
  const stats = await adminService.getStats();
  return ok(stats);
});
