import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";
import { Suspense } from "react";
import StoreClient from "./StoreClient";
import { storeService } from "@/lib/server/services/store.service";
import { coinService } from "@/lib/server/services/coin.service";

export default async function StorePage() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) redirect("/login");

  const [packages, balance, rawTx] = await Promise.all([
    storeService.getPackages(),
    coinService.getBalance(session.user.id),
    coinService.getTransactions(session.user.id),
  ]);

  const transactions = rawTx.map((t) => ({
    id: t.id,
    amount: t.amount,
    type: t.type as string,
    description: t.description,
    createdAt: t.createdAt.toISOString(),
  }));

  return (
    <Suspense>
      <StoreClient packages={packages} initialBalance={balance.coins} initialTransactions={transactions} />
    </Suspense>
  );
}
