import { schemas } from "@/database/schema";
import { db } from "@/client";
import { eq, or, sql } from "drizzle-orm";
import type { InferInsertModel } from "drizzle-orm";

type NewPreference = typeof schemas.userPreference.$inferSelect;

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

  if (inserts.length) {
    await db.insert(schemas.notification).values(inserts);
  }
};
