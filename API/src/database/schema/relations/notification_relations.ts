import { relations } from "drizzle-orm/_relations";
import { schemas } from "../index";

export const notificationsRelations = relations(schemas.notification, ({ one }) => ({
  user: one(schemas.user, {
    fields: [schemas.notification.userId],
    references: [schemas.user.id],
  }),

  project: one(schemas.project, {
    fields: [schemas.notification.projectId],
    references: [schemas.project.id],
  }),
}));
