import { schemas } from "@/database/schema";
import { crud } from "@/modules/crud_factory";
import { and, asc, eq, sql, type SQL } from "drizzle-orm";
import { db } from "@/client";

const base = crud(schemas.ticket);

// Where clause restricting tickets to a project's client/assigned programmer.
const participantWhere = (projectId: string, userId: string): SQL<unknown> =>
  and(
    eq(schemas.ticket.projectId, projectId),
    sql`(
      ${schemas.project.clientId} = ${userId}
      OR ${schemas.project.programmerId} = ${userId}
    )`,
  ) as SQL<unknown>;

export const TicketService = {
  ...base,

  // All tickets across projects where the user is client or assigned programmer.
  findAllByUser: async (userId: string, limit = 10, offset = 0) => {
    if (limit < 1 || limit > 100) throw new Error("Limit must be between 1 and 100");
    if (offset < 0) throw new Error("Offset must be >= 0");

    const rows = await db
      .select({ ticketItem: schemas.ticket })
      .from(schemas.ticket)
      .innerJoin(schemas.project, eq(schemas.ticket.projectId, schemas.project.id))
      .where(
        sql`(
          ${schemas.project.clientId} = ${userId}
          OR ${schemas.project.programmerId} = ${userId}
        )`,
      )
      .orderBy(asc(schemas.ticket.position), asc(schemas.ticket.createdAt))
      .limit(limit)
      .offset(offset);

    return rows.map((row) => row.ticketItem);
  },

  findAllByProject: async (projectId: string, userId: string) => {
    const rows = await db
      .select({ ticketItem: schemas.ticket })
      .from(schemas.ticket)
      .innerJoin(schemas.project, eq(schemas.ticket.projectId, schemas.project.id))
      .where(participantWhere(projectId, userId))
      .orderBy(asc(schemas.ticket.position), asc(schemas.ticket.createdAt));

    return rows.map((row) => row.ticketItem);
  },

  createForProject: async (data: { projectId: string; creatorId: string; title: string; description?: string | null; status?: "BACKLOG" | "IN_PROGRESS" | "REVIEW" | "DONE"; assigneeId?: string | null }) => {
    const project = await db
      .select({ id: schemas.project.id })
      .from(schemas.project)
      .where(
        and(
          eq(schemas.project.id, data.projectId),
          sql`(
            ${schemas.project.clientId} = ${data.creatorId}
            OR ${schemas.project.programmerId} = ${data.creatorId}
          )`,
        ),
      )
      .limit(1);

    if (!project.length) throw new Error("Project not found or unauthorized");

    const [{ nextPosition }] = await db
      .select({
        nextPosition: sql<number>`coalesce(max(${schemas.ticket.position}), -1) + 1`,
      })
      .from(schemas.ticket)
      .where(
        data.status === "DONE"
          ? and(eq(schemas.ticket.projectId, data.projectId), eq(schemas.ticket.status, "DONE"))
          : eq(schemas.ticket.projectId, data.projectId),
      );

    return base.create({
      projectId: data.projectId,
      creatorId: data.creatorId,
      assigneeId: data.assigneeId ?? null,
      title: data.title,
      description: data.description ?? null,
      status: data.status ?? "BACKLOG",
      position: nextPosition,
    });
  },

  updateForUser: async (ticketId: string, userId: string, data: { title?: string; description?: string | null; status?: "BACKLOG" | "IN_PROGRESS" | "REVIEW" | "DONE"; position?: number; assigneeId?: string | null }) => {
    return base.update(
      and(
        eq(schemas.ticket.id, ticketId),
        sql`(
          ${schemas.project.clientId} = ${userId}
          OR ${schemas.project.programmerId} = ${userId}
        )`,
      ) as SQL<unknown>,
      data,
    );
  },

  removeForUser: async (ticketId: string, userId: string) => {
    return base.remove(
      and(
        eq(schemas.ticket.id, ticketId),
        sql`(
          ${schemas.project.clientId} = ${userId}
          OR ${schemas.project.programmerId} = ${userId}
        )`,
      ) as SQL<unknown>,
    );
  },

  // Live kanban counters per project grouped by status.
  countByProjects: async (projectIds: string): Promise<Record<string, Record<string, number>>> => {
    const ids = projectIds.split(",").map((id) => id.trim()).filter((id) => id.length > 0);
    if (!ids.length) return {};

    const rows = await db
      .select({
        projectId: schemas.ticket.projectId,
        status: schemas.ticket.status,
        total: sql<number>`count(*)::int`,
      })
      .from(schemas.ticket)
      .where(sql`${schemas.ticket.projectId} in ${ids}`)
      .groupBy(schemas.ticket.projectId, schemas.ticket.status);

    const counts: Record<string, Record<string, number>> = {};
    for (const row of rows) {
      counts[row.projectId] = { ...(counts[row.projectId] ?? {}), [row.status]: row.total };
    }
    return counts;
  },
};
