import { sql } from "drizzle-orm";
import { text, timestamp } from "drizzle-orm/pg-core/columns";
import { index } from "drizzle-orm/pg-core/indexes";
import { pgTable } from "drizzle-orm/pg-core/table";

export const verification = pgTable(
  "verification",
  {
    id: text("id").primaryKey().default(sql`gen_random_uuid()::text`),
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
