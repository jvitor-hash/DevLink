import { message } from "@/database/schema/message_schema";
import { crud } from "@/modules/crud_factory";
import { eq, and, desc } from "drizzle-orm";
import { db } from "@/client";

export const MessageService = {
  ...crud(message),

  /**
   * Find all messages for a specific user (as sender or recipient via project)
   */
  findAllByUser: async (userId: string, limit = 10, offset = 0) => {
    if (limit < 1 || limit > 100) throw new Error("Limit must be between 1 and 100");
    if (offset < 0) throw new Error("Offset must be >= 0");

    const rows = await db
      .select()
      .from(message)
      .where(eq(message.senderId, userId))
      .orderBy(desc(message.createdAt))
      .limit(limit)
      .offset(offset);

    return rows as typeof message.$inferSelect[];
  },
};
