import { relations } from "drizzle-orm/_relations";
import { review } from "./review_schemas";
import { schemas } from ".";

export const reviewsRelations = relations(review, ({ one }) => ({
  project: one(schemas.project, {
    fields: [review.projectId],
    references: [schemas.project.id],
  }),

  reviewer: one(schemas.user, {
    fields: [review.reviewerId],
    references: [schemas.user.id],
    relationName: "reviews_written",
  }),

  reviewedUser: one(schemas.user, {
    fields: [review.reviewedUserId],
    references: [schemas.user.id],
    relationName: "reviews_received",
  }),
}));
