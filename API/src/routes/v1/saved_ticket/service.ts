import { schemas } from "@/database/schema";
import { crud } from "@/modules/crud_factory";
import { eq, and, desc } from "drizzle-orm";
import { db } from "@/client";

export const SavedTicketService = {
  ...crud(schemas.savedTicket),

  /**
   * List saved project ids for a given user.
   */
  findSavedProjectIdsByUser: async (userId: string) => {
    const rows = await crud(schemas.savedTicket).findWhere(eq(schemas.savedTicket.userId, userId));
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
};
