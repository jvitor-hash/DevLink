import { relations } from "drizzle-orm/_relations";
import { user } from "./user_schema";
import { session } from "./session_schema";
import { account } from "./account_schema";

export const userRelations = relations(user, ({ many }) => ({
  sessions: many(session),
  accounts: many(account),
}));
