import { index, integer, jsonb, pgTable, text, timestamp, uuid } from "drizzle-orm/pg-core";
import { outboxStatusEnum } from "./enums_schema";

export const outboxEvents = pgTable("outbox_events", {
  id: uuid("id").defaultRandom().primaryKey(),
  event_type: text("event_type").notNull(),
  aggregate_type: text("aggregate_type").notNull(),
  aggregate_id: uuid("aggregate_id").notNull(),
  payload: jsonb("payload").notNull(),
  status: outboxStatusEnum("status").default("PENDING").notNull(),
  attempts: integer("attempts").default(0).notNull(),
  available_at: timestamp("available_at").defaultNow().notNull(),
  locked_at: timestamp("locked_at"),
  locked_by: text("locked_by"),
  last_error: text("last_error"),
  idempotency_key: text("idempotency_key").unique(),
  created_at: timestamp("created_at").defaultNow().notNull(),
  processed_at: timestamp("processed_at"),
}, (table) => [
  index("idx_outbox_pending").on(table.status, table.available_at),
]);

export type OutboxEvent = typeof outboxEvents.$inferSelect;
export type NewOutboxEvent = typeof outboxEvents.$inferInsert;
