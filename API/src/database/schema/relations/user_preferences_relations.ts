import { relations } from "drizzle-orm/_relations";
import { schemas } from "../index";

export const userPreferencesRelations = relations(schemas.userPreference, ({ one }) => ({
  user: one(schemas.user, {
    fields: [schemas.userPreference.userId],
    references: [schemas.user.id],
  }),
}));
