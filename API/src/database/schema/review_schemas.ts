import { index, integer, pgTable, text, timestamp, uniqueIndex, uuid, varchar } from "drizzle-orm/pg-core";
import { schemas } from ".";

export const review = pgTable("review", {
    id: uuid("id").defaultRandom().primaryKey(),
    projectId: uuid("project_id")
      .notNull()
      .references(() => schemas.project.id, {
        onDelete: "cascade",
      }),
    reviewerId: uuid("reviewer_id")
      .notNull()
      .references(() => schemas.user.id, {
        onDelete: "cascade",
      }),
    reviewedUserId: uuid("reviewed_user_id")
      .notNull()
      .references(() => schemas.user.id, {
        onDelete: "cascade",
      }),
    title: varchar("title", {
      length: 150,
    }).notNull(),
    description: text("description").notNull(),
    rating: integer("rating").notNull(),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at").defaultNow().notNull(),
  },
  (table) => [
    index("reviews_project_id_idx").on(table.projectId),
    index("reviews_reviewed_user_id_idx").on(table.reviewedUserId),
    index("reviews_reviewer_id_idx").on(table.reviewerId),

    // Impede que a mesma pessoa avalie a mesma pessoa duas vezes no mesmo projeto.
    uniqueIndex("reviews_project_reviewer_reviewed_unique").on(
      table.projectId,
      table.reviewerId,
      table.reviewedUserId,
    ),
  ],
);
