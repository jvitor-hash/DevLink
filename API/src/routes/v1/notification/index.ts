import Elysia from "elysia";
import { z } from 'zod';
import { NotificationService } from "./service";
import { NotificationSchema, NotificationCreateSchema, NotificationUpdateSchema } from "@/database/data-transfer-object/notification_dto";
import { eq } from "drizzle-orm";
import { schemas } from "@/database/schema";

const ErrorSchema = z.object({
  error: z.string(),
});

export const NotificationRouter = new Elysia({ prefix: "/api/v1/notification" })
  .post("/", async ({ body, set }) => {
    try {
      return await NotificationService.create(body);
    } catch (error) {
      set.status = 500;
      return { error: "Failed to create a notification" }
    }
  }, {
    body: NotificationCreateSchema,
    response: {
      201: NotificationSchema,
      500: ErrorSchema
    },
    tags: ["Notification"],
    auth: true
  })
  .get("/", async ({ query, set }) => {
    try {
      return await NotificationService.findAll(query.limit, query.offset);
    } catch (error) {
      set.status = 500;
      return { error: "Failed to fetch notifications" }
    }
  }, {
    query: z.object({
      limit: z.coerce.number().min(10).max(100).default(10),
      offset: z.coerce.number().min(0).default(0),
    }),
    response: {
      200: z.array(NotificationSchema),
      404: ErrorSchema,
      500: ErrorSchema
    },
    tags: ["Notification"],
    auth: true
  })
  .get("/:id", async ({ params, set }) => {
    try {
      const [notification] = await NotificationService.findWhere(eq(schemas.notification.id, params.id));
      return notification;
    } catch (error) {
      set.status = 404;
      return { error: "Notification not found" }
    }
  }, {
    params: z.object({
      id: z.uuid()
    }),
    response: {
      200: NotificationSchema,
      404: ErrorSchema,
      500: ErrorSchema
    },
    tags: ["Notification"],
    auth: true
  })
  .put("/:id", async ({ params, body, set }) => {
    try {
      const [updated] = await NotificationService.update(eq(schemas.notification.id, params.id), body);
      return updated;
    } catch (error) {
      set.status = 500;
      return { error: "Failed to update notification" }
    }
  }, {
    params: z.object({
      id: z.uuid()
    }),
    response: {
      200: NotificationSchema,
      404: ErrorSchema,
      500: ErrorSchema
    },
    body: NotificationUpdateSchema,
    tags: ["Notification"],
    auth: true
  })
  .delete("/:id", async ({ params, set }) => {
    try {
      const [deleted] = await NotificationService.remove(eq(schemas.notification.id, params.id));
      return deleted;
    } catch (error) {
      set.status = 500;
      return { error: "Failed to delete notification" }
    }
  }, {
    params: z.object({
      id: z.uuid()
    }),
    response: {
      200: NotificationSchema,
      404: ErrorSchema,
      500: ErrorSchema
    },
    tags: ["Notification"],
    auth: true
  });
