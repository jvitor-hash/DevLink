import { text, timestamp } from "drizzle-orm/pg-core/columns";
import { index } from "drizzle-orm/pg-core/indexes";
import { pgTable } from "drizzle-orm/pg-core/table";
import { session } from "./session_schema";
import { account } from "./account_schema";
import { relations } from "drizzle-orm/_relations";
import { user } from "./user_schema";

export const verification = pgTable(
  "verification",
  {
    id: text("id").primaryKey(),
    identifier: text("identifier").notNull(),
    value: text("value").notNull(),
    expiresAt: timestamp("expires_at").notNull(),
    createdAt: timestamp("created_at").notNull(),
    updatedAt: timestamp("updated_at")
      .$onUpdate(() => new Date())
      .notNull(),
  },
  (table) => [index("verification_identifier_idx").on(table.identifier)],
);

export const userRelations = relations(user, ({ many }) => ({
  sessions: many(session),
  accounts: many(account),
}));
