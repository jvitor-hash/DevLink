import { schemas } from "@/database/schema";
import { crud } from "@/modules/crud_factory";
import { and, eq, gte, lte, inArray, sql, type SQL } from "drizzle-orm";

export const ProjectService = {
  ...crud(schemas.project),

  findFiltered: async (
    userId: string | null,
    filters: {
      audience?: string;
      platforms?: string[];
      primaryLanguage?: string;
      status?: string;
      minBudget?: number;
      maxBudget?: number;
      q?: string;
      clientId?: string;
      savedOnly?: boolean;
    },
    limit = 10,
    offset = 0,
  ) => {
    if (limit < 1 || limit > 100) throw new Error("Limit must be between 1 and 100");
    if (offset < 0) throw new Error("Offset must be >= 0");

    const conditions: SQL<unknown>[] = [];

    if (filters.audience && filters.audience !== "ALL") {
      conditions.push(sql`${schemas.project.audience}::text = ${filters.audience}`);
    }

    if (filters.platforms && filters.platforms.length) {
      conditions.push(
        sql`${schemas.project.platforms} && ARRAY[${sql.join(filters.platforms.map((platform) => sql`${platform}`), sql`, `)}]::text[]`,
      );
    }

    if (filters.primaryLanguage && filters.primaryLanguage !== "ALL") {
      conditions.push(sql`${schemas.project.primaryLanguage}::text = ${filters.primaryLanguage}`);
    }

    if (filters.status && filters.status !== "ALL") {
      conditions.push(sql`${schemas.project.status}::text = ${filters.status}`);
    }

    if (filters.q) {
      const term = `%${filters.q}%`;
      conditions.push(
        sql`(${schemas.project.title} ILIKE ${term} OR ${schemas.project.description} ILIKE ${term} OR ${schemas.project.category} ILIKE ${term})`,
      );
    }

    if (filters.clientId) {
      conditions.push(eq(schemas.project.clientId, filters.clientId));
    }

    if (filters.minBudget != null && filters.minBudget >= 0) {
      conditions.push(gte(schemas.project.minBudget, filters.minBudget));
    }

    if (filters.maxBudget != null && filters.maxBudget >= 0) {
      conditions.push(lte(schemas.project.maxBudget, filters.maxBudget));
    }

    if (filters.savedOnly && userId) {
      const savedIds = await SavedTicketService.findSavedProjectIdsByUser(userId);
      if (!savedIds.length) {
        return [];
      }
      conditions.push(inArray(schemas.project.id, savedIds));
    }

    const where = conditions.length ? and(...conditions) : undefined;

    const rows = await db.select().from(schemas.project).where(where).limit(limit).offset(offset);
    return rows as typeof schemas.project.$inferSelect[];
  },

  countProjectsByClients: async (clientIds: string): Promise<Record<string, number>> => {
    const ids = clientIds.split(",").map((id) => id.trim()).filter((id) => id.length > 0);
    if (!ids.length) return {};

    const rows = await db
      .select({ clientId: schemas.project.clientId, total: sql<number>`count(*)::int` })
      .from(schemas.project)
      .where(inArray(schemas.project.clientId, ids))
      .groupBy(schemas.project.clientId);

    const counts: Record<string, number> = {};
    for (const row of rows) {
      counts[row.clientId] = row.total;
    }
    return counts;
  },
};

import { db } from "@/client";
import { SavedTicketService } from "../saved_ticket/service";
