import { relations } from "drizzle-orm/_relations";
import { message } from "./message_schema";
import { schemas } from ".";

export const messagesRelations = relations(message, ({ one }) => ({
  project: one(schemas.project, {
    fields: [message.projectId],
    references: [schemas.project.id],
  }),

  sender: one(schemas.user, {
    fields: [message.senderId],
    references: [schemas.user.id],
  }),
}));
