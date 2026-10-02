import { boolean, doublePrecision, pgTable, timestamp, uniqueIndex, uuid, varchar } from "drizzle-orm/pg-core";
import { languagePreferenceEnum, platformPreferenceEnum } from "@/database/schema/enums_schema";
import { user } from "./user_schema";

export const userPreference = pgTable("user_preference", {
  id: uuid("id").defaultRandom().primaryKey(),
  userId: uuid("user_id")
    .notNull()
    .references(() => user.id, {
      onDelete: "cascade",
    }),
  email_notifications: boolean("email_notifications").default(true).notNull(),
  message_notifications: boolean("message_notifications").default(true).notNull(),
  project_notifications: boolean("project_notifications").default(true).notNull(),
  review_notifications: boolean("review_notifications").default(true).notNull(),
  language: languagePreferenceEnum("language").default("ALL").notNull(),
  platform: platformPreferenceEnum("platform").default("ALL").notNull(),
  maxDeadlineDays: varchar("max_deadline_days", { length: 10 }).default("365").notNull(),
  minBudget: doublePrecision("min_budget").default(0).notNull(),
  maxBudget: doublePrecision("max_budget").default(0).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
},
(table) => [
  uniqueIndex("user_preferences_user_unique").on(table.userId),
]);
