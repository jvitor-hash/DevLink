import { boolean, index, pgTable, text, timestamp, uniqueIndex, uuid, varchar } from "drizzle-orm/pg-core";
import { notificationTypeEnum } from "@/database/schema/enums_schema";
import { user } from "./user_schema";
import { project } from "./project_schema";
import { outbox } from "./outbox_schema";

export const notification = pgTable("notification", {
  id: uuid("id").defaultRandom().primaryKey(),
  outboxId: uuid("outbox_id").references(() => outbox.id, {
    onDelete: "set null",
  }),
  userId: uuid("user_id")
    .notNull()
    .references(() => user.id, {
      onDelete: "cascade",
    }),
  type: notificationTypeEnum("type").notNull(),
  title: varchar("title", { length: 200 }).notNull(),
  message: text("message").notNull(),
  projectId: uuid("project_id").references(() => project.id, {
    onDelete: "set null",
  }),
  isRead: boolean("is_read").default(false).notNull(),
  archived: boolean("archived").default(false).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
}, (table) => [
  index("notifications_user_id_idx").on(table.userId),
  index("notifications_user_unread_idx").on(table.userId, table.isRead),
  index("notifications_created_at_idx").on(table.createdAt),
  index("notifications_outbox_id_idx").on(table.outboxId),
  uniqueIndex("notifications_user_outbox_unique").on(table.userId, table.outboxId),
]);
