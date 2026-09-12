import { schemas } from "@/database/schema";
import { crud } from "@/modules/crud_factory";
import { and, eq, inArray, type SQL } from "drizzle-orm";

export const ProjectService = {
  ...crud(schemas.project),

  /**
   * Filter projects by the saved status and the requested filter criteria.
   */
  findFiltered: async (
    userId: string | null,
    filters: {
      audience?: string;
      platforms?: string[];
      primaryLanguage?: string;
      status?: string;
      minBudget?: number;
      maxBudget?: number;
      savedOnly?: boolean;
    },
    limit = 10,
    offset = 0,
  ) => {
    if (limit < 1 || limit > 100) throw new Error("Limit must be between 1 and 100");
    if (offset < 0) throw new Error("Offset must be >= 0");

    const conditions: SQL<unknown>[] = [];

    if (filters.audience && filters.audience !== "ALL") {
      conditions.push(eq(schemas.project.audience, filters.audience));
    }

    if (filters.platforms && filters.platforms.length) {
      conditions.push(eq(schemas.project.platforms, filters.platforms));
    }

    if (filters.primaryLanguage && filters.primaryLanguage !== "ALL") {
      conditions.push(eq(schemas.project.primaryLanguage, filters.primaryLanguage));
    }

    if (filters.status && filters.status !== "ALL") {
      conditions.push(eq(schemas.project.status, filters.status));
    }

    if (filters.minBudget != null && filters.minBudget >= 0) {
      conditions.push(schemas.project.minBudget.gte(filters.minBudget));
    }

    if (filters.maxBudget != null && filters.maxBudget >= 0) {
      conditions.push(schemas.project.maxBudget.lte(filters.maxBudget));
    }

    if (filters.savedOnly && userId) {
      const savedIds = await SavedTicketService.findSavedProjectIdsByUser(userId);
      if (!savedIds.length) {
        return [];
      }
      conditions.push(inArray(schemas.project.id, savedIds));
    }

    const where = conditions.length ? and(...conditions) : undefined;

    const rows = await db.select().from(schemas.project).where(where!).limit(limit).offset(offset);
    return rows as typeof schemas.project.$inferSelect[];
  },
};

import { db } from "@/client";
import { SavedTicketService } from "../saved_ticket/service";
