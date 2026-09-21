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

  updateOwnProfile: async (
    userId: string,
    data: { name?: string; bio?: string | null; image?: string | null },
  ) => {
    const patch: Record<string, unknown> = {};

    if (data.name !== undefined) {
      const name = data.name.trim();
      if (name.length < 1 || name.length > 120) throw new Error("Name must be between 1 and 120 characters");
      patch.name = name;
    }

    if (data.bio !== undefined) {
      const bio = data.bio?.trim() ?? null;
      if (bio && bio.length > 500) throw new Error("Bio must be at most 500 characters");
      patch.bio = bio;
    }

    if (data.image !== undefined) {
      const image = data.image?.trim() ?? null;
      if (image && image.length > 2048) throw new Error("Image must be at most 2048 characters");
      patch.image = image;
    }

    if (Object.keys(patch).length === 0) throw new Error("No fields to update");

    const rows = await db
      .update(schemas.user)
      .set(patch)
      .where(eq(schemas.user.id, userId))
      .returning({
        id: schemas.user.id,
        name: schemas.user.name,
        bio: schemas.user.bio,
        image: schemas.user.image,
        role: schemas.user.role,
      });

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
