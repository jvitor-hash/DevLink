import { relations } from "drizzle-orm/_relations";
import { notification } from "./notification_schema";
import { schemas } from ".";

export const notificationsRelations = relations(notification, ({ one }) => ({
  user: one(schemas.user, {
    fields: [notification.userId],
    references: [schemas.user.id],
  }),

  project: one(schemas.project, {
    fields: [notification.projectId],
    references: [schemas.project.id],
  }),
}));
