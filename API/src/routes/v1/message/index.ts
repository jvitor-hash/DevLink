import Elysia from "elysia";
import { z } from "zod";
import { MessageService } from "./service";
import { MessageSchema, MessageCreateSchema, MessageUpdateSchema, type MessageCreate, type MessageUpdate } from "@/database/data-transfer-object/message_dto";
import { ErrorSchema } from "@/modules/error_schema";
import { authPlugin } from "@/modules/auth_plugin";
import { logError } from "@/modules/logger";

export const MessageRouter = new Elysia({ prefix: "/api/v1/messages" })
  .use(authPlugin)
  .get("/", async ({ query, user }) => {
    return await MessageService.findAllByUser(user.id, query.limit, query.offset);
  }, {
    query: z.object({
      limit: z.coerce.number().min(1).max(100).default(50),
      offset: z.coerce.number().min(0).default(0),
    }),
    response: {
      200: z.array(MessageSchema),
    },
    tags: ["Messages"],
    auth: true,
  })
  .post("/", async ({ body, user, set }) => {
    try {
      const data = body as MessageCreate;
      const newMessage = await MessageService.createForProject({
        projectId: data.projectId,
        senderId: user.id,
        content: data.content,
        offerDeadline: data.offerDeadline ?? null,
      });
      set.status = 201;
      return newMessage;
    } catch (error) {
      logError("POST /api/v1/messages", error);

      if (error instanceof Error && error.message === "Only programmers can send offers") {
        set.status = 403;
        return { error: "Only programmers can send offers" };
      }

      const unauthorized = (error as Error).message === "Project not found or unauthorized";
      set.status = unauthorized ? 403 : 500;
      return { error: unauthorized ? "Not a project participant" : "Failed to create message" };
    }
  }, {
    body: MessageCreateSchema,
    response: {
      201: MessageSchema,
      403: ErrorSchema,
      500: ErrorSchema,
    },
    tags: ["Messages"],
    auth: true,
  })
  .get("/project/:projectId", async ({ params, user }) => {
    return await MessageService.findAllByProject(params.projectId, user.id, 50, 0);
  }, {
    params: z.object({
      projectId: z.string().uuid(),
    }),
    query: z.object({
      limit: z.coerce.number().min(1).max(100).default(50),
      offset: z.coerce.number().min(0).default(0),
    }),
    response: {
      200: z.array(MessageSchema),
    },
    tags: ["Messages"],
    auth: true,
  })
  .get("/project/:projectId/since", async ({ params, query, user }) => {
    const after = new Date(query.after);
    if (Number.isNaN(after.getTime())) {
      return [];
    }
    return await MessageService.findSince(params.projectId, user.id, after);
  }, {
    params: z.object({
      projectId: z.string().uuid(),
    }),
    query: z.object({
      after: z.string(),
    }),
    response: {
      200: z.array(MessageSchema),
    },
    tags: ["Messages"],
    auth: true,
  })
  .get("/project/:projectId/unread", async ({ params, user }) => {
    const count = await MessageService.findUnreadCountByProject(params.projectId, user.id);
    return { count };
  }, {
    params: z.object({
      projectId: z.string().uuid(),
    }),
    response: {
      200: z.object({ count: z.number() }),
    },
    tags: ["Messages"],
    auth: true,
  })
  .put("/:id", async ({ params, body, user, set }) => {
    try {
      const data = body as MessageUpdate;
      const updated = await MessageService.updateForUser(params.id, user.id, data);
      return updated;
    } catch (error) {
      logError("PUT /api/v1/messages/:id", error);
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
    },
    tags: ["Messages"],
    auth: true,
  });
