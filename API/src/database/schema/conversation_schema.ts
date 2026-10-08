import { index, integer, pgTable, text, timestamp, uuid } from "drizzle-orm/pg-core";

export const conversation = pgTable("conversation", {
  id: uuid("id").defaultRandom().primaryKey(),
  projectId: uuid("project_id").notNull(),
  userId: uuid("user_id").notNull(),
  recipientId: uuid("recipient_id").notNull(),
  lastMessage: text("last_message"),
  unreadMessages: integer("unread_messages").default(0).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
}, (table) => [
  index("conversation_project_id_idx").on(table.projectId),
  index("conversation_user_id_idx").on(table.userId),
  index("conversation_recipient_id_idx").on(table.recipientId)
]);
