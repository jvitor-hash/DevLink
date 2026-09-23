import { relations } from "drizzle-orm/_relations";
import { schemas } from "../index";

export const messagesRelations = relations(schemas.message, ({ one }) => ({
  project: one(schemas.project, {
    fields: [schemas.message.projectId],
    references: [schemas.project.id],
  }),

  sender: one(schemas.user, {
    fields: [schemas.message.senderId],
    references: [schemas.user.id],
  }),
}));
