import { index, integer, pgTable, text, timestamp, uuid, varchar } from "drizzle-orm/pg-core";
import { ticketStatusEnum } from "./enums_schema";
import { user } from "./user_schema";
import { project } from "./project_schema";

export const ticket = pgTable("ticket", {
  id: uuid("id").defaultRandom().primaryKey(),
  projectId: uuid("project_id")
    .notNull()
    .references(() => project.id, {
      onDelete: "cascade",
    }),
  creatorId: uuid("creator_id")
    .notNull()
    .references(() => user.id, {
      onDelete: "cascade",
    }),
  assigneeId: uuid("assignee_id").references(() => user.id, {
    onDelete: "set null",
  }),
  title: varchar("title", { length: 200 }).notNull(),
  description: text("description"),
  status: ticketStatusEnum("status").default("BACKLOG").notNull(),
  position: integer("position").default(0).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
},
(table) => [
  index("tickets_project_id_idx").on(table.projectId),
  index("tickets_status_idx").on(table.status),
  index("tickets_creator_id_idx").on(table.creatorId),
]);
