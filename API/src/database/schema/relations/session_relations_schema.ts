import { relations } from "drizzle-orm/_relations";
import { schemas } from "../index";

export const sessionRelations = relations(schemas.session, ({ one }) => ({
  user: one(schemas.user, {
    fields: [schemas.session.userId],
    references: [schemas.user.id],
  }),
}));
