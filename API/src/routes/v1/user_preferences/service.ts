import { schemas } from "@/database/schema";
import { crud } from "@/modules/crud_factory";
import { eq, desc } from "drizzle-orm";
import { db } from "@/client";

export const UserPreferenceService = {
  ...crud(schemas.userPreference),

  /**
   * Find all preferences for a specific user (should be at most one)
   */
  findAllByUser: async (userId: string, limit = 10, offset = 0) => {
    if (limit < 1 || limit > 100) throw new Error("Limit must be between 1 and 100");
    if (offset < 0) throw new Error("Offset must be >= 0");

    const rows = await db
      .select()
      .from(schemas.userPreference)
      .where(eq(schemas.userPreference.userId, userId))
      .limit(limit)
      .offset(offset);

    return rows as typeof schemas.userPreference.$inferSelect[];
  },

  /**
   * Find the single preference of a user (null if none exists)
   */
  findByUser: async (userId: string) => {
    const rows = await db
      .select()
      .from(schemas.userPreference)
      .where(eq(schemas.userPreference.userId, userId))
      .limit(1);

    return (rows[0] ?? null) as typeof schemas.userPreference.$inferSelect | null;
  },

  /**
   * Update a user's preference or create it with defaults if missing
   */
  upsertByUser: async (userId: string, data: Partial<typeof schemas.userPreference.$inferInsert>) => {
    const [result] = await db
      .insert(schemas.userPreference)
      .values({ ...data, userId })
      .onConflictDoUpdate({
        target: schemas.userPreference.userId,
        set: { ...data, updatedAt: new Date() },
      })
      .returning();

    if (!result) {
      throw new Error("Failed to upsert user preference");
    }

    return result as typeof schemas.userPreference.$inferSelect;
  },
} 
