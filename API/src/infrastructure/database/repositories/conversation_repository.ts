import { schemas } from "@/database/schema";
import { crud } from "@/infrastructure/database/crud_factory";
import { db } from "@/client";
import { eq, inArray, or } from "drizzle-orm";
import type { InferInsertModel } from "drizzle-orm";

export const ConversationRepository = {
    ...crud(schemas.conversation),
    findById: async (id: string) => (await db.select().from(schemas.conversation).where(eq(schemas.conversation.id, id)).limit(1))[0],
    listForUser: async (userId: string, role: string, projectId?: string) => {
      if (role === "CLIENT") {
        const projects = await db.select({ id: schemas.project.id }).from(schemas.project).where(eq(schemas.project.clientId, userId));
        const ids = projects.map(({ id }) => id).filter((id) => !projectId || id === projectId);
        return ids.length ? db.select().from(schemas.conversation).where(inArray(schemas.conversation.projectId, ids)) : [];
      }
      if (role === "PROGRAMMER") {
        const rows = await db.select().from(schemas.conversation).where(or(eq(schemas.conversation.userId, userId), eq(schemas.conversation.recipientId, userId)));
        return projectId ? rows.filter((item) => item.projectId === projectId) : rows;
      }
      return crud(schemas.conversation).findAll();
    },
    createForProgrammer: async (data: InferInsertModel<typeof schemas.conversation>) => {
      const [created] = await db.insert(schemas.conversation).values(data).returning();
      return created;
    },
    projectClient: async (projectId: string) => (await db.select({ clientId: schemas.project.clientId }).from(schemas.project).where(eq(schemas.project.id, projectId)).limit(1))[0],
};
