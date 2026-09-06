import { relations } from "drizzle-orm/_relations";
import { user } from "./user_schema";
import { session } from "./session_schema";

export const sessionRelations = relations(session, ({ one }) => ({
  user: one(user, {
    fields: [session.userId],
    references: [user.id],
  }),
}));
