import Elysia from "elysia";
import { z } from "zod";
import { NotificationService } from "./service";
import {
  NotificationSchema,
  NotificationUpdateSchema,
  type NotificationUpdate,
} from "@/database/data-transfer-object/notification_dto";
import { ErrorSchema } from "@/modules/error_schema";
import { authPlugin } from "@/modules/auth_plugin";
import { logError } from "@/modules/logger";

export const NotificationRouter = new Elysia({ prefix: "/api/v1/notifications" })
  .use(authPlugin)
  .get("/", async ({ query, user, set }) => {
    try {
      return await NotificationService.findAllByUser(user.id, query.limit, query.offset);
    } catch (error) {
      logError("GET /api/v1/notifications", error);
      set.status = 500;

      return { error: "Failed to fetch notifications" };
    }
  }, {
    query: z.object({
      limit: z.coerce.number().min(1).max(100).default(50),
      offset: z.coerce.number().min(0).default(0),
    }),
    response: {
      200: z.array(NotificationSchema),
      500: ErrorSchema,
    },
    tags: ["Notifications"],
    auth: true,
  })
  .put("/read-all", async ({ user, set }) => {
    try {
      return await NotificationService.markAllAsReadForUser(user.id);
    } catch (error) {
      logError("PUT /api/v1/notifications/read-all", error);
      set.status = 500;

      return { error: "Failed to mark all as read" };
    }
  }, {
    response: {
      200: z.object({ success: z.boolean() }),
      500: ErrorSchema,
    },
    tags: ["Notifications"],
    auth: true,
  })
  .put("/:id", async ({ params, body, user, set }) => {
    try {
      const data = body as NotificationUpdate;
      const updated = await NotificationService.updateForUser(params.id, user.id, data);

      if (!updated) {
        set.status = 404;

        return { error: "Notification not found" };
      }

      return updated;
    } catch (error) {
      logError("PUT /api/v1/notifications/:id", error);
      set.status = 500;

      return { error: "Failed to update notification" };
    }
  }, {
    params: z.object({
      id: z.string().uuid(),
    }),
    body: NotificationUpdateSchema,
    response: {
      200: NotificationSchema,
      404: ErrorSchema,
      500: ErrorSchema,
    },
    tags: ["Notifications"],
    auth: true,
  });
