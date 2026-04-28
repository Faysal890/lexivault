import { requireAdminId } from "@/lib/server/auth";
import { adminUpdateRoleSchema } from "@/lib/server/dto/admin";
import { handle, noContent, ok } from "@/lib/server/http";
import { adminService } from "@/lib/server/services/admin.service";

export const GET = handle(async (_req: Request, ctx: { params: { id: string } }) => {
  await requireAdminId();
  const user = await adminService.getUserDetail(ctx.params.id);
  return ok(user);
});

export const PATCH = handle(async (req: Request, ctx: { params: { id: string } }) => {
  const adminId = await requireAdminId();
  const body = await req.json();
  const input = adminUpdateRoleSchema.parse(body);
  const user = await adminService.updateRole(adminId, ctx.params.id, input);
  return ok(user);
});

export const DELETE = handle(async (_req: Request, ctx: { params: { id: string } }) => {
  const adminId = await requireAdminId();
  await adminService.deleteUser(adminId, ctx.params.id);
  return noContent();
});
