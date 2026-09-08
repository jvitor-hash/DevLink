import { varchar, timestamp, uuid, text, index } from "drizzle-orm/pg-core";
import { schemas } from './index';
import { pgTable } from "drizzle-orm/pg-core/table";
import { platformTypeEnum, programmingLanguageEnum, projectStatusEnum } from "@/database/schema/enums_schema";

export const project = pgTable("project", {
  id: uuid("id").defaultRandom().primaryKey(),
  clientId: uuid("client_id")
      .notNull()
      .references(() => schemas.user.id, {
    onDelete: "cascade",
  }),
  programmerId: uuid("programmer_id")
  .references(() => schemas.user.id, {
    onDelete: "set null",
  }),
  title: varchar("title", { length: 200 }).notNull(),
  description: text("description").notNull(),
  category: varchar("category", { length: 200 }).notNull(),
  sub_category: varchar("sub_category", { length: 200 }).notNull(),
  primaryLanguage: programmingLanguageEnum("primaryLanguage").default("CSHARP").notNull(),
  platforms: platformTypeEnum("platforms").array().notNull(),
  status: projectStatusEnum("status").default("OPEN").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
  completedAt: timestamp("completed_at"),
  },
  (table) => [
    index("projects_client_id_idx").on(table.clientId),
    index("projects_programmer_id_idx").on(table.programmerId),
    index("projects_status_idx").on(table.status),
  ],
);
