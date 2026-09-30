import { schemas } from "@/database/schema";
import { db } from "@/client";
import { and, eq, inArray, isNull, sql } from "drizzle-orm";
import { processOutbox, publishNotificationEvent, requeueFailedEvents } from "@/modules/notification_outbox";
import { negotiationTimeoutMs, viewInsightsIntervalMs } from "@/modules/app_config";
import { isNegotiationExpired } from "@/modules/project_status";
import { sweepExpiredChatData } from "@/modules/chat_retention";
import { logger } from "@/modules/logger";

// Reopen projects whose negotiation window expired without an accepted offer.
export const sweepExpiredNegotiations = async (now: Date = new Date()): Promise<number> => {
  const negotiating = await db
    .select()
    .from(schemas.project)
    .where(inArray(schemas.project.status, ["NEGOTIATING"]));

  const expired = negotiating.filter((project) =>
    isNegotiationExpired(project.negotiationStartedAt, negotiationTimeoutMs(), now),
  );

  for (const project of expired) {
    await db
      .update(schemas.project)
      .set({ status: "OPEN", negotiationStartedAt: null })
      .where(eq(schemas.project.id, project.id));
  }

  if (expired.length) {
    logger.info(`[scheduler] ${expired.length} project(s) returned to OPEN after negotiation timeout`);
  }

  return expired.length;
};

// Send clients periodic insights about views on their open projects.
// Enqueued through the outbox so each insight also fans out to webhook subscribers.
export const sweepViewInsights = async (): Promise<void> => {
  const openProjects = await db
    .select()
    .from(schemas.project)
    .where(
      and(
        isNull(schemas.project.programmerId),
        inArray(schemas.project.status, ["OPEN", "NEGOTIATING"]),
        sql`${schemas.project.viewTotalCount} > 0`,
      ),
    );

  for (const project of openProjects) {
    await publishNotificationEvent({
      type: "VIEW_INSIGHT",
      payload: {
        id: project.id,
        title: project.title,
        viewTotalCount: project.viewTotalCount,
        lastViewedAt: project.lastViewedAt ? new Date(project.lastViewedAt).toISOString() : null,
        clientId: project.clientId,
      },
    }).catch((error) => logger.error("[scheduler] view insight enqueue failed", error));
  }
};

// Drain pending outbox events with retries.
export const sweepOutbox = async (): Promise<number> => {
  return await processOutbox();
};

// Requeue FAILED events that hit the retry cap so the next drain retries them.
export const sweepFailedOutbox = async (): Promise<number> => {
  return await requeueFailedEvents();
};

// Erase chat history and session keys past the retention window.
export const sweepChatRetention = async (): Promise<void> => {
  const { messagesDeleted, keysDeleted } = await sweepExpiredChatData();

  if (messagesDeleted || keysDeleted) {
    logger.info(`[scheduler] chat retention erased ${messagesDeleted} message(s) and ${keysDeleted} session key(s)`);
  }
};

const timers: ReturnType<typeof setInterval>[] = [];

export const startSchedulers = (): void => {
  const negotiationTimer = setInterval(() => {
    void sweepExpiredNegotiations().catch((error) => logger.error("[scheduler] negotiation sweep failed", error));
  }, 60_000);

  const insightsTimer = setInterval(() => {
    void sweepViewInsights().catch((error) => logger.error("[scheduler] view insights failed", error));
  }, viewInsightsIntervalMs());

  const outboxTimer = setInterval(() => {
    void sweepOutbox().catch((error) => logger.error("[scheduler] outbox sweep failed", error));
  }, 30_000);

  const retentionTimer = setInterval(() => {
    void sweepChatRetention().catch((error) => logger.error("[scheduler] chat retention sweep failed", error));
  }, 60 * 60_000);

  timers.push(negotiationTimer, insightsTimer, outboxTimer, retentionTimer);
};

export const stopSchedulers = (): void => {
  for (const timer of timers) clearInterval(timer);
  timers.length = 0;
};
