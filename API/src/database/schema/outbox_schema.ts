import { boolean, index, integer, pgTable, text, timestamp, uniqueIndex, uuid, varchar } from "drizzle-orm/pg-core";
import { user } from "./user_schema";

// Transactional outbox: rows are written by route services and drained by
// processOutbox (immediate attempt plus scheduler sweep with retries).
export const outbox = pgTable("outbox", {
  id: uuid("id").defaultRandom().primaryKey(),
  aggregateType: varchar("aggregate_type", { length: 100 }).notNull(),
  aggregateId: varchar("aggregate_id", { length: 200 }).notNull(),
  eventType: varchar("event_type", { length: 100 }).notNull(),
  payload: text("payload").notNull(),
  status: varchar("status", { length: 20 }).default("PENDING").notNull(),
  retryCount: integer("retry_count").default(0).notNull(),
  errorMessage: text("error_message"),
  processedAt: timestamp("processed_at"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
}, (table) => [
  index("outbox_status_retry_idx").on(table.status, table.retryCount),
  index("outbox_created_at_idx").on(table.createdAt),
]);

// Registrations for outbound webhook delivery; events are signed with the secret.
export const webhookSubscription = pgTable("webhook_subscription", {
  id: uuid("id").defaultRandom().primaryKey(),
  userId: uuid("user_id")
    .notNull()
    .references(() => user.id, {
      onDelete: "cascade",
    }),
  url: text("url").notNull(),
  secret: varchar("secret", { length: 100 }).notNull(),
  isActive: boolean("is_active").default(true).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
}, (table) => [
  uniqueIndex("webhook_subscriptions_user_url_unique").on(table.userId, table.url),
  index("webhook_subscriptions_active_idx").on(table.isActive),
]);
