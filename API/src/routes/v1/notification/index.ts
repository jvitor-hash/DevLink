import Elysia from "elysia";
import { z } from "zod";
import { NotificationService } from "./service";
import { NotificationSchema, NotificationCreateSchema, NotificationUpdateSchema, type NotificationCreate, type NotificationUpdate } from "@/database/data-transfer-object/notification_dto";
import { and, eq, type SQL } from "drizzle-orm";
import { schemas } from "@/database/schema";
import { ErrorSchema } from "@/modules/error_schema";
import { authPlugin } from "@/modules/auth_plugin";
import { logError } from "@/modules/logger";

export const NotificationRouter = new Elysia({ prefix: "/api/v1/notifications" })
  .use(authPlugin)
  .post("/", async ({ body, user, set }) => {
    try {
      const data = body as NotificationCreate;
      const newNotification = await NotificationService.create({
        ...data,
        userId: user.id,
      });
      set.status = 201;
      return newNotification;
    } catch (error) {
      logError("POST /api/v1/notifications", error);
      set.status = 500;
      return { error: "Failed to create a notification" };
    }
  }, {
    body: NotificationCreateSchema,
    response: {
      201: NotificationSchema,
      500: ErrorSchema,
    },
    tags: ["Notifications"],
    auth: true,
  })
  .get("/", async ({ query, user, set }) => {
    try {
      if (!user) {
        set.status = 401;
        return { error: "Unauthorized" };
      }
      return await NotificationService.findAllByUser(user.id, query.limit, query.offset);
    } catch (error) {
      logError("GET /api/v1/notifications", error);
      set.status = 500;
      return { error: "Failed to fetch notifications" };
    }
  }, {
    query: z.object({
      limit: z.coerce.number().min(1).max(100).default(10),
      offset: z.coerce.number().min(0).default(0),
    }),
    response: {
      200: z.array(NotificationSchema),
      500: ErrorSchema,
    },
    tags: ["Notifications"],
    auth: true,
  })
  .get("/:id", async ({ params, user, set }) => {
    try {
      const notificationItem = await NotificationService.findOne(
        and(eq(schemas.notification.id, params.id), eq(schemas.notification.userId, user.id)) as SQL<unknown>
      );
      return notificationItem;
    } catch (error) {
      logError("GET /api/v1/notifications/:id", error);
      set.status = 404;
      return { error: "Notification not found" };
    }
  }, {
    params: z.object({
      id: z.string().uuid(),
    }),
    response: {
      200: NotificationSchema,
      404: ErrorSchema,
      500: ErrorSchema,
    },
    tags: ["Notifications"],
    auth: true,
  })
  .put("/:id", async ({ params, body, user, set }) => {
    try {
      const data = body as NotificationUpdate;
      const updated = await NotificationService.update(
        and(eq(schemas.notification.id, params.id), eq(schemas.notification.userId, user.id)) as SQL<unknown>,
        data
      );
      return updated;
    } catch (error) {
      logError("PUT /api/v1/notifications/:id", error);
      set.status = 404;
      return { error: "Notification not found or unauthorized" };
    }
  }, {
    params: z.object({
      id: z.string().uuid(),
    }),
    response: {
      200: NotificationSchema,
      404: ErrorSchema,
      500: ErrorSchema,
    },
    body: NotificationUpdateSchema,
    tags: ["Notifications"],
    auth: true,
  })
  .delete("/:id", async ({ params, user, set }) => {
    try {
      const deleted = await NotificationService.remove(
        and(eq(schemas.notification.id, params.id), eq(schemas.notification.userId, user.id)) as SQL<unknown>
      );
      return deleted;
    } catch (error) {
      logError("DELETE /api/v1/notifications/:id", error);
      set.status = 404;
      return { error: "Notification not found or unauthorized" };
    }
  }, {
    params: z.object({
      id: z.string().uuid(),
    }),
    response: {
      200: NotificationSchema,
      404: ErrorSchema,
      500: ErrorSchema,
    },
    tags: ["Notifications"],
    auth: true,
  });
