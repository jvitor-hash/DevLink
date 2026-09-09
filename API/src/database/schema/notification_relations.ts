import { relations } from "drizzle-orm/_relations";
import { notification } from "./notification_schema";
import { project } from "./project_schema";
import { user } from "./user_schema";

export const notificationsRelations = relations(notification, ({ one }) => ({
  user: one(user, {
    fields: [notification.userId],
    references: [user.id],
  }),

  project: one(project, {
    fields: [notification.projectId],
    references: [project.id],
  }),
}));
