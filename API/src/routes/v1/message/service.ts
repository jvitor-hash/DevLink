import { message } from "@/database/schema/message_schema";
import { schemas } from "@/database/schema";
import { crud } from "@/modules/crud_factory";
import { eq, and, or, desc, ne, sql } from "drizzle-orm";
import { db } from "@/client";

export const MessageService = {
  ...crud(message),

  /**
   * Find a message by id, readable only by its sender or the project's
   * client/programmer participants.
   */
  findByIdForUser: async (messageId: string, userId: string) => {
    const rows = await db
      .select({ messageItem: message })
      .from(message)
      .innerJoin(schemas.project, eq(message.projectId, schemas.project.id))
      .where(
        and(
          eq(message.id, messageId),
          or(
            eq(message.senderId, userId),
            eq(schemas.project.clientId, userId),
            eq(schemas.project.programmerId, userId),
          ),
        ),
      )
      .limit(1);

    return rows[0]?.messageItem;
  },

  /**
   * Find all messages for a specific user (as sender or recipient via project)
   */
  findAllByUser: async (userId: string, limit = 10, offset = 0) => {
    if (limit < 1 || limit > 100) throw new Error("Limit must be between 1 and 100");
    if (offset < 0) throw new Error("Offset must be >= 0");

    const rows = await db
      .select()
      .from(message)
      .where(eq(message.senderId, userId))
      .orderBy(desc(message.createdAt))
      .limit(limit)
      .offset(offset);

    return rows as typeof message.$inferSelect[];
  },

  /**
   * List a project's message thread, oldest first. Only participants of the
   * project (client, assigned programmer, senders) may read the thread.
   */
  findAllByProject: async (projectId: string, userId: string, limit = 50, offset = 0) => {
    if (limit < 1 || limit > 100) throw new Error("Limit must be between 1 and 100");
    if (offset < 0) throw new Error("Offset must be >= 0");

    const rows = await db
      .select({ messageItem: message })
      .from(message)
      .innerJoin(schemas.project, eq(message.projectId, schemas.project.id))
      .where(
        and(
          eq(message.projectId, projectId),
          or(
            eq(message.senderId, userId),
            eq(schemas.project.clientId, userId),
            eq(schemas.project.programmerId, userId),
          ),
        ),
      )
      .orderBy(message.createdAt)
      .limit(limit)
      .offset(offset);

    return rows.map((row) => row.messageItem);
  },

  /**
   * Create a message; when it carries a negotiation offer the proposed
   * deadline is capped at the project's actual deadline and the other
   * participant is notified.
   */
  createWithOffer: async (data: {
    projectId: string;
    senderId: string;
    content: string;
    offerDeadline?: Date | string | null;
  }) => {
    const [project] = await db
      .select()
      .from(schemas.project)
      .where(
        and(
          eq(schemas.project.id, data.projectId),
          or(
            eq(schemas.project.clientId, data.senderId),
            eq(schemas.project.programmerId, data.senderId),
          ),
        ),
      )
      .limit(1);

    if (!project) throw new Error("Project not found or unauthorized");

    let cappedDeadline: Date | null = null;

    if (data.offerDeadline) {
      const proposed = new Date(data.offerDeadline);
      if (Number.isNaN(proposed.getTime())) throw new Error("Invalid offer deadline");

      if (!project.deadline || proposed > project.deadline) {
        cappedDeadline = project.deadline;
      } else {
        cappedDeadline = proposed;
      }
    }

    const isOffer = Boolean(data.offerDeadline);

    const [created] = await db
      .insert(message)
      .values({
        projectId: data.projectId,
        senderId: data.senderId,
        content: data.content,
        offerDeadline: isOffer ? cappedDeadline : null,
        offerStatus: isOffer ? "PENDING" : null,
      })
      .returning();

    if (!created) throw new Error("Failed to create message");

    // Notify the other participant about the new message/offer.
    const recipientId = project.clientId === data.senderId
      ? project.programmerId
      : project.clientId;

    if (recipientId) {
      await db.insert(schemas.notification).values({
        userId: recipientId,
        type: "NEW_MESSAGE",
        title: isOffer ? "Nova proposta de prazo" : "Nova mensagem",
        message: isOffer
          ? `${project.title}: proposta de entrega para ${cappedDeadline ? cappedDeadline.toISOString().slice(0, 10) : "sem prazo"}`
          : `${project.title}: ${data.content.slice(0, 140)}`,
        projectId: project.id,
        isRead: false,
      });
    }

    return created;
  },

  /**
   * Resolve a pending offer (accept/reject). Only the recipient of the offer
   * (the other participant) may resolve it. On acceptance the project's
   * deadline becomes the offered date, the project moves to IN_DEVELOPMENT
   * and the offering programmer is assigned.
   */
  resolveOffer: async (messageId: string, userId: string, decision: "ACCEPTED" | "REJECTED") => {
    const rows = await db
      .select({ messageItem: message, projectItem: schemas.project })
      .from(message)
      .innerJoin(schemas.project, eq(message.projectId, schemas.project.id))
      .where(eq(message.id, messageId))
      .limit(1);

    const row = rows[0];
    if (!row) throw new Error("Message not found");
    if (row.messageItem.offerDeadline == null || row.messageItem.offerStatus == null) {
      throw new Error("Message is not a negotiation offer");
    }
    if (row.messageItem.offerStatus !== "PENDING") throw new Error("Offer already resolved");

    const isParticipant =
      row.projectItem.clientId === userId
      || row.projectItem.programmerId === userId;
    if (!isParticipant) throw new Error("Unauthorized");

    // The offer sender cannot resolve their own offer.
    if (row.messageItem.senderId === userId) throw new Error("Unauthorized");

    const [updated] = await db
      .update(message)
      .set({ offerStatus: decision, updatedAt: new Date() })
      .where(eq(message.id, messageId))
      .returning();

    if (!updated) throw new Error("Failed to resolve offer");

    if (decision === "ACCEPTED") {
      await db
        .update(schemas.project)
        .set({
          deadline: row.messageItem.offerDeadline,
          status: "IN_DEVELOPMENT",
          programmerId: row.messageItem.senderId,
          updatedAt: new Date(),
        })
        .where(eq(schemas.project.id, row.projectItem.id));
    }

    // Notify the offer sender of the decision.
    await db.insert(schemas.notification).values({
      userId: row.messageItem.senderId,
      type: "PROJECT_UPDATE",
      title: decision === "ACCEPTED" ? "Proposta aceita" : "Proposta rejeitada",
      message:
        decision === "ACCEPTED"
          ? `${row.projectItem.title}: sua proposta foi aceita. Projeto em desenvolvimento.`
          : `${row.projectItem.title}: sua proposta foi rejeitada.`,
      projectId: row.projectItem.id,
      isRead: false,
    });

    return updated;
  },

  /**
   * Count pending offers the user can resolve (offers sent to them in their
   * projects).
   */
  countPendingOffersForUser: async (userId: string) => {
    const rows = await db
      .select({ total: sql<number>`count(*)::int` })
      .from(message)
      .innerJoin(schemas.project, eq(message.projectId, schemas.project.id))
      .where(
        and(
          eq(message.offerStatus, "PENDING"),
          ne(message.senderId, userId),
          or(
            eq(schemas.project.clientId, userId),
            eq(schemas.project.programmerId, userId),
          ),
        ),
      );

    return rows[0]?.total ?? 0;
  },
};
