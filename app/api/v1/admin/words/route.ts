import { requireAdminId } from "@/lib/server/auth";
import { adminListWordsQuerySchema } from "@/lib/server/dto/admin";
import { corsHandle, ok } from "@/lib/server/http";
import { adminService } from "@/lib/server/services/admin.service";

export const GET = corsHandle(async (req: Request) => {
  await requireAdminId();
  const { searchParams } = new URL(req.url);
  const query = adminListWordsQuerySchema.parse({
    page:   searchParams.get("page")   ?? undefined,
    limit:  searchParams.get("limit")  ?? undefined,
    search: searchParams.get("search") ?? undefined,
    userId: searchParams.get("userId") ?? undefined,
  });
  const result = await adminService.listWords(query);
  return ok(result);
});

export { corsOptions as OPTIONS } from "@/lib/server/http";
