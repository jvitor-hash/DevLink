import Elysia from "elysia";
import { MessageService } from "./service";
import { ErrorSchema } from "@/modules/error_schema";
import { MessageUpdateSchema, MessageCreateSchema, MessageSchema, type MessageCreate, type MessageUpdate } from "@/database/data-transfer-object/message_dto";
import { z } from "zod";
import { and, eq, or, type SQL } from "drizzle-orm";
import { schemas } from "@/database/schema";
import { authPlugin } from "@/modules/auth_plugin";
import { logError } from "@/modules/logger";

export const MessageRouter = new Elysia({ prefix: "/api/v1/messages" })
  .use(authPlugin)
  .post("/", async ({ body, user, set }) => {
    try {
      const data = body as MessageCreate;
      const newMessage = await MessageService.createWithOffer({
        projectId: data.projectId,
        senderId: user.id,
        content: data.content,
        offerDeadline: data.offerDeadline ?? null,
      });
      set.status = 201;
      return newMessage;
    } catch (error) {
      logError("POST /api/v1/messages", error);
      const message = (error as Error).message;
      if (message === "Project not found or unauthorized") {
        set.status = 403;
        return { error: message };
      }
      if (message === "Invalid offer deadline") {
        set.status = 422;
        return { error: message };
      }
      set.status = 500;
      return { error: "Failed to create message" };
    }
  }, {
    body: MessageCreateSchema,
    response: {
      201: MessageSchema,
      403: ErrorSchema,
      422: ErrorSchema,
      500: ErrorSchema,
    },
    tags: ["Messages"],
    auth: true,
  })
  .get("/offers/pending", async ({ user }) => {
    const total = await MessageService.countPendingOffersForUser(user.id);
    return { total };
  }, {
    response: {
      200: z.object({ total: z.number() }),
    },
    tags: ["Messages"],
    auth: true,
  })
  .put("/:id/offer", async ({ params, body, user, set }) => {
    try {
      const decision = (body as { decision: "ACCEPTED" | "REJECTED" }).decision;
      const updated = await MessageService.resolveOffer(params.id, user.id, decision);
      return updated;
    } catch (error) {
      logError("PUT /api/v1/messages/:id/offer", error);
      const message = (error as Error).message;
      if (message === "Message not found") {
        set.status = 404;
        return { error: message };
      }
      if (message === "Unauthorized" || message === "Offer already resolved" || message === "Message is not a negotiation offer") {
        set.status = 403;
        return { error: message };
      }
      set.status = 500;
      return { error: "Failed to resolve offer" };
    }
  }, {
    params: z.object({
      id: z.string().uuid(),
    }),
    body: z.object({ decision: z.enum(["ACCEPTED", "REJECTED"]) }),
    response: {
      200: MessageSchema,
      403: ErrorSchema,
      404: ErrorSchema,
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
      logError("GET /api/v1/messages", error);
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
  .get("/project/:projectId", async ({ params, query, user, set }) => {
    try {
      if (!user) {
        set.status = 401;
        return { error: "Unauthorized" };
      }

      return await MessageService.findAllByProject(params.projectId, user.id, query.limit, query.offset);
    } catch (error) {
      logError("GET /api/v1/messages/project/:projectId", error);
      set.status = 500;
      return { error: "Failed to fetch messages" };
    }
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
      401: ErrorSchema,
      500: ErrorSchema,
    },
    tags: ["Messages"],
    auth: true,
  })
  .get("/:id", async ({ params, user, set }) => {
    try {
      const messageItem = await MessageService.findByIdForUser(params.id, user.id);

      if (!messageItem) {
        set.status = 404;
        return { error: "Message not found" };
      }

      return messageItem;
    } catch (error) {
      logError("GET /api/v1/messages/:id", error);
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
        and(eq(schemas.message.id, params.id), eq(schemas.message.senderId, user.id)) as SQL<unknown>,
        data
      );
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
      500: ErrorSchema,
    },
    tags: ["Messages"],
    auth: true,
  })
  .delete("/:id", async ({ params, user, set }) => {
    try {
      const deleted = await MessageService.remove(
        and(eq(schemas.message.id, params.id), eq(schemas.message.senderId, user.id)) as SQL<unknown>
      );
      return deleted;
    } catch (error) {
      logError("DELETE /api/v1/messages/:id", error);
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
