import { schemas } from "@/database/schema";
import { crud } from "@/modules/crud_factory";
import { eq, and, desc } from "drizzle-orm";
import { db } from "@/client";

export const NotificationService = {
  ...crud(schemas.notification),

  /**
   * Find all notifications for a specific user
   */
  findAllByUser: async (userId: string, limit = 10, offset = 0) => {
    if (limit < 1 || limit > 100) throw new Error("Limit must be between 1 and 100");
    if (offset < 0) throw new Error("Offset must be >= 0");

    const rows = await db
      .select()
      .from(schemas.notification)
      .where(eq(schemas.notification.userId, userId))
      .orderBy(desc(schemas.notification.createdAt))
      .limit(limit)
      .offset(offset);

    return rows as typeof schemas.notification.$inferSelect[];
  },
} 
