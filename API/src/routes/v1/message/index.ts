import Elysia from "elysia";
import { MessageService } from "./service";
import { ErrorSchema } from "@/modules/error_schema";
import { MessageUpdateSchema, MessageCreateSchema, MessageSchema, type MessageCreate, type MessageUpdate } from "@/database/data-transfer-object/message_dto";
import { z } from "zod";
import { and, eq, type SQL } from "drizzle-orm";
import { schemas } from "@/database/schema";
import { authPlugin } from "@/modules/auth_plugin";

export const MessageRouter = new Elysia({ prefix: "/api/v1/messages" })
  .use(authPlugin)
  .post("/", async ({ body, user, set }) => {
    try {
      const data = body as MessageCreate;
      const newMessage = await MessageService.create({
        ...data,
        senderId: schemas.user.id,
      });
      set.status = 201;
      return newMessage;
    } catch (error) {
      set.status = 500;
      return { error: "Failed to create message" };
    }
  }, {
    body: MessageCreateSchema,
    response: {
      201: MessageSchema,
      500: ErrorSchema,
    },
    tags: ["Messages"],
    auth: true,
  })
  .get("/", async ({ query, user, set }) => {
    try {
      if (!user) {
        set.status = 401;
        return { error: "Unauthorized" };
      }
      return await MessageService.findAllByUser(user.id, query.limit, query.offset);
    } catch (error) {
      set.status = 500;
      return { error: "Failed to fetch messages" };
    }
  }, {
    query: z.object({
      limit: z.coerce.number().min(1).max(100).default(10),
      offset: z.coerce.number().min(0).default(0),
    }),
    response: {
      200: z.array(MessageSchema),
      500: ErrorSchema,
    },
    tags: ["Messages"],
    auth: true,
  })
  .get("/:id", async ({ params, set }) => {
    try {
      const messageItem = await MessageService.findOne(eq(schemas.message.id, params.id));
      return messageItem;
    } catch (error) {
      set.status = 404;
      return { error: "Failed to fetch message" };
    }
  }, {
    params: z.object({
      id: z.string().uuid(),
    }),
    response: {
      200: MessageSchema,
      404: ErrorSchema,
      500: ErrorSchema,
    },
    tags: ["Messages"],
    auth: true,
  })
  .put("/:id", async ({ params, body, user, set }) => {
    try {
      const data = body as MessageUpdate;
      const updated = await MessageService.update(
        and(eq(schemas.message.id, params.id), eq(schemas.message.senderId, schemas.user.id)) as SQL<unknown>,
        data
      );
      return updated;
    } catch (error) {
      set.status = 404;
      return { error: "Message not found or unauthorized" };
    }
  }, {
    params: z.object({
      id: z.string().uuid(),
    }),
    body: MessageUpdateSchema,
    response: {
      200: MessageSchema,
      404: ErrorSchema,
      500: ErrorSchema,
    },
    tags: ["Messages"],
    auth: true,
  })
  .delete("/:id", async ({ params, user, set }) => {
    try {
      const deleted = await MessageService.remove(
        and(eq(schemas.message.id, params.id), eq(schemas.message.senderId, schemas.user.id)) as SQL<unknown>
      );
      return deleted;
    } catch (error) {
      set.status = 404;
      return { error: "Message not found or unauthorized" };
    }
  }, {
    params: z.object({
      id: z.string().uuid(),
    }),
    response: {
      200: MessageSchema,
      404: ErrorSchema,
      500: ErrorSchema,
    },
    tags: ["Messages"],
    auth: true,
  });
