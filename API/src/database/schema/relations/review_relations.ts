import { relations } from "drizzle-orm/_relations";
import { schemas } from "../index";

export const reviewsRelations = relations(schemas.review, ({ one }) => ({
  project: one(schemas.project, {
    fields: [schemas.review.projectId],
    references: [schemas.project.id],
  }),

  reviewer: one(schemas.user, {
    fields: [schemas.review.reviewerId],
    references: [schemas.user.id],
    relationName: "reviews_written",
  }),

  reviewedUser: one(schemas.user, {
    fields: [schemas.review.reviewedUserId],
    references: [schemas.user.id],
    relationName: "reviews_received",
  }),
}));
