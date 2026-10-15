import { relations } from "drizzle-orm/_relations";
import { schemas } from "../index";

export const saveProjectRelations = relations(schemas.saveProject, ({ one }) => ({
  user: one(schemas.user, {
    fields: [schemas.saveProject.userId],
    references: [schemas.user.id],
  }),

  project: one(schemas.project, {
    fields: [schemas.saveProject.projectId],
    references: [schemas.project.id],
  }),
}));
