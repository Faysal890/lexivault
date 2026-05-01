import crypto from "crypto";
import { createCheckout, lemonSqueezySetup, listOrders } from "@lemonsqueezy/lemonsqueezy.js";
import { storeRepo } from "../repositories/store.repo";
import { NotFoundError } from "../errors";

function setupLs() {
  const key = process.env.LEMONSQUEEZY_API_KEY;
  if (!key) throw new Error("LEMONSQUEEZY_API_KEY not configured");
  lemonSqueezySetup({ apiKey: key });
}

// Throttle the LS API fallback so the polling client doesn't blow through LS rate limits.
const lsFallbackLastRun = new Map<string, number>();
const LS_FALLBACK_INTERVAL_MS = 15_000;
function shouldRunLsFallback(orderId: string): boolean {
  const now = Date.now();
  const last = lsFallbackLastRun.get(orderId) ?? 0;
  if (now - last < LS_FALLBACK_INTERVAL_MS) return false;
  lsFallbackLastRun.set(orderId, now);
  // Cleanup any really old entries occasionally.
  if (lsFallbackLastRun.size > 1000) {
    lsFallbackLastRun.forEach((ts, k) => {
      if (now - ts > 60 * 60 * 1000) lsFallbackLastRun.delete(k);
    });
  }
  return true;
}

export const storeService = {
  async getPackages() {
    return storeRepo.listActivePackages();
  },

  async createCheckoutSession(userId: string, packageId: string, successUrl: string, cancelUrl: string) {
    const pkg = await storeRepo.getPackage(packageId);
    if (!pkg || !pkg.isActive) throw new NotFoundError("Coin package not found");
    if (!pkg.lsVariantId) throw new NotFoundError("This package is not yet configured for checkout");

    const storeId = process.env.LEMONSQUEEZY_STORE_ID;
    if (!storeId) throw new Error("LEMONSQUEEZY_STORE_ID not configured");

    setupLs();

    const order = await storeRepo.createOrder({ userId, packageId });

    const { data, error } = await createCheckout(storeId, pkg.lsVariantId, {
      checkoutData: {
        custom: { order_id: order.id, user_id: userId, package_id: packageId },
      },
      productOptions: {
        name: pkg.name,
        description: `${pkg.coins.toLocaleString()} coins for Lexora`,
        redirectUrl: `${successUrl}&oid=${order.id}`,
      },
      checkoutOptions: { media: false },
    });

    if (error || !data?.data.attributes.url) {
      throw new Error(error?.message ?? "Failed to create Lemon Squeezy checkout");
    }

    return { url: data.data.attributes.url, orderId: order.id };
  },

  // Checks our own DB — called by the success page to know if the payment has been credited.
  // If the order is still PENDING, falls back to querying the Lemon Squeezy API directly so
  // payments still complete even when the webhook hasn't reached this server (e.g. localhost dev).
  async getOrderStatus(userId: string, orderId: string) {
    const order = await storeRepo.findOrderById(orderId);
    if (!order || order.userId !== userId) return null;

    if (order.status === "PENDING" && shouldRunLsFallback(orderId)) {
      const lsOrderId = await this.findLsOrderIdForOurOrder(orderId);
      if (lsOrderId) {
        const result = await storeRepo.completeOrderAndCreditCoins(orderId, lsOrderId);
        if (result) {
          console.log("[store-verify] fallback credited (lsOrder", lsOrderId, ")");
          return { status: "COMPLETED" as const, coins: order.package.coins };
        }
      }
    }

    return {
      status: order.status,
      coins: order.package.coins,
    };
  },

  // Webhook fallback: ask Lemon Squeezy for recent orders in our store and find one whose
  // custom_data.order_id matches ours. Returns the LS order id (as string) or null.
  async findLsOrderIdForOurOrder(orderId: string): Promise<string | null> {
    const storeId = process.env.LEMONSQUEEZY_STORE_ID;
    const apiKey = process.env.LEMONSQUEEZY_API_KEY;
    if (!storeId || !apiKey) return null;

    setupLs();

    try {
      const { data, error } = await listOrders({
        filter: { storeId },
        page: { size: 25 },
      });
      if (error || !data?.data) return null;

      for (const lsOrder of data.data) {
        const attrs = lsOrder.attributes as Record<string, unknown>;
        const status = typeof attrs.status === "string" ? attrs.status : "";
        if (status !== "paid") continue;

        // Look for our order_id in the order's custom_data. LS persists custom_data on
        // first_order_item.custom_data; some payloads also expose it at attributes.urls.
        const firstItem = attrs.first_order_item as { custom_data?: Record<string, unknown> } | undefined;
        const custom = firstItem?.custom_data as Record<string, unknown> | undefined;
        if (custom && (custom.order_id === orderId || custom.orderId === orderId)) {
          return String(lsOrder.id);
        }
      }
      return null;
    } catch (err) {
      console.error("[store-verify] LS lookup failed:", err instanceof Error ? err.message : String(err));
      return null;
    }
  },

  async handleWebhook(rawBody: Buffer, signature: string) {
    const secret = process.env.LEMONSQUEEZY_WEBHOOK_SECRET;
    if (!secret) throw new Error("LEMONSQUEEZY_WEBHOOK_SECRET not configured");

    const digest = Buffer.from(
      crypto.createHmac("sha256", secret).update(rawBody).digest("hex"),
      "utf-8"
    );
    const sigBuf = Buffer.from(signature, "utf-8");
    if (digest.length !== sigBuf.length || !crypto.timingSafeEqual(digest, sigBuf)) {
      throw new Error("Invalid webhook signature");
    }

    const payload = JSON.parse(rawBody.toString("utf-8"));
    const eventName: string = payload.meta?.event_name ?? "";

    if (eventName === "order_created") {
      const customData = payload.meta?.custom_data as Record<string, string> | undefined;
      const orderId = customData?.order_id ?? customData?.orderId;
      const lsOrderId = String(payload.data?.id ?? "");

      if (orderId) {
        const result = await storeRepo.completeOrderAndCreditCoins(orderId, lsOrderId);
        if (result) {
          console.log("[ls-webhook] credited", result.coinsCredited, "coins (lsOrder", lsOrderId, ")");
        } else {
          console.log("[ls-webhook] order already processed (lsOrder", lsOrderId, ")");
        }
      }
    }

    return { received: true };
  },
};
