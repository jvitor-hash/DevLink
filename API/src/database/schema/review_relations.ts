import { relations } from "drizzle-orm/_relations";
import { review } from "./review_schemas";
import { project } from "./project_schema";
import { user } from "./user_schema";

export const reviewsRelations = relations(review, ({ one }) => ({
  project: one(project, {
    fields: [review.projectId],
    references: [project.id],
  }),

  reviewer: one(user, {
    fields: [review.reviewerId],
    references: [user.id],
    relationName: "reviews_written",
  }),

  reviewedUser: one(user, {
    fields: [review.reviewedUserId],
    references: [user.id],
    relationName: "reviews_received",
  }),
}));
