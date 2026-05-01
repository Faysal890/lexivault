import { requireUserId } from "@/lib/server/auth";
import { corsHandle, ok } from "@/lib/server/http";
import { storeService } from "@/lib/server/services/store.service";

export const GET = corsHandle(async () => {
  await requireUserId();
  const packages = await storeService.getPackages();
  return ok(packages);
});

export { corsOptions as OPTIONS } from "@/lib/server/http";
