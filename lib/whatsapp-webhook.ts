import { createHmac, timingSafeEqual } from "crypto";

export type WhatsAppWebhookPayload = {
  object?: string;
  entry?: Array<{
    id?: string;
    changes?: Array<{
      field?: string;
      value?: {
        messaging_product?: string;
        metadata?: {
          display_phone_number?: string;
          phone_number_id?: string;
        };
        contacts?: Array<{
          profile?: { name?: string };
          wa_id?: string;
        }>;
        messages?: Array<{
          from?: string;
          id?: string;
          timestamp?: string;
          type?: string;
          text?: { body?: string };
        }>;
        statuses?: Array<{
          id?: string;
          status?: string;
          timestamp?: string;
          recipient_id?: string;
          errors?: Array<{
            code?: number;
            title?: string;
            message?: string;
            error_data?: { details?: string };
          }>;
        }>;
      };
    }>;
  }>;
};

/** Meta signs POST bodies as HMAC-SHA256 of the raw JSON with the App Secret. */
export function verifyWhatsAppSignature(rawBody: string, signatureHeader: string | null, appSecret: string) {
  if (!signatureHeader || !appSecret) return false;
  const prefix = "sha256=";
  if (!signatureHeader.startsWith(prefix)) return false;

  const provided = signatureHeader.slice(prefix.length);
  const expected = createHmac("sha256", appSecret).update(rawBody, "utf8").digest("hex");

  try {
    const a = Buffer.from(provided, "hex");
    const b = Buffer.from(expected, "hex");
    if (a.length !== b.length) return false;
    return timingSafeEqual(a, b);
  } catch {
    return false;
  }
}

/**
 * Handle WhatsApp webhook events.
 * Order notifications are sent outbound via templates; this mainly records
 * delivery/read/failed status and any customer replies for ops visibility.
 */
export function processWhatsAppWebhook(payload: WhatsAppWebhookPayload) {
  if (payload.object !== "whatsapp_business_account") {
    return { handled: false as const, reason: "ignored_object" };
  }

  let statuses = 0;
  let messages = 0;

  for (const entry of payload.entry ?? []) {
    for (const change of entry.changes ?? []) {
      if (change.field !== "messages") continue;
      const value = change.value;
      if (!value) continue;

      for (const status of value.statuses ?? []) {
        statuses += 1;
        const err = status.errors?.[0];
        if (status.status === "failed" || err) {
          console.error("[whatsapp] message status failed", {
            wamid: status.id,
            status: status.status,
            recipient: status.recipient_id,
            code: err?.code,
            title: err?.title,
            details: err?.error_data?.details ?? err?.message,
          });
        } else {
          console.info("[whatsapp] message status", {
            wamid: status.id,
            status: status.status,
            recipient: status.recipient_id,
            timestamp: status.timestamp,
          });
        }
      }

      for (const message of value.messages ?? []) {
        messages += 1;
        console.info("[whatsapp] inbound message", {
          from: message.from,
          wamid: message.id,
          type: message.type,
          text: message.text?.body,
          timestamp: message.timestamp,
          phoneNumberId: value.metadata?.phone_number_id,
        });
      }
    }
  }

  return { handled: true as const, statuses, messages };
}
