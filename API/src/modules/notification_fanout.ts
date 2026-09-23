import { schemas } from "@/database/schema";
import { db } from "@/client";
import { and, eq, inArray, isNull, or, sql } from "drizzle-orm";
import type { InferInsertModel } from "drizzle-orm";

type NewPreference = typeof schemas.userPreference.$inferSelect;

// Notification inserts for a user set, in a single batch.
const insertNotifications = async (
  inserts: InferInsertModel<typeof schemas.notification>[],
): Promise<void> => {
  if (!inserts.length) return;

  await db.insert(schemas.notification).values(inserts);
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
  deadline: Date | null;
  primaryLanguage: string;
  platforms: string[];
}): Promise<void> => {
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

  const inserts: InferInsertModel<typeof schemas.notification>[] = [];

  for (const { id } of users) {
    const preference = preferencesByUser.get(id);

    if (preference && !preference.project_notifications) continue;

    if (preference) {
      if (preference.language !== "ALL" && preference.language !== project.primaryLanguage) continue;

      if (preference.platform !== "ALL" && !project.platforms.includes(preference.platform)) continue;

      if (project.deadline) {
        const days = Math.ceil((project.deadline.getTime() - Date.now()) / 86_400_000);
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

  await insertNotifications(inserts);
};

/**
 * Inform the client that a programmer saved one of their projects.
 * Concluded projects must never generate notifications.
 */
export const notifyProjectSaved = async (project: typeof schemas.project.$inferSelect): Promise<void> => {
  if (project.status === "COMPLETED" || project.status === "CANCELLED") return;

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

  await insertNotifications(inserts);
};

/**
 * Periodic insight for clients about how their open projects are performing.
 * Only open (not concluded) projects are considered.
 */
export const notifyOpenProjectViews = async (sinceHours = 24): Promise<void> => {
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

  const inserts: InferInsertModel<typeof schemas.notification>[] = [];

  for (const project of openProjects) {
    const preferenceRows = await db
      .select()
      .from(schemas.userPreference)
      .where(eq(schemas.userPreference.userId, project.clientId))
      .limit(1);

    const preference = preferenceRows[0];
    if (preference && !preference.project_notifications) continue;

    const lastViewed = project.lastViewedAt ? new Date(project.lastViewedAt) : null;
    const viewedRecently = lastViewed !== null && Date.now() - lastViewed.getTime() <= sinceHours * 3_600_000;
    if (!viewedRecently) continue;

    inserts.push({
      userId: project.clientId,
      type: "PROJECT_UPDATE",
      title: "Seu projeto está recebendo visitas",
      message: `"${project.title}" acumulou ${project.viewTotalCount} visualização(ões). Última em ${lastViewed!.toLocaleString("pt-BR")}.`,
      projectId: project.id,
      isRead: false,
    });
  }

  await insertNotifications(inserts);
};
