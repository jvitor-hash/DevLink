import { relations } from "drizzle-orm/_relations";
import { savedTicket } from "./saved_ticket_schema";
import { schemas } from ".";

export const savedTicketsRelations = relations(savedTicket, ({ one }) => ({
    user: one(schemas.user, {
      fields: [savedTicket.userId],
      references: [schemas.user.id],
  }),

  project: one(schemas.project, {
    fields: [savedTicket.projectId],
    references: [schemas.project.id],
  }),
}));
