import {
  processWhatsAppWebhook,
  verifyWhatsAppSignature,
  type WhatsAppWebhookPayload,
} from "@/lib/whatsapp-webhook";

export const dynamic = "force-dynamic";

/**
 * Meta webhook verification handshake.
 * App Dashboard → WhatsApp → Configuration → Callback URL:
 *   https://<your-domain>/api/whatsapp/webhook
 * Verify token must match WHATSAPP_VERIFY_TOKEN.
 */
export async function GET(request: Request) {
  const url = new URL(request.url);
  const mode = url.searchParams.get("hub.mode");
  const token = url.searchParams.get("hub.verify_token");
  const challenge = url.searchParams.get("hub.challenge");
  const verifyToken = process.env.WHATSAPP_VERIFY_TOKEN?.trim();

  if (mode === "subscribe" && verifyToken && token === verifyToken && challenge) {
    return new Response(challenge, {
      status: 200,
      headers: { "Content-Type": "text/plain" },
    });
  }

  return new Response("Forbidden", { status: 403 });
}

/**
 * Receives WhatsApp Cloud API events (message status + inbound messages).
 * Always acknowledges with 200 quickly so Meta does not retry for 7 days.
 */
export async function POST(request: Request) {
  const appSecret = process.env.WHATSAPP_APP_SECRET?.trim();
  const rawBody = await request.text();

  if (appSecret) {
    const signature = request.headers.get("x-hub-signature-256");
    if (!verifyWhatsAppSignature(rawBody, signature, appSecret)) {
      console.error("[whatsapp] webhook signature verification failed");
      return new Response("Invalid signature", { status: 401 });
    }
  } else {
    console.warn("[whatsapp] WHATSAPP_APP_SECRET not set — skipping signature check");
  }

  try {
    const payload = JSON.parse(rawBody) as WhatsAppWebhookPayload;
    const result = processWhatsAppWebhook(payload);
    if (result.handled) {
      console.info("[whatsapp] webhook processed", {
        statuses: result.statuses,
        messages: result.messages,
      });
    }
  } catch (err) {
    console.error("[whatsapp] webhook parse/process failed", err);
    // Still return 200 for malformed payloads we don't want Meta to retry forever.
  }

  return new Response("EVENT_RECEIVED", { status: 200 });
}
