import { prisma } from "@/lib/prisma";
import type { OrderStatus } from "@prisma/client";

export const storeRepo = {
  async listActivePackages() {
    return prisma.coinPackage.findMany({
      where: { isActive: true },
      orderBy: { priceUsd: "asc" },
    });
  },

  async listAllPackages() {
    return prisma.coinPackage.findMany({ orderBy: { priceUsd: "asc" } });
  },

  async getPackage(id: string) {
    return prisma.coinPackage.findUnique({ where: { id } });
  },

  async createPackage(data: { name: string; coins: number; priceUsd: number; lsVariantId?: string }) {
    return prisma.coinPackage.create({ data });
  },

  async updatePackage(id: string, data: { name?: string; coins?: number; priceUsd?: number; lsVariantId?: string; isActive?: boolean }) {
    return prisma.coinPackage.update({ where: { id }, data });
  },

  async deletePackage(id: string) {
    return prisma.coinPackage.delete({ where: { id } });
  },

  async createOrder(data: { userId: string; packageId: string }) {
    return prisma.order.create({ data });
  },

  async findOrderById(id: string) {
    return prisma.order.findUnique({
      where: { id },
      include: { package: true },
    });
  },

  async completeOrder(id: string, lsOrderId: string) {
    return prisma.order.update({
      where: { id },
      data: { status: "COMPLETED" as OrderStatus, lsOrderId },
    });
  },

  // Atomic: marks the order COMPLETED, writes the coin transaction, and increments the user's
  // balance in a single DB transaction. Returns null if the order is missing or not PENDING
  // (idempotent — Lemon Squeezy may retry the webhook).
  async completeOrderAndCreditCoins(orderId: string, lsOrderId: string) {
    return prisma.$transaction(async (tx) => {
      // Conditional update prevents double-credit when the webhook fires concurrently with the
      // verify-fallback poll. Only one of the two can flip PENDING → COMPLETED; the loser sees
      // count === 0 and bails out before any coins are credited.
      const claim = await tx.order.updateMany({
        where: { id: orderId, status: "PENDING" },
        data: { status: "COMPLETED" as OrderStatus, lsOrderId },
      });
      if (claim.count === 0) return null;

      const order = await tx.order.findUnique({
        where: { id: orderId },
        include: { package: true },
      });
      if (!order) return null;

      await tx.coinTransaction.create({
        data: {
          userId: order.userId,
          amount: order.package.coins,
          type: "PURCHASE",
          description: `Purchased ${order.package.name}`,
          lsOrderId,
        },
      });
      const user = await tx.user.update({
        where: { id: order.userId },
        data: { coins: { increment: order.package.coins } },
        select: { coins: true },
      });
      return { userId: order.userId, coinsCredited: order.package.coins, newBalance: user.coins };
    });
  },
};
