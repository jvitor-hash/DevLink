import { relations } from "drizzle-orm/_relations";
import { session } from "../session_schema";
import { user } from "../user_schema";

export const sessionRelations = relations(session, ({ one }) => ({
  user: one(user, {
    fields: [session.userId],
    references: [user.id],
  }),
}));
