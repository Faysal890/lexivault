import { requireAdminId } from "@/lib/server/auth";
import { adminService } from "@/lib/server/services/admin.service";
import { notFound } from "next/navigation";
import { AppError } from "@/lib/server/errors";
import { coinService } from "@/lib/server/services/coin.service";
import UserDetailClient from "./UserDetailClient";

export default async function AdminUserDetailPage({ params }: { params: { id: string } }) {
  const adminId = await requireAdminId();
  try {
    const [user, balance] = await Promise.all([
      adminService.getUserDetail(params.id),
      coinService.getBalance(params.id),
    ]);
    return <UserDetailClient user={user} adminId={adminId} initialCoins={balance.coins} />;
  } catch (err) {
    if (err instanceof AppError && err.status === 404) notFound();
    throw err;
  }
}
