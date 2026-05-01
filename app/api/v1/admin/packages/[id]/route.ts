import { requireAdminId } from "@/lib/server/auth";
import { corsHandle, ok, noContent, parseJson } from "@/lib/server/http";
import { storeRepo } from "@/lib/server/repositories/store.repo";
import { NotFoundError } from "@/lib/server/errors";
import { z } from "zod";

const updateSchema = z.object({
  name: z.string().min(1).max(100).optional(),
  coins: z.number().int().min(1).max(10_000_000).optional(),
  priceUsd: z.number().int().min(1).max(10_000_000).optional(), // cents — caps at $100,000
  lsVariantId: z.string().max(100).optional(),
  isActive: z.boolean().optional(),
});

export const PATCH = corsHandle(async (req: Request, ctx: { params: Promise<{ id: string }> }) => {
  await requireAdminId();
  const { id } = await ctx.params;
  const data = updateSchema.parse(await parseJson(req, (r) => r));
  const pkg = await storeRepo.getPackage(id);
  if (!pkg) throw new NotFoundError("Package not found");
  return ok(await storeRepo.updatePackage(id, data));
});

export const DELETE = corsHandle(async (_req: Request, ctx: { params: Promise<{ id: string }> }) => {
  await requireAdminId();
  const { id } = await ctx.params;
  const pkg = await storeRepo.getPackage(id);
  if (!pkg) throw new NotFoundError("Package not found");
  await storeRepo.deletePackage(id);
  return noContent();
});

export { corsOptions as OPTIONS } from "@/lib/server/http";
