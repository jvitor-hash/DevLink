import { relations } from "drizzle-orm/_relations";
import { account } from "../account_schema";
import { user } from "../user_schema";

export const accountRelations = relations(account, ({ one }) => ({
  user: one(user, {
    fields: [account.userId],
    references: [user.id],
  }),
}));
