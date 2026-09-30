import { index, pgTable, timestamp, uuid, varchar } from "drizzle-orm/pg-core";
import { user } from "./user_schema";

// One ECDH public key per chat session; peers try every stored key when
// decrypting history so a page reload never breaks old conversations.
export const chatSessionKey = pgTable("chat_session_key", {
  id: uuid("id").defaultRandom().primaryKey(),
  userId: uuid("user_id")
    .notNull()
    .references(() => user.id, {
      onDelete: "cascade",
    }),
  publicKey: varchar("public_key", { length: 512 }).notNull().unique(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
},
(table) => [
  index("chat_session_keys_user_id_idx").on(table.userId),
]);
