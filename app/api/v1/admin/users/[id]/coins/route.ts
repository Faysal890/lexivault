import { requireAdminId } from "@/lib/server/auth";
import { handle, ok, parseJson } from "@/lib/server/http";
import { coinService } from "@/lib/server/services/coin.service";
import { NotFoundError } from "@/lib/server/errors";
import { userRepo } from "@/lib/server/repositories/user.repo";
import { z } from "zod";

// Coins are stored as Prisma Int (32-bit signed, max 2,147,483,647).
// Cap each operation well below that ceiling so cumulative arithmetic can't overflow.
const COIN_OP_MAX = 1_000_000_000;

const bodySchema = z.object({
  action: z.enum(["add", "set"]),
  amount: z.number().int().min(0).max(COIN_OP_MAX),
  reason: z.string().min(1).max(200).optional().default("Admin adjustment"),
});

export const POST = handle(async (req: Request, ctx: { params: { id: string } }) => {
  await requireAdminId();
  const { action, amount, reason } = bodySchema.parse(await parseJson(req, (r) => r));

  const user = await userRepo.findById(ctx.params.id);
  if (!user) throw new NotFoundError("User not found");

  let newBalance: number;
  if (action === "add") {
    newBalance = await coinService.addCoins(ctx.params.id, amount, "ADMIN_GRANT", reason);
  } else {
    newBalance = await coinService.setCoins(ctx.params.id, amount, reason);
  }

  return ok({ coins: newBalance });
});
