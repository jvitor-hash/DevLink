import Elysia from "elysia";
import { ErrorSchema } from "@/modules/error_schema";
import { MessageCreateSchema, MessageUpdateSchema, MessageSchema, type MessageCreate, type MessageUpdate } from "@/database/data-transfer-object/message_dto";
import { MessageService } from "./service";
import { z } from "zod";
import { schemas } from "@/database/schema";
import { eq, sql } from "drizzle-orm";
import { db } from "@/client";
import { SseHub } from "@/modules/sse_hub";
import { authPlugin } from "@/modules/auth_plugin";
import { logError } from "@/modules/logger";

export const MessageRouter = new Elysia({ prefix: "/api/v1/messages" })
  .use(authPlugin)
  .post("/", async ({ body, user, set }) => {
    try {
      const data = body as MessageCreate;
      let conversationId = data.conversationId;
      // Check if conversation exists; if not, create it using payload info
      const existingConv = await db.select({ id: schemas.conversation.id, recipientId: schemas.conversation.recipientId }).from(schemas.conversation).where(eq(schemas.conversation.id, conversationId)).limit(1);
      if (!existingConv || existingConv.length === 0) {
        const recipientId = (data as any).recipientId ?? (data as any).projectId ?? user.id;
        const projectId = (data as any).projectId ?? "00000000-0000-0000-0000-000000000000";
        const [newConv] = await db.insert(schemas.conversation).values({
          projectId,
          userId: user.id,
          recipientId,
          lastMessage: data.content,
          unreadMessages: 0,
        }).returning();
        conversationId = newConv.id;
        data.conversationId = newConv.id;
      }
      const result = await MessageService.create({ ...data, conversationId, userId: user.id });
      // Notify recipient via SSE
      const convRow = await db.select({ recipientId: schemas.conversation.recipientId }).from(schemas.conversation).where(eq(schemas.conversation.id, conversationId)).limit(1);
      const recipientId = convRow[0]?.recipientId;
      if (recipientId) {
        SseHub.publish({
          id: crypto.randomUUID(),
          event: "CHAT_MESSAGE",
          data: { messageId: result.id, conversationId, content: data.content, userId: user.id },
          audienceUserIds: [recipientId, user.id],
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
    response: { 201: MessageSchema, 500: ErrorSchema },
    tags: ["Messages"],
    auth: true,
  })
  .get("/", async ({ query, set }) => {
    try {
      if (query.conversationId) {
        return await MessageService.findWhere(eq(schemas.message.conversationId, query.conversationId));
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
    authOptional: true,
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
  .put("/:id", async ({ params, body, set }) => {
    try {
      const data = body as MessageUpdate;
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
    response: { 200: MessageSchema, 404: ErrorSchema, 500: ErrorSchema },
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
