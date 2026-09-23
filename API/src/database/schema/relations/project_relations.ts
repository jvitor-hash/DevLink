import { relations } from "drizzle-orm/_relations";
import { schemas } from "../index";

export const projectsRelations = relations(schemas.project, ({ one, many }) => ({
  message: many(schemas.message),
  reviews: many(schemas.review),
  savedBy: many(schemas.savedTicket),
  notifications: many(schemas.notification),
  client: one(schemas.user, {
    fields: [schemas.project.clientId],
    references: [schemas.user.id],
    relationName: "client_projects",
  }),
  programmer: one(schemas.user, {
    fields: [schemas.project.programmerId],
    references: [schemas.user.id],
    relationName: "programmer_projects",
  }),
}));
