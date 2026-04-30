import { requireAdminId } from "@/lib/server/auth";
import { handle, ok, created, parseJson } from "@/lib/server/http";
import { storeRepo } from "@/lib/server/repositories/store.repo";
import { z } from "zod";

const createSchema = z.object({
  name: z.string().min(1).max(100),
  coins: z.number().int().min(1).max(10_000_000),
  priceUsd: z.number().int().min(1).max(10_000_000), // cents — caps at $100,000
  lsVariantId: z.string().max(100).optional(),
});

export const GET = handle(async () => {
  await requireAdminId();
  return ok(await storeRepo.listAllPackages());
});

export const POST = handle(async (req: Request) => {
  await requireAdminId();
  const data = createSchema.parse(await parseJson(req, (r) => r));
  return created(await storeRepo.createPackage(data));
});
