import { requireAdminId } from "@/lib/server/auth";
import { handle, noContent } from "@/lib/server/http";
import { adminService } from "@/lib/server/services/admin.service";

export const DELETE = handle(async (_req: Request, ctx: { params: { id: string } }) => {
  await requireAdminId();
  await adminService.deleteWord(ctx.params.id);
  return noContent();
});
