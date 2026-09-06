import { integer, varchar, timestamp, uuid, text, boolean } from "drizzle-orm/pg-core";
import { schemas } from './index';
import { pgTable } from "drizzle-orm/pg-core/table";

export const project = pgTable("project", {
  id: integer("id").primaryKey(),
  authorId: text("user_id").notNull().references(() => schemas.user.id),
  title: varchar("title", { length: 255 }).notNull().unique(),
  category: varchar("category", { length: 255}).notNull(),
  subcategory: varchar("sub_category", { length: 255 }).notNull(),
  problem: text("problem").notNull(),
  public: varchar("public", { length: 128 }).notNull(),
  programming_language: varchar("programming_language", { length: 50 }).notNull(),
  internet_access: boolean("internet_access").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull()
});
