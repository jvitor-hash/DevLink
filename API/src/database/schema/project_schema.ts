import { varchar, timestamp, uuid, text, index, doublePrecision } from "drizzle-orm/pg-core";
import { pgTable } from "drizzle-orm/pg-core/table";
import { platformTypeEnum, programmingLanguageEnum, projectStatusEnum, audienceEnum } from "@/database/schema/enums_schema";
import { user } from "./user_schema";

export const project = pgTable("project", {
  id: uuid("id").defaultRandom().primaryKey(),
  clientId: uuid("client_id")
    .notNull()
    .references(() => user.id, {
      onDelete: "cascade",
    }),
  programmerId: uuid("programmer_id")
    .references(() => user.id, {
      onDelete: "set null",
    }),
  title: varchar("title", { length: 200 }).notNull(),
  description: text("description").notNull(),
  category: varchar("category", { length: 200 }).notNull(),
  sub_category: varchar("sub_category", { length: 200 }).notNull(),
  primaryLanguage: programmingLanguageEnum("primary_language").default("CSHARP").notNull(),
  platforms: platformTypeEnum("platforms").array().notNull(),
  status: projectStatusEnum("status").default("OPEN").notNull(),
  problem: text("problem"),
  user_actions: text("user_actions"),
  affectedUsers: text("affected_users"),
  northQuestion: text("north_question"),
  hypothesis: text("hypothesis"),
  audiencePainPoints: text("audience_pain_points"),
  audienceAssumptions: text("audience_assumptions"),
  notAudience: text("not_audience"),
  requirements: text("requirements"),
  successCriteria: text("success_criteria"),
  valueProposition: text("value_proposition"),
  differentiation: text("differentiation"),
  audience: audienceEnum("audience").default("CLIENTS").notNull(),
  minBudget: doublePrecision("min_budget").notNull(),
  maxBudget: doublePrecision("max_budget").notNull(),
  deadline: timestamp("deadline"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
  completedAt: timestamp("completed_at"),
},
(table) => [
  index("projects_client_id_idx").on(table.clientId),
  index("projects_programmer_id_idx").on(table.programmerId),
  index("projects_status_idx").on(table.status),
]);
