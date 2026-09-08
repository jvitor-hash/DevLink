import { boolean, index, pgTable, text, timestamp, uuid } from "drizzle-orm/pg-core";
import { schemas } from ".";

export const message = pgTable("message", {
    id: uuid("id").defaultRandom().primaryKey(),
    projectId: uuid("project_id")
      .notNull()
      .references(() => schemas.project.id, {
        onDelete: "cascade",
      }),
    senderId: uuid("sender_id")
      .notNull()
      .references(() => schemas.user.id, {
        onDelete: "cascade",
      }),
    content: text("content").notNull(),
    isRead: boolean("is_read").default(false).notNull(),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at").defaultNow().notNull(),
  },
  (table) => [
    index("messages_project_id_idx").on(table.projectId),
    index("messages_sender_id_idx").on(table.senderId),
    index("messages_created_at_idx").on(table.createdAt),
  ],
);
