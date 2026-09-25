import { schemas } from "@/database/schema";
import { db } from "@/client";
import { and, asc, eq, inArray, lt } from "drizzle-orm";
import { notifyNewProject, notifyProjectSaved, notifyProjectViews } from "@/modules/notification_fanout";
import { deliverToSubscribers } from "@/modules/webhook_delivery";
import { logger } from "@/modules/logger";

export type NotificationEvent =
  | {
      type: "NEW_PROJECT";
      payload: {
        id: string;
        title: string;
        minBudget: number;
        maxBudget: number;
        deadline: Date | null;
        primaryLanguage: string;
        platforms: string[];
      };
    }
  | {
      type: "PROJECT_SAVED";
      payload: {
        id: string;
        title: string;
        saveTotalCount: number;
        clientId: string;
      };
    }
  | {
      type: "VIEW_INSIGHT";
      payload: {
        id: string;
        title: string;
        viewTotalCount: number;
        lastViewedAt: string | null;
        clientId: string;
      };
    };

const MAX_RETRY_COUNT = 5;
const MAX_PROCESS_AT_ONCE = 1000;

type OutboxRow = typeof schemas.outbox.$inferSelect;

export const publishNotificationEvent = async ( event: NotificationEvent ): Promise<string> => {
  const [row] = await db
    .insert(schemas.outbox)
    .values({
      aggregateType: "notification",
      aggregateId: event.payload.id,
      eventType: event.type,
      payload: JSON.stringify(event),
      status: "PENDING",
    })
    .returning({ id: schemas.outbox.id });

  void processOutbox().catch((error) => logger.error("[outbox] immediate drain failed", error));

  return row.id;
};

const applyNotificationEvent = async ( event: NotificationEvent, outboxId: string ): Promise<void> => {
  switch (event.type) {
    case "NEW_PROJECT":
      await notifyNewProject(event.payload, outboxId);
      break;
    case "PROJECT_SAVED":
      await notifyProjectSaved(event.payload, outboxId);
      break;
    case "VIEW_INSIGHT":
      await notifyProjectViews(event.payload, outboxId);
      break;
  }
};

const processRow = async ( row: OutboxRow ): Promise<void> => {
  try {
    const event = JSON.parse(row.payload) as NotificationEvent;
    await applyNotificationEvent(event, row.id);
    await deliverToSubscribers(event, row.id);

    await db
      .update(schemas.outbox)
      .set({ status: "PROCESSED", processedAt: new Date(), errorMessage: null })
      .where(eq(schemas.outbox.id, row.id));
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    const exhausted = row.retryCount + 1 >= MAX_RETRY_COUNT;

    await db
      .update(schemas.outbox)
      .set({
        status: exhausted ? "DEAD" : "FAILED",
        retryCount: row.retryCount + 1,
        errorMessage: message,
      })
      .where(eq(schemas.outbox.id, row.id));

    if (exhausted) {
      logger.error(`[outbox] event ${row.id} moved to DEAD after ${MAX_RETRY_COUNT} attempts: ${message}`);
    }
  }
};

export const processOutbox = async (): Promise<number> => {
  // PENDING rows are first attempts; FAILED rows are retries below the cap.
  const rows = (await db
    .select()
    .from(schemas.outbox)
    .where(
      and(
        inArray(schemas.outbox.status, ["PENDING", "FAILED"]),
        lt(schemas.outbox.retryCount, MAX_RETRY_COUNT),
      ),
    )
    .orderBy(asc(schemas.outbox.createdAt))
    .limit(MAX_PROCESS_AT_ONCE)) as OutboxRow[];

  if (!rows.length) return 0;

  for (const row of rows) {
    await processRow(row);
  }

  return rows.length;
};

// Requeue events that exhausted their retries, for manual recovery.
export const requeueDeadEvents = async (): Promise<number> => {
  const result = await db
    .update(schemas.outbox)
    .set({ status: "PENDING", retryCount: 0, errorMessage: null })
    .where(eq(schemas.outbox.status, "DEAD"))
    .returning({ id: schemas.outbox.id });

  return result.length;
};
