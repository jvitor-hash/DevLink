import { index, pgTable, timestamp, uniqueIndex, uuid } from "drizzle-orm/pg-core";
import { user } from "./user_schema";
import { project } from "./project_schema";

export const savedTicket = pgTable("saved_ticket", {
  id: uuid("id").defaultRandom().primaryKey(),
  userId: uuid("user_id")
    .notNull()
    .references(() => user.id, {
      onDelete: "cascade",
    }),
  projectId: uuid("project_id")
    .notNull()
    .references(() => project.id, {
      onDelete: "cascade",
    }),
  createdAt: timestamp("created_at").defaultNow().notNull(),
},
(table) => [
  uniqueIndex("saved_ticket_user_project_unique").on(table.userId, table.projectId),
  index("saved_tickets_user_id_idx").on(table.userId),
  index("saved_tickets_project_id_idx").on(table.projectId),
]);
