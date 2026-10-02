import { index, jsonb, pgTable, text, timestamp, uuid } from "drizzle-orm/pg-core";
import { projectActionEnum } from "./enums_schema";

export const projectActions = pgTable("project_actions", {
  id: uuid("id").defaultRandom().primaryKey(),
  action_type: projectActionEnum("action_type").notNull(),
  user_id: uuid("user_id").notNull(),
  project_id: uuid("project_id"),
  payload: jsonb("payload").notNull(),
  status: text("status").default("COMPLETED").notNull(),
  created_at: timestamp("created_at").defaultNow().notNull(),
}, (table) => [
  index("project_actions_user_id_idx").on(table.user_id),
  index("project_actions_project_id_idx").on(table.project_id),
]);

export type ProjectAction = typeof projectActions.$inferSelect;
export type NewProjectAction = typeof projectActions.$inferInsert;
