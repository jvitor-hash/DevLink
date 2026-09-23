import { relations } from "drizzle-orm/_relations";
import { schemas } from "../index";

export const accountRelations = relations(schemas.account, ({ one }) => ({
  user: one(schemas.user, {
    fields: [schemas.account.userId],
    references: [schemas.user.id],
  }),
}));
