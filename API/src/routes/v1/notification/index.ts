import Elysia from "elysia";
import { z } from "zod";
import { NotificationSchema, NotificationUpdateSchema } from "@/database/data-transfer-object/notification_dto";
import { ErrorSchema } from "@/modules/error_schema";
import { authPlugin } from "@/modules/auth_plugin";
import { NotificationController } from "@/app/dependencies";

export const NotificationRouter = new Elysia({ prefix: "/api/v1/notifications" })
  .use(authPlugin)
  .get("/", NotificationController.list, {
    query: z.object({ limit: z.coerce.number().min(1).max(100).default(50), offset: z.coerce.number().min(0).default(0) }),
    response: { 200: z.array(NotificationSchema), 500: ErrorSchema }, tags: ["Notifications"], auth: true,
  })
  .put("/read-all", NotificationController.readAll, {
    response: { 200: z.object({ success: z.boolean() }), 500: ErrorSchema }, tags: ["Notifications"], auth: true,
  })
  .put("/:id", NotificationController.update, {
    params: z.object({ id: z.uuid() }), body: NotificationUpdateSchema,
    response: { 200: NotificationSchema, 404: ErrorSchema, 500: ErrorSchema }, tags: ["Notifications"], auth: true,
  });
