import { boolean, index, pgTable, text, timestamp, uuid, varchar } from "drizzle-orm/pg-core";
import { project } from "./project_schema";

export const todo = pgTable("todo", {
  id: uuid("id").defaultRandom().primaryKey(),
  projectId: uuid("project_id")
    .notNull()
    .references(() => project.id, {
      onDelete: "cascade",
    }),
  title: varchar("title", { length: 200 }).notNull(),
  description: text("description"),
  isDone: boolean("is_done").default(false).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
},
(table) => [
  index("todos_project_id_idx").on(table.projectId),
]);
