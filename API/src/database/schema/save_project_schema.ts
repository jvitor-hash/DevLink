import { pgTable, timestamp, uuid } from "drizzle-orm/pg-core";

export const saveProject = pgTable("save_project", {
    id: uuid("id").defaultRandom().primaryKey(),
    userId: uuid("user_id").notNull(),
    projectId: uuid("project_id").notNull(),
    createdAt: timestamp("created_at").defaultNow().notNull()
});