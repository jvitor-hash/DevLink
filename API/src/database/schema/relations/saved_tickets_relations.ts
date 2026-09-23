import { relations } from "drizzle-orm/_relations";
import { schemas } from "../index";

export const savedTicketsRelations = relations(schemas.savedTicket, ({ one }) => ({
  user: one(schemas.user, {
    fields: [schemas.savedTicket.userId],
    references: [schemas.user.id],
  }),

  project: one(schemas.project, {
    fields: [schemas.savedTicket.projectId],
    references: [schemas.project.id],
  }),
}));
