import { relations } from "drizzle-orm/_relations";
import { user } from "./user_schema";
import { project } from "./project_schema";

export const usersRelations = relations(user, ({ many }) => ({
  project: many(project),
}));

export const projectRelations = relations(project, ({ one }) => ({
  user: one(user, {
    fields: [project.authorId],
    references: [user.id],
  }),
}));