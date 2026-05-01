import { requireUserId } from "@/lib/server/auth";
import { corsHandle, ok, parseJson } from "@/lib/server/http";
import { storeService } from "@/lib/server/services/store.service";
import { z } from "zod";

const bodySchema = z.object({ packageId: z.string().min(1) });

function appUrl() {
  return process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";
}

export const POST = corsHandle(async (req: Request) => {
  const userId = await requireUserId();
  const { packageId } = bodySchema.parse(await parseJson(req, (r) => r));
  const base = appUrl();
  const result = await storeService.createCheckoutSession(
    userId,
    packageId,
    `${base}/store?success=true`,
    `${base}/store?cancelled=true`
  );
  // Return only the URL to the client (orderId is embedded in the success URL by the service)
  return ok({ url: result.url });
});

export { corsOptions as OPTIONS } from "@/lib/server/http";
