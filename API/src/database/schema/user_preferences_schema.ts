import { boolean, pgTable, timestamp, uniqueIndex, uuid } from "drizzle-orm/pg-core";
import { schemas } from ".";

export const userPreference = pgTable("user_preference", {
    id: uuid("id").defaultRandom().primaryKey(),
    userId: uuid("user_id")
      .notNull()
      .references(() => schemas.user.id, {
        onDelete: "cascade",
      }),
    emailNotifications: boolean("email_notifications").default(true).notNull(),
    messageNotifications: boolean("message_notifications").default(true).notNull(),
    projectNotifications: boolean("project_notifications").default(true).notNull(),
    reviewNotifications: boolean("review_notifications").default(true).notNull(),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at").defaultNow().notNull(),
  },
  (table) => [
    uniqueIndex("user_preferences_user_unique").on(table.userId),
  ],
);
