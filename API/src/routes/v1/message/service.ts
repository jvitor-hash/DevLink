import { schemas } from "@/database/schema";
import { crud } from "@/modules/crud_factory";
import { isProjectConcluded, offerResponseProjectPatch } from "@/modules/project_status";
import { and, asc, desc, eq, gt, or, sql, type SQL } from "drizzle-orm";
import { db } from "@/client";

const base = crud(schemas.message);

const participantWhere = (projectId: string, userId: string): SQL<unknown> =>
  and(
    eq(schemas.message.projectId, projectId),
    sql`(
      ${schemas.project.clientId} = ${userId}
      OR ${schemas.project.programmerId} = ${userId}
    )`,
  ) as SQL<unknown>;

type MessageUpdateData = {
  content?: string;
  isRead?: boolean;
  offerStatus?: "PENDING" | "ACCEPTED" | "REJECTED";
};

export const MessageService = {
  ...base,

  // All messages across projects where the user is client or assigned programmer.
  findAllByUser: async (userId: string, limit = 50, offset = 0) => {
    if (limit < 1 || limit > 100) throw new Error("Limit must be between 1 and 100");
    if (offset < 0) throw new Error("Offset must be >= 0");

    const rows = await db
      .select({ message: schemas.message })
      .from(schemas.message)
      .innerJoin(schemas.project, eq(schemas.message.projectId, schemas.project.id))
      .where(
        sql`(
          ${schemas.project.clientId} = ${userId}
          OR ${schemas.project.programmerId} = ${userId}
        )`,
      )
      .orderBy(desc(schemas.message.createdAt))
      .limit(limit)
      .offset(offset);

    return rows.map((row) => row.message);
  },

  // Chat history for a project; only participants (client or programmer) can read it.
  findAllByProject: async (projectId: string, userId: string, limit = 50, offset = 0) => {
    if (limit < 1 || limit > 100) throw new Error("Limit must be between 1 and 100");
    if (offset < 0) throw new Error("Offset must be >= 0");

    const rows = await db
      .select({ message: schemas.message })
      .from(schemas.message)
      .innerJoin(schemas.project, eq(schemas.message.projectId, schemas.project.id))
      .where(participantWhere(projectId, userId))
      .orderBy(asc(schemas.message.createdAt))
      .limit(limit)
      .offset(offset);

    return rows.map((row) => row.message);
  },

  // Messages created after a timestamp, for catching up missed realtime traffic.
  findSince: async (projectId: string, userId: string, after: Date) => {
    const rows = await db
      .select({ message: schemas.message })
      .from(schemas.message)
      .innerJoin(schemas.project, eq(schemas.message.projectId, schemas.project.id))
      .where(and(participantWhere(projectId, userId), gt(schemas.message.createdAt, after)))
      .orderBy(asc(schemas.message.createdAt));

    return rows.map((row) => row.message);
  },

  createForProject: async (data: { projectId: string; senderId: string; content: string; offerDeadline?: string | null }) => {
    const project = await db
      .select()
      .from(schemas.project)
      .where(
        and(
          eq(schemas.project.id, data.projectId),
          sql`(
            ${schemas.project.clientId} = ${data.senderId}
            OR ${schemas.project.programmerId} = ${data.senderId}
          )`,
        ),
      )
      .limit(1);

    if (!project.length) throw new Error("Project not found or unauthorized");

    // Only programmers may send negotiation offers.
    if (data.offerDeadline) {
      const senderRole = await db
        .select({ role: schemas.user.role })
        .from(schemas.user)
        .where(eq(schemas.user.id, data.senderId))
        .limit(1);

      if (senderRole[0]?.role !== "PROGRAMMER") throw new Error("Only programmers can send offers");
    }

    return base.create({
      projectId: data.projectId,
      senderId: data.senderId,
      content: data.content,
      isRead: false,
      offerDeadline: data.offerDeadline ? new Date(data.offerDeadline) : null,
      offerStatus: data.offerDeadline ? "PENDING" : null,
    });
  },

  updateForUser: async (messageId: string, userId: string, data: MessageUpdateData) => {
    const allowed = await db
      .select({ id: schemas.message.id })
      .from(schemas.message)
      .innerJoin(schemas.project, eq(schemas.message.projectId, schemas.project.id))
      .where(
        and(
          eq(schemas.message.id, messageId),
          sql`(
            ${schemas.project.clientId} = ${userId}
            OR ${schemas.project.programmerId} = ${userId}
          )`,
        ),
      )
      .limit(1);

    if (!allowed.length) throw new Error("Message not found or unauthorized");

    const updated = await base.update(eq(schemas.message.id, messageId), data);

    // An offer decision drives the project state machine; failures must not
    // break the message update itself.
    if (data.offerStatus === "ACCEPTED" || data.offerStatus === "REJECTED") {
      try {
        const project = await db
          .select()
          .from(schemas.project)
          .where(eq(schemas.project.id, updated.projectId))
          .limit(1);

        if (project.length) {
          const patch = offerResponseProjectPatch(project[0].status, data.offerStatus);

          if (patch) {
            await db
              .update(schemas.project)
              .set({
                status: patch.status,
                negotiationStartedAt: patch.negotiationStartedAt,
              })
              .where(eq(schemas.project.id, project[0].id));
          }
        }
      } catch {
        // Offer state transition is best-effort.
      }
    }

    return updated;
  },

  findUnreadCountByProject: async (projectId: string, userId: string) => {
    const rows = await db
      .select({ count: sql<number>`count(*)::int` })
      .from(schemas.message)
      .innerJoin(schemas.project, eq(schemas.message.projectId, schemas.project.id))
      .where(
        and(
          participantWhere(projectId, userId),
          eq(schemas.message.isRead, false),
          or(
            sql`${schemas.project.clientId} = ${userId}`,
            sql`${schemas.project.programmerId} = ${userId}`,
          ),
        ),
      );

    return rows[0]?.count ?? 0;
  },
};

// Concluded projects must not accept new chat activity through this service.
export const assertProjectOpenForChat = async (projectId: string): Promise<boolean> => {
  const rows = await db
    .select({ status: schemas.project.status })
    .from(schemas.project)
    .where(eq(schemas.project.id, projectId))
    .limit(1);

  return rows.length > 0 && !isProjectConcluded(rows[0].status);
};
