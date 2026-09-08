import { boolean, index, pgTable, text, timestamp, uuid, varchar } from "drizzle-orm/pg-core";
import { notificationTypeEnum } from "@/database/schema/enums_schema";
import { schemas } from ".";

export const notification = pgTable("notification", {
    id: uuid("id").defaultRandom().primaryKey(),
    userId: uuid("user_id")
      .notNull()
      .references(() => schemas.user.id, {
        onDelete: "cascade",
      }),
    type: notificationTypeEnum("type").notNull(),
    title: varchar("title", { length: 200 }).notNull(),
    message: text("message").notNull(),
    projectId: uuid("project_id").references(() => schemas.project.id, {
      onDelete: "set null",
    }),
    isRead: boolean("is_read").default(false).notNull(),
    createdAt: timestamp("created_at").defaultNow().notNull(),
  },
  (table) => [
    index("notifications_user_id_idx").on(table.userId),
    index("notifications_user_unread_idx").on(table.userId, table.isRead),
    index("notifications_created_at_idx").on(table.createdAt,),
  ],
);
