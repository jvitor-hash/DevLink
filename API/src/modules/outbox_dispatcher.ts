import { sql } from "drizzle-orm";
import { db } from "@/client";
import { schemas } from "@/database/schema";
import { logger } from "./logger";
import { SseHub, type SSEEvent } from "./sse_hub";

const workerId = `dispatcher-${crypto.randomUUID()}`;

const BATCH_SIZE = 100;
const MAX_ATTEMPTS = 5;
const LEASE_TIMEOUT_MS = 5 * 60 * 1000;

// 1 min -> 5 min -> 15 min -> 1 hour, then dead letter.
const BACKOFF_MS = [60_000, 300_000, 900_000, 3_600_000];

// Backoff for the Nth failed attempt (1-indexed); null means dead-letter.
const nextBackoffMs = (attempts: number): number | null => {
  const index = attempts - 1;

  if (index < 0 || index >= BACKOFF_MS.length) return null;

  return BACKOFF_MS[index];
};

// Who should see the event: handlers embed the participant list (client +
// assigned programmer) at write time; the DB lookup is only a fallback for
// older payloads and merges the acting user in either way.
const resolveAudience = async (aggregateId: string, actorId: string, payload: Record<string, unknown>, tx: typeof db): Promise<string[]> => {
  const audience = new Set<string>(actorId ? [actorId] : []);

  const embedded = payload.audience;

  if (Array.isArray(embedded)) {
    for (const userId of embedded) {
      if (typeof userId === "string" && userId) audience.add(userId);
    }

    if (audience.size > 0) return [...audience];
  }

  const rows = await tx
    .select({ clientId: schemas.project.clientId, programmerId: schemas.project.programmerId })
    .from(schemas.project)
    .where(sql`${schemas.project.id} = ${aggregateId}`)
    .limit(1);

  const project = rows[0];

  if (project?.clientId) audience.add(project.clientId);
  if (project?.programmerId) audience.add(project.programmerId);

  return [...audience];
};

const failEvent = async (eventId: string, attempts: number, error: unknown): Promise<void> => {
  const nextAttempts = attempts + 1;
  const backoff = nextBackoffMs(nextAttempts);
  const message = error instanceof Error ? error.message : String(error);

  if (backoff === null) {
    await db
      .update(schemas.outboxEvents)
      .set({ status: "DEAD_LETTER", attempts: nextAttempts, last_error: message })
      .where(sql`${schemas.outboxEvents.id} = ${eventId}`);
    return;
  }

  await db
    .update(schemas.outboxEvents)
    .set({
      status: "PENDING",
      attempts: nextAttempts,
      available_at: new Date(Date.now() + backoff),
      last_error: message,
    })
    .where(sql`${schemas.outboxEvents.id} = ${eventId}`);
};

const dispatchEvent = async (event: typeof schemas.outboxEvents.$inferSelect,): Promise<void> => {
  const payload = event.payload as Record<string, unknown>;
  const actorId = [payload.savedBy, payload.updatedBy, payload.deletedBy]
    .find((value): value is string => typeof value === "string") ?? "";

  // The audience list is internal routing data; it never reaches the client.
  const { audience: _internal, ...publicPayload } = payload;

  const sseEvent: SSEEvent = {
    id: event.id,
    event: event.event_type,
    data: {
      eventId: event.id,
      type: event.event_type,
      aggregateType: event.aggregate_type,
      aggregateId: event.aggregate_id,
      ...publicPayload,
    },
    audienceUserIds: await resolveAudience(event.aggregate_id, actorId, payload, db),
  };

  const delivered = SseHub.publish(sseEvent);

  await db
    .update(schemas.outboxEvents)
    .set({ status: "DISPATCHED", processed_at: new Date(), last_error: null })
    .where(sql`${schemas.outboxEvents.id} = ${event.id}`);

  logger.info(`[outbox] dispatched ${event.event_type} (${event.id}) to ${delivered} client(s)`);
};

const dispatchBatch = async (): Promise<number> => {
  // Lease timeout: stuck PROCESSING rows older than the lease go back to PENDING.
  await db.execute(sql`
    UPDATE outbox_events
    SET status = 'PENDING'
    WHERE status = 'PROCESSING'
      AND locked_at <= now() - interval '5 minutes'
  `);

  // Atomic claim: SKIP LOCKED keeps parallel dispatchers from stealing each other's rows.
  const claimed = await db.execute(sql`
    UPDATE outbox_events
    SET status = 'PROCESSING',
        locked_at = now(),
        locked_by = ${workerId}
    WHERE id IN (
      SELECT id FROM outbox_events
      WHERE status = 'PENDING' AND available_at <= now()
      ORDER BY created_at ASC
      FOR UPDATE SKIP LOCKED
      LIMIT ${BATCH_SIZE}
    )
    RETURNING *
  `);

  const events = claimed.rows as unknown as Array<typeof schemas.outboxEvents.$inferSelect>;

  for (const event of events) {
    try {
      await dispatchEvent(event);
    } catch (error) {
      logger.error("[outbox] dispatch failed", event.id, error);
      await failEvent(event.id, event.attempts, error);
    }
  }

  return events.length;
};

let dispatcherTimer: Timer | null = null;

const startOutboxDispatcher = (intervalMs = 1_000): void => {
  if (dispatcherTimer) return;

  dispatcherTimer = setInterval(() => {
    dispatchBatch().catch((error) => logger.error("[outbox] tick failed", error));
  }, intervalMs);

  // Fire once immediately so events do not wait a full interval after startup.
  dispatchBatch().catch((error) => logger.error("[outbox] initial tick failed", error));
};

const stopOutboxDispatcher = (): void => {
  if (dispatcherTimer) {
    clearInterval(dispatcherTimer);
    dispatcherTimer = null;
  }
};

export const OutboxDispatcher = {
  dispatchBatch,
  startOutboxDispatcher,
  stopOutboxDispatcher,
  nextBackoffMs,
  get workerId() {
    return workerId;
  },
};
