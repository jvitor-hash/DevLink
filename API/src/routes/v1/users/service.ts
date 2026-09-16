import { schemas } from "@/database/schema";
import { and, desc, eq, ilike, sql, type SQL } from "drizzle-orm";
import { db } from "@/client";

export const UserService = {
  /**
   * Search users by name. Empty term returns the most recently active users.
   */
  search: async (term: string, role: string | undefined, limit = 10, offset = 0) => {
    if (limit < 1 || limit > 100) throw new Error("Limit must be between 1 and 100");
    if (offset < 0) throw new Error("Offset must be >= 0");

    const conditions: SQL<unknown>[] = [];
    const trimmed = term.trim();

    if (trimmed.length > 0) {
      conditions.push(ilike(schemas.user.name, `%${trimmed}%`));
    }
    if (role && role !== "ALL") {
      conditions.push(sql`${schemas.user.role}::text = ${role}`);
    }

    const where = conditions.length ? and(...conditions) : undefined;

    const rows = await db
      .select({
        id: schemas.user.id,
        name: schemas.user.name,
        bio: schemas.user.bio,
        image: schemas.user.image,
        role: schemas.user.role,
      })
      .from(schemas.user)
      .where(where)
      .orderBy(desc(schemas.user.updatedAt))
      .limit(limit)
      .offset(offset);

    return rows;
  },

  findById: async (userId: string) => {
    const rows = await db
      .select({
        id: schemas.user.id,
        name: schemas.user.name,
        bio: schemas.user.bio,
        image: schemas.user.image,
        role: schemas.user.role,
      })
      .from(schemas.user)
      .where(eq(schemas.user.id, userId))
      .limit(1);

    return rows[0];
  },

  /**
   * Clients ranked by published project count.
   */
  findProminentClients: async (limit = 5) => {
    if (limit < 1 || limit > 50) throw new Error("Limit must be between 1 and 50");

    const rows = await db
      .select({
        id: schemas.user.id,
        name: schemas.user.name,
        bio: schemas.user.bio,
        image: schemas.user.image,
        role: schemas.user.role,
        projectCount: sql<number>`count(${schemas.project.id})::int`,
      })
      .from(schemas.user)
      .innerJoin(schemas.project, eq(schemas.project.clientId, schemas.user.id))
      .where(sql`${schemas.user.role}::text = 'CLIENT'`)
      .groupBy(
        schemas.user.id,
        schemas.user.name,
        schemas.user.bio,
        schemas.user.image,
        schemas.user.role,
      )
      .orderBy(desc(sql`count(${schemas.project.id})`))
      .limit(limit);

    return rows;
  },
};
