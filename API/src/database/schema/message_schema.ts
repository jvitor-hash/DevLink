import { boolean, index, numeric, pgTable, text, timestamp, uuid } from "drizzle-orm/pg-core";
import { conversation } from "./conversation_schema";
import { messageTypeEnum, offerStatusEnum } from "./enums_schema";

export const message = pgTable("message", {
  id: uuid("id").defaultRandom().primaryKey(),
  conversationId: uuid("conversation_id")
        .notNull()
        .references(() => conversation.id, {
          onDelete: "cascade",
        }),
  content: text("content").notNull(),
  userId: uuid("user_id").notNull(),
  isRead: boolean("is_read").default(false).notNull(),
  readAt: timestamp("read_at"),
  messageType: messageTypeEnum("message_type").default("MESSAGE").notNull(),
  offerStatus: offerStatusEnum("offer_status"),
  offerMoney: numeric("offer_money", { precision: 12, scale: 2 }),
  offerDeadline: timestamp("offer_deadline"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
},
(table) => [
  index("message_conversation_id_idx").on(table.conversationId),
  index("message_created_at_idx").on(table.createdAt),
]);
