import { requireAdminId } from "@/lib/server/auth";
import { adminListUsersQuerySchema } from "@/lib/server/dto/admin";
import { handle, ok } from "@/lib/server/http";
import { adminService } from "@/lib/server/services/admin.service";

export const GET = handle(async (req: Request) => {
  await requireAdminId();
  const { searchParams } = new URL(req.url);
  const query = adminListUsersQuerySchema.parse({
    page:   searchParams.get("page")   ?? undefined,
    limit:  searchParams.get("limit")  ?? undefined,
    search: searchParams.get("search") ?? undefined,
    role:   searchParams.get("role")   ?? undefined,
  });
  const result = await adminService.listUsers(query);
  return ok(result);
});
