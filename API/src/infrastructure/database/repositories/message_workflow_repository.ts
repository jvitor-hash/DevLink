import { and, asc, eq, ne } from "drizzle-orm";
import { db } from "@/client";
import { schemas } from "@/database/schema";
import { SseHub } from "@/infrastructure/realtime/sse_hub";
import { notificationEnabled } from "@/modules/notification_gate";
import { offerResponseProjectPatch } from "@/modules/project_status";
import { ForbiddenError, NotFoundError } from "@/shared/errors/domain_errors";
import type { MessageCreate, MessageUpdate } from "@/database/data-transfer-object/message_dto";

type Actor = { id: string; role: string };

export const MessageWorkflowRepository = {
  async create(data: MessageCreate, actor: Actor) {
    let conversationId = data.conversationId;
    let conversation = await db.select().from(schemas.conversation).where(eq(schemas.conversation.id, conversationId)).limit(1);

    if (!conversation.length) {
      if (actor.role !== "PROGRAMMER") throw new ForbiddenError("Only programmers can start new conversations");
      const [created] = await db.insert(schemas.conversation).values({
        projectId: (data as MessageCreate & { projectId?: string }).projectId ?? null,
        userId: actor.id,
        recipientId: (data as MessageCreate & { recipientId?: string }).recipientId ?? actor.id,
        lastMessage: data.content,
        unreadMessages: 0,
      }).returning();
      conversationId = created.id;
      conversation = [created];
    } else if (actor.role === "CLIENT") {
      const [project] = await db.select({ clientId: schemas.project.clientId }).from(schemas.project).where(eq(schemas.project.id, conversation[0].projectId)).limit(1);
      if (!project || project.clientId !== actor.id) throw new ForbiddenError("Clients can only reply to their own projects conversations");
    }

    const [message] = await db.insert(schemas.message).values({ ...data, conversationId, userId: actor.id }).returning();
    const targetUserId = conversation[0].userId === actor.id ? conversation[0].recipientId : conversation[0].userId;
    if (targetUserId) {
      if (await notificationEnabled(targetUserId, "NEW_MESSAGE")) await db.insert(schemas.notification).values({
        userId: targetUserId, type: "NEW_MESSAGE", title: "Nova mensagem",
        message: actor.role === "CLIENT" ? `O cliente respondeu: "${data.content}"` : `Você recebeu uma nova mensagem: "${data.content}"`,
        projectId: conversation[0].projectId, isRead: false, archived: false,
      });
      SseHub.publish({ id: crypto.randomUUID(), event: "project.chat_message", data: { messageId: message.id, conversationId, content: data.content, userId: actor.id, messageType: message.messageType, offerStatus: message.offerStatus, offerMoney: message.offerMoney, offerDeadline: message.offerDeadline }, audienceUserIds: [targetUserId, actor.id] });
    }
    return message;
  },

  list: async (conversationId: string | undefined, actor: Actor, limit: number, offset: number) => {
    if (!conversationId) return db.select().from(schemas.message).limit(limit).offset(offset);
    await db.update(schemas.message).set({ isRead: true, readAt: new Date() }).where(and(eq(schemas.message.conversationId, conversationId), ne(schemas.message.userId, actor.id), eq(schemas.message.isRead, false)));
    return db.select().from(schemas.message).where(eq(schemas.message.conversationId, conversationId)).orderBy(asc(schemas.message.createdAt)).limit(limit).offset(offset);
  },

  get: async (id: string) => {
    const [message] = await db.select().from(schemas.message).where(eq(schemas.message.id, id)).limit(1);
    if (!message) throw new NotFoundError("Message not found");
    return message;
  },

  update: async (id: string, data: MessageUpdate, actor: Actor) => {
    const [message] = await db.select({ id: schemas.message.id, userId: schemas.message.userId, messageType: schemas.message.messageType, offerStatus: schemas.message.offerStatus, projectId: schemas.conversation.projectId, clientId: schemas.project.clientId, projectStatus: schemas.project.status, projectTitle: schemas.project.title }).from(schemas.message).innerJoin(schemas.conversation, eq(schemas.message.conversationId, schemas.conversation.id)).innerJoin(schemas.project, eq(schemas.conversation.projectId, schemas.project.id)).where(eq(schemas.message.id, id)).limit(1);
    if (!message) throw new NotFoundError("Message not found");

    if (data.offerStatus && message.messageType === "OFFER" && message.offerStatus === "PENDING") {
      if (actor.id !== message.clientId) throw new ForbiddenError("Only the project client can respond to an offer");
      const patch = offerResponseProjectPatch(message.projectStatus, data.offerStatus === "ACCEPTED" ? "ACCEPTED" : "REJECTED");
      if (patch) {
        await db.transaction(async (tx) => {
          await tx.update(schemas.project).set({ ...patch, programmerId: data.offerStatus === "ACCEPTED" ? message.userId : null }).where(eq(schemas.project.id, message.projectId));
          if (patch.status === "IN_DEVELOPMENT") await tx.delete(schemas.saveProject).where(eq(schemas.saveProject.projectId, message.projectId));
          if (await notificationEnabled(message.userId, data.offerStatus === "ACCEPTED" ? "OFFER_ACCEPTED" : "OFFER_REJECTED")) await tx.insert(schemas.notification).values({ userId: message.userId, type: data.offerStatus === "ACCEPTED" ? "OFFER_ACCEPTED" : "OFFER_REJECTED", title: data.offerStatus === "ACCEPTED" ? "Proposta aceita" : "Proposta recusada", message: data.offerStatus === "ACCEPTED" ? `Sua proposta para o projeto "${message.projectTitle}" foi aceita.` : `Sua proposta para o projeto "${message.projectTitle}" foi recusada.`, projectId: message.projectId, isRead: false, archived: false });
        });
        SseHub.publish({ id: crypto.randomUUID(), event: "project.updated", data: { status: patch.status, programmerId: data.offerStatus === "ACCEPTED" ? message.userId : null }, audienceUserIds: [message.clientId, message.userId] });
      }
    }
    const [updated] = await db.update(schemas.message).set(data).where(eq(schemas.message.id, id)).returning();
    return updated;
  },

  remove: async (id: string) => {
    const [message] = await db.delete(schemas.message).where(eq(schemas.message.id, id)).returning();
    if (!message) throw new NotFoundError("Message not found");
    return message;
  },
};
