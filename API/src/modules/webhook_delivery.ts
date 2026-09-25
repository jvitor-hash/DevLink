import { schemas } from "@/database/schema";
import { db } from "@/client";
import { eq } from "drizzle-orm";
import type { NotificationEvent } from "@/modules/notification_outbox";
import { logger } from "@/modules/logger";

const WEBHOOK_TIMEOUT_MS = 10_000;

type Subscription = typeof schemas.webhookSubscription.$inferSelect;

// HMAC-SHA256 over timestamp + body so receivers can reject stale/replayed deliveries.
export const signPayload = ( secret: string, body: string, timestamp: number ): string => {
  return new Bun.CryptoHasher("sha256", secret).update(`${timestamp}.${body}`).digest("hex");
};

const attemptDelivery = async ( subscription: Subscription, body: string ): Promise<boolean> => {
  const timestamp = Math.floor(Date.now() / 1000);
  const signature = signPayload(subscription.secret, body, timestamp);

  try {
    const response = await fetch(subscription.url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-Webhook-Event": body ? JSON.parse(body).type : "UNKNOWN",
        "X-Webhook-Signature": signature,
        "X-Webhook-Timestamp": String(timestamp),
      },
      body,
      signal: AbortSignal.timeout(WEBHOOK_TIMEOUT_MS),
    });

    return response.ok;
  } catch (error) {
    logger.warn(`[webhook] delivery to ${subscription.url} failed: ${error instanceof Error ? error.message : String(error)}`);
    return false;
  }
};

// Best-effort fan-out to active subscribers; a failed delivery is logged and
// skipped so one broken endpoint never blocks outbox processing.
export const deliverToSubscribers = async ( event: NotificationEvent, outboxId: string ): Promise<void> => {
  const subscriptions = await db
    .select()
    .from(schemas.webhookSubscription)
    .where(eq(schemas.webhookSubscription.isActive, true));

  if (!subscriptions.length) return;

  const body = JSON.stringify({
    id: outboxId,
    type: event.type,
    payload: event.payload,
    createdAt: new Date().toISOString(),
  });

  for (const subscription of subscriptions) {
    const delivered = await attemptDelivery(subscription, body);

    if (!delivered) {
      logger.warn(`[webhook] event ${outboxId} not delivered to subscription ${subscription.id}`);
    }
  }
};
