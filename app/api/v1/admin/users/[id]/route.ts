import { requireAdminId } from "@/lib/server/auth";
import { adminUpdateRoleSchema } from "@/lib/server/dto/admin";
import { corsHandle, noContent, ok } from "@/lib/server/http";
import { adminService } from "@/lib/server/services/admin.service";

export const GET = corsHandle(async (_req: Request, ctx: { params: Promise<{ id: string }> }) => {
  await requireAdminId();
  const { id } = await ctx.params;
  const user = await adminService.getUserDetail(id);
  return ok(user);
});

export const PATCH = corsHandle(async (req: Request, ctx: { params: Promise<{ id: string }> }) => {
  const adminId = await requireAdminId();
  const { id } = await ctx.params;
  const body = await req.json();
  const input = adminUpdateRoleSchema.parse(body);
  const user = await adminService.updateRole(adminId, id, input);
  return ok(user);
});

export const DELETE = corsHandle(async (_req: Request, ctx: { params: Promise<{ id: string }> }) => {
  const adminId = await requireAdminId();
  const { id } = await ctx.params;
  await adminService.deleteUser(adminId, id);
  return noContent();
});

export { corsOptions as OPTIONS } from "@/lib/server/http";
