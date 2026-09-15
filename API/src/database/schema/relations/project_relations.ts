import { relations } from "drizzle-orm/_relations";
import { user } from "../user_schema";
import { project } from "../project_schema";
import { message } from "../message_schema";
import { review } from "../review_schemas";
import { savedTicket } from "../saved_ticket_schema";
import { notification } from "../notification_schema";

export const projectsRelations = relations(project, ({ one, many }) => ({
  message: many(message),
  reviews: many(review),
  savedBy: many(savedTicket),
  notifications: many(notification),
  client: one(user, {
    fields: [project.clientId],
    references: [user.id],
    relationName: "client_projects",
  }),
  programmer: one(user, {
    fields: [project.programmerId],
    references: [user.id],
    relationName: "programmer_projects",
  }),
}));
