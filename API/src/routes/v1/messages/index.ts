import Elysia from "elysia";
import { ErrorSchema } from "@/modules/error_schema";
import { MessageCreateSchema, MessageUpdateSchema, MessageSchema, type MessageCreate, type MessageUpdate } from "@/database/data-transfer-object/message_dto";
import { MessageService } from "./service";
import { z } from "zod";
import { schemas } from "@/database/schema";
import { and, asc, eq, ne, sql } from "drizzle-orm";
import { db } from "@/client";
import { SseHub } from "@/modules/sse_hub";
import { authPlugin } from "@/modules/auth_plugin";
import { logError } from "@/modules/logger";
import { offerResponseProjectPatch } from "@/modules/project_status";
import { notificationEnabled } from "@/modules/notification_gate";

export const MessageRouter = new Elysia({ prefix: "/api/v1/messages" })
  .use(authPlugin)
  .post("/", async ({ body, user, set }) => {
    try {
      const data = body as MessageCreate;
      let conversationId = data.conversationId;
      // Check if conversation exists; if not, create it using payload info
      const existingConv = await db.select({
        id: schemas.conversation.id,
        projectId: schemas.conversation.projectId,
        userId: schemas.conversation.userId,
        recipientId: schemas.conversation.recipientId,
      }).from(schemas.conversation).where(eq(schemas.conversation.id, conversationId)).limit(1);

      if (!existingConv || existingConv.length === 0) {
        if (user.role !== "PROGRAMMER") {
          set.status = 403;

          return { error: "Only programmers can start new conversations" };
        }

        const recipientId = (data as any).recipientId ?? user.id;
        const projectId = (data as any).projectId ?? null;
        const [newConv] = await db.insert(schemas.conversation).values({
          projectId,
          userId: user.id,
          recipientId,
          lastMessage: data.content,
          unreadMessages: 0,
        }).returning();

        conversationId = newConv.id;
        data.conversationId = newConv.id;
      } else if (user.role === "CLIENT") {
        const [convProject] = await db.select({ clientId: schemas.project.clientId })
          .from(schemas.project)
          .where(eq(schemas.project.id, existingConv[0].projectId))
          .limit(1);

        if (!convProject || convProject.clientId !== user.id) {
          set.status = 403;

          return { error: "Clients can only reply to their own projects conversations" };
        }
      }

      const result = await MessageService.create({ ...data, conversationId, userId: user.id });

      let targetUserId = existingConv?.[0]?.userId === user.id ? existingConv?.[0]?.recipientId : existingConv?.[0]?.userId;
      let targetProjectId = existingConv?.[0]?.projectId ?? null;

      if (!targetUserId) {
        const convRow = await db.select({
          userId: schemas.conversation.userId,
          recipientId: schemas.conversation.recipientId,
          projectId: schemas.conversation.projectId,
        }).from(schemas.conversation).where(eq(schemas.conversation.id, conversationId)).limit(1);

        targetUserId = convRow[0]?.userId === user.id ? convRow[0]?.recipientId : convRow[0]?.userId;
        targetProjectId = convRow[0]?.projectId ?? null;
      }

      if (targetUserId) {
        if ((user.role === "PROGRAMMER" || user.role === "CLIENT") && await notificationEnabled(targetUserId, "NEW_MESSAGE")) {
          await db.insert(schemas.notification).values({
            userId: targetUserId,
            type: "NEW_MESSAGE",
            title: "Nova mensagem",
            message: user.role === "CLIENT"
              ? `O cliente respondeu: "${data.content}"`
              : `Você recebeu uma nova mensagem: "${data.content}"`,
            projectId: targetProjectId,
            isRead: false,
            archived: false,
          });
        }

        SseHub.publish({
          id: crypto.randomUUID(),
          event: "project.chat_message",
          data: {
            messageId: result.id,
            conversationId,
            content: data.content,
            userId: user.id,
            messageType: result.messageType,
            offerStatus: result.offerStatus,
            offerMoney: result.offerMoney,
            offerDeadline: result.offerDeadline,
          },
          audienceUserIds: [targetUserId, user.id],
        });
      }

      set.status = 201;

      return result;
    } catch (error) {
      logError("POST /api/v1/messages", error);

      set.status = 500;

      return { error: "Failed to create message" };
    }
  }, {
    body: MessageCreateSchema,
    response: { 201: MessageSchema, 403: ErrorSchema, 500: ErrorSchema },
    tags: ["Messages"],
    auth: true,
  })
  .get("/", async ({ query, user, set }) => {
    try {
      if (query.conversationId) {
        await db.update(schemas.message)
          .set({ isRead: true, readAt: new Date() })
          .where(and(
            eq(schemas.message.conversationId, query.conversationId),
            ne(schemas.message.userId, user.id),
            eq(schemas.message.isRead, false),
          ));
        return await db.select().from(schemas.message)
          .where(eq(schemas.message.conversationId, query.conversationId))
          .orderBy(asc(schemas.message.createdAt))
          .limit(query.limit)
          .offset(query.offset);
      }
      return await MessageService.findAll(query.limit ?? 10, query.offset ?? 0);
    } catch (error) {
      logError("GET /api/v1/messages", error);
      set.status = 500;
      return { error: "Failed to fetch messages" };
    }
  }, {
    query: z.object({
      limit: z.coerce.number().min(1).max(100).default(10),
      offset: z.coerce.number().min(0).default(0),
      conversationId: z.string().uuid().optional(),
    }),
    response: { 200: z.array(MessageSchema), 500: ErrorSchema },
    tags: ["Messages"],
    auth: true,
  })
  .get("/:id", async ({ params, set }) => {
    try {
      const result = await MessageService.findOne(eq(schemas.message.id, params.id));
      if (!result) {
        set.status = 404;
        return { error: "Message not found" };
      }
      return result;
    } catch (error) {
      logError("GET /api/v1/messages/:id", error);
      set.status = 500;
      return { error: "Failed to fetch message" };
    }
  }, {
    params: z.object({ id: z.uuid() }),
    response: { 200: MessageSchema, 404: ErrorSchema, 500: ErrorSchema },
    tags: ["Messages"],
    authOptional: true,
  })
  .put("/:id", async ({ params, body, user, set }) => {
    try {
      const data = body as MessageUpdate;
      const [message] = await db.select({
        id: schemas.message.id,
        userId: schemas.message.userId,
        messageType: schemas.message.messageType,
        offerStatus: schemas.message.offerStatus,
        projectId: schemas.conversation.projectId,
        clientId: schemas.project.clientId,
        projectStatus: schemas.project.status,
        projectTitle: schemas.project.title,
      }).from(schemas.message)
        .innerJoin(schemas.conversation, eq(schemas.message.conversationId, schemas.conversation.id))
        .innerJoin(schemas.project, eq(schemas.conversation.projectId, schemas.project.id))
        .where(eq(schemas.message.id, params.id)).limit(1);

      if (data.offerStatus && message?.messageType === "OFFER" && message.offerStatus === "PENDING") {
        if (!message || user.id !== message.clientId) {
          set.status = 403;
          return { error: "Only the project client can respond to an offer" };
        }

        const projectPatch = offerResponseProjectPatch(message.projectStatus, data.offerStatus === "ACCEPTED" ? "ACCEPTED" : "REJECTED");
        if (projectPatch) {
          await db.update(schemas.project).set({
            ...projectPatch,
            programmerId: data.offerStatus === "ACCEPTED" ? message.userId : null,
          }).where(eq(schemas.project.id, message.projectId));

          if (projectPatch.status === "IN_DEVELOPMENT") {
            await db.delete(schemas.saveProject)
              .where(eq(schemas.saveProject.projectId, message.projectId));
          }

          SseHub.publish({
            id: crypto.randomUUID(),
            event: "project.updated",
            data: { status: projectPatch.status, programmerId: data.offerStatus === "ACCEPTED" ? message.userId : null },
            audienceUserIds: [message.clientId, message.userId],
          });
        }

        if (await notificationEnabled(message.userId, data.offerStatus === "ACCEPTED" ? "OFFER_ACCEPTED" : "OFFER_REJECTED")) await db.insert(schemas.notification).values({
          userId: message.userId,
          type: data.offerStatus === "ACCEPTED" ? "OFFER_ACCEPTED" : "OFFER_REJECTED",
          title: data.offerStatus === "ACCEPTED" ? "Proposta aceita" : "Proposta recusada",
          message: data.offerStatus === "ACCEPTED"
            ? `Sua proposta para o projeto "${message.projectTitle}" foi aceita.`
            : `Sua proposta para o projeto "${message.projectTitle}" foi recusada.`,
          projectId: message.projectId,
          isRead: false,
          archived: false,
        });
      }

      const result = await MessageService.update(eq(schemas.message.id, params.id), data);
      return result;
    } catch (error) {
      logError("PUT /api/v1/messages/:id", error);
      set.status = 404;
      return { error: "Message not found" };
    }
  }, {
    params: z.object({ id: z.uuid() }),
    body: MessageUpdateSchema,
    response: { 200: MessageSchema, 403: ErrorSchema, 404: ErrorSchema, 500: ErrorSchema },
    tags: ["Messages"],
    auth: true,
  })
  .delete("/:id", async ({ params, set }) => {
    try {
      const result = await MessageService.remove(eq(schemas.message.id, params.id));
      return result;
    } catch (error) {
      logError("DELETE /api/v1/messages/:id", error);
      set.status = 404;
      return { error: "Message not found" };
    }
  }, {
    params: z.object({ id: z.uuid() }),
    response: { 200: MessageSchema, 404: ErrorSchema, 500: ErrorSchema },
    tags: ["Messages"],
    auth: true,
  });
