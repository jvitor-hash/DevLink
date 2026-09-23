import { schemas } from "@/database/schema";
import { db } from "@/client";
import { logger } from "@/modules/logger";
import { negotiationTimeoutMs, viewInsightsIntervalMs } from "@/modules/app_config";
import { isNegotiationExpired } from "@/modules/project_status";
import { notifyOpenProjectViews } from "@/modules/notification_fanout";
import { eq, inArray } from "drizzle-orm";

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
export const sweepViewInsights = async (): Promise<void> => {
  await notifyOpenProjectViews();
};

const timers: ReturnType<typeof setInterval>[] = [];

export const startSchedulers = (): void => {
  const negotiationTimer = setInterval(() => {
    void sweepExpiredNegotiations().catch((error) => logger.error("[scheduler] negotiation sweep failed", error));
  }, 60_000);

  const insightsTimer = setInterval(() => {
    void sweepViewInsights().catch((error) => logger.error("[scheduler] view insights failed", error));
  }, viewInsightsIntervalMs());

  timers.push(negotiationTimer, insightsTimer);
};

export const stopSchedulers = (): void => {
  for (const timer of timers) clearInterval(timer);
  timers.length = 0;
};
