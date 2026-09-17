import { schemas } from "@/database/schema";
import { crud } from "@/modules/crud_factory";
import { eq, and, desc, inArray, sql, type SQL } from "drizzle-orm";
import { db } from "@/client";

const base = crud(schemas.savedTicket);

export const SavedTicketService = {
  ...base,

  /**
   * Create a saved ticket and bump the project save counter.
   */
  createForUser: async (data: { userId: string; projectId: string }) => {
    const ticket = await base.create(data);

    await db
      .update(schemas.project)
      .set({ saveTotalCount: sql`${schemas.project.saveTotalCount} + 1` })
      .where(eq(schemas.project.id, data.projectId));

    return ticket;
  },

  /**
   * Remove a saved ticket owned by the user and decrease the project save counter.
   */
  removeForUser: async (ticketId: string, userId: string) => {
    const deleted = await base.remove(
      and(eq(schemas.savedTicket.id, ticketId), eq(schemas.savedTicket.userId, userId)) as SQL<unknown>
    );

    await db
      .update(schemas.project)
      .set({ saveTotalCount: sql`GREATEST(${schemas.project.saveTotalCount} - 1, 0)` })
      .where(eq(schemas.project.id, deleted.projectId));

    return deleted;
  },

  /**
   * List saved project ids for a given user.
   */
  findSavedProjectIdsByUser: async (userId: string) => {
    const rows = await base.findWhere(eq(schemas.savedTicket.userId, userId));
    return rows.map((row) => row.projectId);
  },

  /**
   * Find all saved tickets for a specific user
   */
  findAllByUser: async (userId: string, limit = 10, offset = 0) => {
    if (limit < 1 || limit > 100) throw new Error("Limit must be between 1 and 100");
    if (offset < 0) throw new Error("Offset must be >= 0");

    const rows = await db
      .select()
      .from(schemas.savedTicket)
      .where(eq(schemas.savedTicket.userId, userId))
      .orderBy(desc(schemas.savedTicket.createdAt))
      .limit(limit)
      .offset(offset);

    return rows as typeof schemas.savedTicket.$inferSelect[];
  },

  /**
   * Count saved tickets per project id.
   */
  countByProjects: async (projectIds: string): Promise<Record<string, number>> => {
    const ids = projectIds.split(",").map((id) => id.trim()).filter((id) => id.length > 0);
    if (!ids.length) return {};

    const rows = await db
      .select({ projectId: schemas.savedTicket.projectId, total: sql<number>`count(*)::int` })
      .from(schemas.savedTicket)
      .where(inArray(schemas.savedTicket.projectId, ids))
      .groupBy(schemas.savedTicket.projectId);

    const counts: Record<string, number> = {};
    for (const row of rows) {
      counts[row.projectId] = row.total;
    }
    return counts;
  },
};
