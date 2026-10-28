import { db } from "@/client";
import { schemas } from "@/database/schema";
import { UserRoleEnum } from "@/database/data-transfer-object/enums";
import { and, eq, sql } from "drizzle-orm";
import { notificationEnabled } from "@/modules/notification_gate";

export const handleSaveProject = async (
  data: { userId: string; userRole: string; projectId: string } | string,
  maybeUserRole?: string,
  maybeProjectId?: string
): Promise<void> => {
  const userId = typeof data === "object" ? data.userId : data;
  const userRole = typeof data === "object" ? data.userRole : (maybeUserRole ?? "");
  const projectId = typeof data === "object" ? data.projectId : (maybeProjectId ?? "");

  // Only programmers may save projects.
  if (userRole !== UserRoleEnum.enum.PROGRAMMER) {
    return;
  }

  if (!userId || !projectId) {
    return;
  }

  await db.transaction(async (tx) => {
    // 2. Assign project to user
    const [existingProject] = await tx
      .select()
      .from(schemas.project)
      .where(eq(schemas.project.id, projectId))
      .limit(1);

    if (!existingProject) {
      return;
    }

    const [alreadySaved] = await tx
      .select()
      .from(schemas.saveProject)
      .where(and(eq(schemas.saveProject.userId, userId), eq(schemas.saveProject.projectId, projectId)))
      .limit(1);

    if (alreadySaved) {
      return;
    }

    await tx.insert(schemas.saveProject).values({
      userId,
      projectId,
    });

    await tx
      .update(schemas.project)
      .set({
        saveTotalCount: sql`${schemas.project.saveTotalCount} + 1`,
      })
      .where(eq(schemas.project.id, projectId));

    // 3. Create notification for project owner (retrieve from project id)
    if (await notificationEnabled(existingProject.clientId, "TICKET_SAVED")) await tx.insert(schemas.notification).values({
      userId: existingProject.clientId,
      type: "TICKET_SAVED",
      title: "Projeto salvo",
      message: `Um desenvolvedor salvou seu projeto "${existingProject.title}".`,
      projectId,
      isRead: false,
      archived: false,
    });
  });
};

export const handleUnsaveProject = async ({ userId, userRole, projectId }: { userId: string; userRole: string; projectId: string }): Promise<void> => {
  if (userRole !== UserRoleEnum.enum.PROGRAMMER || !userId || !projectId) return;

  await db.transaction(async (tx) => {
    const deleted = await tx.delete(schemas.saveProject)
      .where(and(eq(schemas.saveProject.userId, userId), eq(schemas.saveProject.projectId, projectId)))
      .returning({ id: schemas.saveProject.id });

    if (deleted.length) {
      await tx.update(schemas.project)
        .set({ saveTotalCount: sql`GREATEST(${schemas.project.saveTotalCount} - 1, 0)` })
        .where(eq(schemas.project.id, projectId));
    }
  });
};

