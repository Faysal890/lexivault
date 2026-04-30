import { requireUserId } from "@/lib/server/auth";
import { handle, ok } from "@/lib/server/http";
import { storeService } from "@/lib/server/services/store.service";
import { NotFoundError } from "@/lib/server/errors";

// Polled by the success page to check if the webhook has processed the payment.
export const GET = handle(async (req: Request) => {
  const userId = await requireUserId();
  const oid = new URL(req.url).searchParams.get("oid");
  if (!oid) throw new NotFoundError("Missing oid");
  const result = await storeService.getOrderStatus(userId, oid);
  if (!result) throw new NotFoundError("Order not found");
  return ok(result);
});
