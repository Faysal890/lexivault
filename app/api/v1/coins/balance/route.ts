import { requireUserId } from "@/lib/server/auth";
import { handle, ok } from "@/lib/server/http";
import { coinService } from "@/lib/server/services/coin.service";

export const GET = handle(async () => {
  const userId = await requireUserId();
  const [balance, transactions] = await Promise.all([
    coinService.getBalance(userId),
    coinService.getTransactions(userId),
  ]);
  return ok({ ...balance, transactions });
});
