import { relations } from "drizzle-orm/_relations";
import { savedTicket } from "../saved_ticket_schema";
import { project } from "../project_schema";
import { user } from "../user_schema";

export const savedTicketsRelations = relations(savedTicket, ({ one }) => ({
  user: one(user, {
    fields: [savedTicket.userId],
    references: [user.id],
  }),

  project: one(project, {
    fields: [savedTicket.projectId],
    references: [project.id],
  }),
}));
