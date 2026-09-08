import { relations } from "drizzle-orm/_relations";
import { schemas } from ".";
import { userPreference } from "./user_preferences_schema";

export const userPreferencesRelations = relations(userPreference, ({ one }) => ({
  user: one(schemas.user, {
    fields: [userPreference.userId],
    references: [schemas.user.id],
  }),
}));
