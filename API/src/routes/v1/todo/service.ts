import { schemas } from "@/database/schema";
import { crud } from "@/modules/crud_factory";
import { and, asc, eq, sql, type SQL } from "drizzle-orm";
import { db } from "@/client";

const base = crud(schemas.todo);

// Where clause restricting todos to a project's client/assigned programmer.
const participantWhere = (projectId: string, userId: string): SQL<unknown> =>
  and(
    eq(schemas.todo.projectId, projectId),
    sql`(
      ${schemas.project.clientId} = ${userId}
      OR ${schemas.project.programmerId} = ${userId}
    )`,
  ) as SQL<unknown>;

export const TodoService = {
  ...base,

  // All todos across projects where the user is client or assigned programmer.
  findAllByUser: async (userId: string, limit = 10, offset = 0) => {
    if (limit < 1 || limit > 100) throw new Error("Limit must be between 1 and 100");
    if (offset < 0) throw new Error("Offset must be >= 0");

    const rows = await db
      .select({ todoItem: schemas.todo })
      .from(schemas.todo)
      .innerJoin(schemas.project, eq(schemas.todo.projectId, schemas.project.id))
      .where(
        sql`(
          ${schemas.project.clientId} = ${userId}
          OR ${schemas.project.programmerId} = ${userId}
        )`,
      )
      .orderBy(asc(schemas.todo.createdAt))
      .limit(limit)
      .offset(offset);

    return rows.map((row) => row.todoItem);
  },

  findAllByProject: async (projectId: string, userId: string) => {
    const rows = await db
      .select({ todoItem: schemas.todo })
      .from(schemas.todo)
      .innerJoin(schemas.project, eq(schemas.todo.projectId, schemas.project.id))
      .where(participantWhere(projectId, userId))
      .orderBy(asc(schemas.todo.createdAt));

    return rows.map((row) => row.todoItem);
  },

  createForProject: async (data: { projectId: string; creatorId: string; title: string; description?: string | null }) => {
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

    return base.create({
      projectId: data.projectId,
      title: data.title,
      description: data.description ?? null,
    });
  },

  updateForUser: async (todoId: string, userId: string, data: { title?: string; description?: string | null; isDone?: boolean }) => {
    const allowed = await db
      .select({ id: schemas.todo.id })
      .from(schemas.todo)
      .innerJoin(schemas.project, eq(schemas.todo.projectId, schemas.project.id))
      .where(and(eq(schemas.todo.id, todoId), sql`(${schemas.project.clientId} = ${userId} OR ${schemas.project.programmerId} = ${userId})`))
      .limit(1);

    if (!allowed.length) throw new Error("Todo not found or unauthorized");

    return base.update(
      eq(schemas.todo.id, todoId),
      data,
    );
  },

  removeForUser: async (todoId: string, userId: string) => {
    const allowed = await db
      .select({ id: schemas.todo.id })
      .from(schemas.todo)
      .innerJoin(schemas.project, eq(schemas.todo.projectId, schemas.project.id))
      .where(and(eq(schemas.todo.id, todoId), sql`(${schemas.project.clientId} = ${userId} OR ${schemas.project.programmerId} = ${userId})`))
      .limit(1);

    if (!allowed.length) throw new Error("Todo not found or unauthorized");

    return base.remove(eq(schemas.todo.id, todoId));
  },

  // Live progress counters per project: total todos and how many are done.
  countByProjects: async (projectIds: string): Promise<Record<string, { total: number; done: number }>> => {
    const ids = projectIds.split(",").map((id) => id.trim()).filter((id) => id.length > 0);
    if (!ids.length) return {};

    const rows = await db
      .select({
        projectId: schemas.todo.projectId,
        total: sql<number>`count(*)::int`,
        done: sql<number>`count(*) filter (where ${schemas.todo.isDone})::int`,
      })
      .from(schemas.todo)
      .where(sql`${schemas.todo.projectId} in ${ids}`)
      .groupBy(schemas.todo.projectId);

    const counts: Record<string, { total: number; done: number }> = {};
    for (const row of rows) {
      counts[row.projectId] = { total: row.total, done: row.done };
    }
    return counts;
  },
};
