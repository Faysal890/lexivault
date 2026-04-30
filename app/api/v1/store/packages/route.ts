import { requireUserId } from "@/lib/server/auth";
import { handle, ok } from "@/lib/server/http";
import { storeService } from "@/lib/server/services/store.service";

export const GET = handle(async () => {
  await requireUserId();
  const packages = await storeService.getPackages();
  return ok(packages);
});
