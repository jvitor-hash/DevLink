import { schemas } from "@/database/schema";
import { crud } from "@/modules/crud_factory";
import { eq, and } from "drizzle-orm";

export const SavedTicketService = {
  ...crud(schemas.savedTicket),

  /**
   * List saved project ids for a given user.
   */
  findSavedProjectIdsByUser: async (userId: string) => {
    const rows = await crud(schemas.savedTicket).findWhere(eq(schemas.savedTicket.userId, userId));
    return rows.map((row) => row.projectId);
  },
};
