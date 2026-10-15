import { z } from "zod";
import { NotificationTypeEnum } from "./enums";
import { idSchema } from "./helper";

export const NotificationSchema = z.object({
  id: idSchema,
  userId: idSchema,
  type: NotificationTypeEnum,
  title: z.string().min(1).max(200),
  message: z.string(),
  projectId: idSchema.nullable().optional(),
  isRead: z.boolean().default(false),
  archived: z.boolean().default(false),
  createdAt: z.union([z.date(), z.string()]).nullable().optional(),
});

export const NotificationCreateSchema = z.object({
  userId: idSchema,
  type: NotificationTypeEnum,
  title: z.string().min(1).max(200),
  message: z.string(),
  projectId: idSchema.nullable().optional(),
  isRead: z.boolean().default(false).optional(),
  archived: z.boolean().default(false).optional(),
});

export const NotificationUpdateSchema = z.object({
  isRead: z.boolean().optional(),
  archived: z.boolean().optional(),
});

export type NotificationDTO = z.infer<typeof NotificationSchema>;
export type NotificationCreate = z.infer<typeof NotificationCreateSchema>;
export type NotificationUpdate = z.infer<typeof NotificationUpdateSchema>;
