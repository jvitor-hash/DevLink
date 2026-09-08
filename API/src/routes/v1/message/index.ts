import Elysia from "elysia";
import { MessageService } from "./service";
import { ErrorSchema } from "@/modules/error_schema";
import { MessageUpdateSchema, MessageCreateSchema, MessageSchema,  } from "@/database/data-transfer-object/message_dto";
import z from "zod";
import { eq } from "drizzle-orm";
import { schemas } from "@/database/schema";

export const MessageRouter = new Elysia({ prefix: "/api/v1/message/" })
  .post("/", async ({ body, set }) => {
    try {
      return await MessageService.create(body);
    } catch (error) {
      set.status = 500;
      return { error: "Failed to create message" }
    }
  }, {
    body: MessageCreateSchema,
    response: {
      201: MessageSchema,
      500: ErrorSchema
    },
    tags: ["Messages"],
    auth: true
  })
  .get("/", async ({ query, set }) => {
    try {
      return await MessageService.findAll(query.limit, query.offset);
    } catch (error) {
      set.status = 404;
      return { error: "Failed to fetch messages" }
    }
  }, {
    query: z.object({
      limit: z.coerce.number().min(10).max(100).default(10),
      offset: z.coerce.number().min(0).default(0),
    }),
    response: {
      200: z.array(MessageSchema),
      404: ErrorSchema,
      500: ErrorSchema
    },
    tags: ["Messages"],
    auth: true
  })
  .get("/:id", async ({ params, set }) => {
    try {
      const [message] = await MessageService.findWhere(eq(schemas.message.id, params.id));
      return message;
    } catch (error) {
      set.status = 404;
      return { error: "Failed to fetch message" }
    }
  }, {
    params: z.object({
      id: z.uuid()
    }),
    tags: ["Messages"],
    auth: true
  })
  .put("/:id", async ({ params, body, set }) => {
    try {
      const [updated] = await MessageService.update(eq(schemas.message.id, params.id), body);
      return updated;
    } catch (error) {
      set.status = 500;
      return { error: "Failed to update message" }
    }
  }, {
    params: z.object({
      id: z.uuid()
    }),
    body: MessageUpdateSchema,
    response: {
      200: MessageSchema,
      404: ErrorSchema,
      500: ErrorSchema
    },
    tags: ["Messages"],
    auth: true
  })
  .delete("/:id", async ({ params, set }) => {
    try {
      const [deleted] = await MessageService.remove(eq(schemas.message.id, params.id));
      return deleted;
    } catch (error) {
      set.status = 500;
      return { error: "Failed to delete message" }
    }
  }, {
    params: z.object({
      id: z.uuid()
    }),
    response: {
      200: MessageSchema,
      404: ErrorSchema,
      500: ErrorSchema
    },
    tags: ["Messages"],
    auth: true
  });
