import { schemas } from "@/database/schema";
import { crud } from "@/infrastructure/database/crud_factory";
import { db } from "@/client";
import { and, desc, eq } from "drizzle-orm";
import type { NotificationUpdate } from "@/database/data-transfer-object/notification_dto";

export const NotificationRepository = {
  ...crud(schemas.notification),

  findAllByUser: async (userId: string, limit = 50, offset = 0): Promise<typeof schemas.notification.$inferSelect[]> => {
    return await db
      .select()
      .from(schemas.notification)
      .where(eq(schemas.notification.userId, userId))
      .orderBy(desc(schemas.notification.createdAt))
      .limit(limit)
      .offset(offset);
  },

  updateForUser: async (
    id: string,
    userId: string,
    data: NotificationUpdate
  ): Promise<typeof schemas.notification.$inferSelect | undefined> => {
    const [updated] = await db
      .update(schemas.notification)
      .set(data)
      .where(and(eq(schemas.notification.id, id), eq(schemas.notification.userId, userId)))
      .returning();

    return updated;
  },

  markAllAsReadForUser: async (userId: string): Promise<{ success: boolean }> => {
    await db
      .update(schemas.notification)
      .set({ isRead: true })
      .where(and(eq(schemas.notification.userId, userId), eq(schemas.notification.isRead, false)));

    return { success: true };
  },
};
