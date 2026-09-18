import { boolean, index, pgTable, text, timestamp, uuid, varchar } from "drizzle-orm/pg-core";
import { offerStatusEnum } from "./enums_schema";
import { user } from "./user_schema";
import { project } from "./project_schema";

export const message = pgTable("message", {
  id: uuid("id").defaultRandom().primaryKey(),
  projectId: uuid("project_id")
    .notNull()
    .references(() => project.id, {
      onDelete: "cascade",
    }),
  senderId: uuid("sender_id")
    .notNull()
    .references(() => user.id, {
      onDelete: "cascade",
    }),
  content: text("content").notNull(),
  isRead: boolean("is_read").default(false).notNull(),
  offerDeadline: timestamp("offer_deadline"),
  offerStatus: offerStatusEnum("offer_status"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
},
(table) => [
  index("messages_project_id_idx").on(table.projectId),
  index("messages_sender_id_idx").on(table.senderId),
  index("messages_created_at_idx").on(table.createdAt),
]);
