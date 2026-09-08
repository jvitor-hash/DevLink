import { relations } from "drizzle-orm/_relations";
import { user } from "./user_schema";
import { project } from "./project_schema";
import { schemas } from ".";

export const usersRelations = relations(user, ({ many }) => ({
  project: many(project),
}));

export const projectsRelations = relations(project, ({ one, many }) => ({
  message: many(schemas.message),
  reviews: many(schemas.review),
  savedBy: many(schemas.savedTicket),
  notifications: many(schemas.notification),
  user: one(user, {
      fields: [project.clientId],
      references: [user.id],
    }),
}));
