import z from "zod";
import { NotificationTypeEnum } from "./enums";
import { createCrudSchemas, idSchema } from "./helper";

export const NotificationSchema = z.object({
  id: idSchema,
  userId: idSchema,
  type: NotificationTypeEnum,
  title: z.string().max(200),
  message: z.string(),
  projectId: idSchema.nullable().optional(),
  isRead: z.boolean().default(false),
  createdAt: z.union([z.date(), z.string().datetime(), z.string().uuid()]).nullable().optional(),
});

const NotificationDTOs = createCrudSchemas(NotificationSchema, [
  "id"
]);

export const NotificationCreateSchema = NotificationDTOs.create;
export const NotificationUpdateSchema = NotificationDTOs.update;

// export type NotificationDTO = z.infer<typeof NotificationDTOs.dto>;
// export type NotificationCreate = z.infer<typeof NotificationDTOs.create>;
// export type NotificationUpdate = z.infer<typeof NotificationDTOs.update>;
