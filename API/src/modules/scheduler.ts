import { schemas } from "@/database/schema";
import { db } from "@/client";
import { and, eq, inArray, isNull, sql } from "drizzle-orm";
import { processOutbox, publishNotificationEvent } from "@/modules/notification_outbox";
import { negotiationTimeoutMs, viewInsightsIntervalMs } from "@/modules/app_config";
import { isNegotiationExpired } from "@/modules/project_status";
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

  timers.push(negotiationTimer, insightsTimer, outboxTimer);
};

export const stopSchedulers = (): void => {
  for (const timer of timers) clearInterval(timer);
  timers.length = 0;
};
