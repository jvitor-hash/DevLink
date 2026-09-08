import { index, pgTable, timestamp, uniqueIndex, uuid } from "drizzle-orm/pg-core";
import { schemas } from ".";

export const savedTicket = pgTable("saved_ticket", {
    id: uuid("id").defaultRandom().primaryKey(),
    userId: uuid("user_id")
      .notNull()
      .references(() => schemas.user.id, {
        onDelete: "cascade",
      }),
    projectId: uuid("project_id")
      .notNull()
      .references(() => schemas.project.id, {
        onDelete: "cascade",
      }),
    createdAt: timestamp("created_at").defaultNow().notNull(),
  },
  (table) => [
    uniqueIndex("saved_ticket_user_project_unique").on(table.userId, table.projectId),
    index("saved_tickets_user_id_idx").on(table.userId),
    index("saved_tickets_project_id_idx").on(table.projectId),
  ],
);
