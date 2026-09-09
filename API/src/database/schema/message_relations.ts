import { relations } from "drizzle-orm/_relations";
import { message } from "./message_schema";
import { project } from "./project_schema";
import { user } from "./user_schema";

export const messagesRelations = relations(message, ({ one }) => ({
  project: one(project, {
    fields: [message.projectId],
    references: [project.id],
  }),

  sender: one(user, {
    fields: [message.senderId],
    references: [user.id],
  }),
}));
