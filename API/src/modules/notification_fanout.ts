import { schemas } from "@/database/schema";
import { db } from "@/client";
import { and, eq, inArray, isNull, or, sql } from "drizzle-orm";
import type { InferInsertModel } from "drizzle-orm";
import { notifyUserSockets } from "@/modules/websocket_notifications";

type NewPreference = typeof schemas.userPreference.$inferSelect;

const MAX_FAN_OUT_USERS = 1000;

// Insert notifications; identical payloads for the same user/aggregate are
// ignored so outbox retries never duplicate records.
const insertNotifications = async (
  inserts: InferInsertModel<typeof schemas.notification>[],
  outboxId: string | null,
): Promise<void> => {
  if (!inserts.length) return;

  const pushCreated = (rows: InferInsertModel<typeof schemas.notification>[]): void => {
    for (const row of rows) {
      if (row.userId) notifyUserSockets(row.userId, { ...row, createdAt: new Date().toISOString() });
    }
  };

  if (outboxId) {
    const created = await db.insert(schemas.notification).values(inserts).onConflictDoNothing({
      target: [schemas.notification.userId, schemas.notification.outboxId],
    }).returning();
    pushCreated(created);
    return;
  }

  const created = await db.insert(schemas.notification).values(inserts).returning();
  pushCreated(created);
};

/**
 * Notify programmers about a newly published project, respecting each user's
 * notification preferences (toggle, language, platform, deadline, budget).
 */
export const notifyNewProject = async (project: {
  id: string;
  title: string;
  minBudget: number;
  maxBudget: number;
  deadline: Date | string | null;
  primaryLanguage: string;
  platforms: string[];
}, outboxId: string | null = null): Promise<void> => {
  const users = await db
    .select({ id: schemas.user.id })
    .from(schemas.user)
    .where(sql`${schemas.user.role}::text = 'PROGRAMMER'`);

  if (!users.length) return;

  const preferenceRows = await db
    .select()
    .from(schemas.userPreference)
    .where(or(...users.map((u) => eq(schemas.userPreference.userId, u.id))));

  const preferencesByUser = new Map<string, NewPreference>();
  for (const preference of preferenceRows) {
    preferencesByUser.set(preference.userId, preference);
  }

  const deadline = project.deadline ? new Date(project.deadline) : null;

  const inserts: InferInsertModel<typeof schemas.notification>[] = [];

  for (const { id } of users) {
    const preference = preferencesByUser.get(id);

    if (preference && !preference.project_notifications) continue;

    if (preference) {
      if (preference.language !== "ALL" && preference.language !== project.primaryLanguage) continue;

      if (preference.platform !== "ALL" && !project.platforms.includes(preference.platform)) continue;

      if (deadline) {
        const days = Math.ceil((deadline.getTime() - Date.now()) / 86_400_000);
        if (days > Number(preference.maxDeadlineDays)) continue;
      }

      if (preference.maxBudget > 0 && project.maxBudget > preference.maxBudget) continue;
      if (preference.minBudget > 0 && project.minBudget < preference.minBudget) continue;
    }

    inserts.push({
      userId: id,
      type: "NEW_PROJECT",
      title: "Novo projeto publicado",
      message: `${project.title} - R$ ${project.minBudget} a R$ ${project.maxBudget}`,
      projectId: project.id,
      isRead: false,
    });
  }

  if (inserts.length > MAX_FAN_OUT_USERS) {
    inserts.length = MAX_FAN_OUT_USERS;
  }

  await insertNotifications(inserts, outboxId);
};

/**
 * Inform the client that a programmer saved one of their projects.
 * Publishers must skip concluded projects before enqueuing the event.
 */
export const notifyProjectSaved = async (project: {
  id: string;
  title: string;
  saveTotalCount: number;
  clientId: string;
}, outboxId: string | null = null): Promise<void> => {
  const preferenceRows = await db
    .select()
    .from(schemas.userPreference)
    .where(eq(schemas.userPreference.userId, project.clientId))
    .limit(1);

  const preference = preferenceRows[0];
  if (preference && !preference.project_notifications) return;

  const inserts: InferInsertModel<typeof schemas.notification>[] = [
    {
      userId: project.clientId,
      type: "TICKET_SAVED",
      title: "Projeto salvo",
      message: `Um programador salvou o seu projeto "${project.title}" (${project.saveTotalCount} salvamento(s) no total).`,
      projectId: project.id,
      isRead: false,
    },
  ];

  await insertNotifications(inserts, outboxId);
};

/**
 * View insight for a single project; only projects viewed recently are
 * considered and concluded projects never generate notifications.
 */
export const notifyProjectViews = async (project: {
  id: string;
  title: string;
  viewTotalCount: number;
  lastViewedAt: string | null;
  clientId: string;
}, outboxId: string | null = null, sinceHours = 24): Promise<void> => {
  const preferenceRows = await db
    .select()
    .from(schemas.userPreference)
    .where(eq(schemas.userPreference.userId, project.clientId))
    .limit(1);

  const preference = preferenceRows[0];
  if (preference && !preference.project_notifications) return;

  const lastViewed = project.lastViewedAt ? new Date(project.lastViewedAt) : null;
  const viewedRecently = lastViewed !== null && Date.now() - lastViewed.getTime() <= sinceHours * 3_600_000;
  if (!viewedRecently) return;

  const inserts: InferInsertModel<typeof schemas.notification>[] = [
    {
      userId: project.clientId,
      type: "PROJECT_UPDATE",
      title: "Seu projeto está recebendo visitas",
      message: `"${project.title}" acumulou ${project.viewTotalCount} visualização(ões). Última em ${lastViewed!.toLocaleString("pt-BR")}.`,
      projectId: project.id,
      isRead: false,
    },
  ];

  await insertNotifications(inserts, outboxId);
};

/**
 * Periodic insight for clients about how their open projects are performing.
 * Only open (not concluded) projects are considered.
 */
export const notifyOpenProjectViews = async (sinceHours = 24, outboxId: string | null = null): Promise<void> => {
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

  if (!openProjects.length) return;

  for (const project of openProjects) {
    await notifyProjectViews({
      id: project.id,
      title: project.title,
      viewTotalCount: project.viewTotalCount,
      lastViewedAt: project.lastViewedAt ? new Date(project.lastViewedAt).toISOString() : null,
      clientId: project.clientId,
    }, outboxId, sinceHours);
  }
};
