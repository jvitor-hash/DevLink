import { relations } from "drizzle-orm/_relations";
import { userPreference } from "./user_preferences_schema";
import { user } from "./user_schema";

export const userPreferencesRelations = relations(userPreference, ({ one }) => ({
  user: one(user, {
    fields: [userPreference.userId],
    references: [user.id],
  }),
}));
