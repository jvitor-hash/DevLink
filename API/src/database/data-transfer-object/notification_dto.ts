import { z } from "zod";
import { NotificationTypeEnum } from "./enums";
import { createCrudSchemas, idSchema, timestampsSchema } from "./helper";

export const NotificationSchema = z.object({
  id: idSchema,
  userId: idSchema,
  type: NotificationTypeEnum,
  title: z.string().min(1).max(200),
  message: z.string().min(1),
  projectId: idSchema.nullable().optional(),
  isRead: z.boolean().default(false),
}).merge(timestampsSchema);

const NotificationDTOs = createCrudSchemas(NotificationSchema, [
  "id",
  "createdAt",
  "updatedAt",
]);

export const NotificationCreateSchema = NotificationDTOs.create;
export const NotificationUpdateSchema = NotificationDTOs.update;

export type NotificationDTO = z.infer<typeof NotificationSchema>;
export type NotificationCreate = z.infer<typeof NotificationCreateSchema>;
export type NotificationUpdate = z.infer<typeof NotificationUpdateSchema>;
