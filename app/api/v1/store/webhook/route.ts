import { NextResponse } from "next/server";
import { storeService } from "@/lib/server/services/store.service";

export const POST = async (req: Request) => {
  const signature = req.headers.get("x-signature");
  if (!signature) return NextResponse.json({ error: "No signature" }, { status: 400 });

  const rawBody = Buffer.from(await req.arrayBuffer());

  try {
    const result = await storeService.handleWebhook(rawBody, signature);
    return NextResponse.json(result);
  } catch (err) {
    // Don't log raw body or err message (could leak signature or PII).
    console.error("[ls-webhook] processing failed");
    if (process.env.NODE_ENV !== "production") console.error(err);
    return NextResponse.json({ error: "Webhook error" }, { status: 400 });
  }
};

export const runtime = "nodejs";
