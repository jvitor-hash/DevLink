import { schemas } from '@/database/schema/index';
import { review } from '@/database/schema/review_schemas';
import { crud } from "@/modules/crud_factory";
import { eq, and } from "drizzle-orm";

export const ReviewService = {
  ...crud(review),

  /**
   * Fetch reviews received by a given user (programmer profile).
   */
  findReceivedByUser: async (userId: string, limit = 10, offset = 0) => {
    if (limit < 1 || limit > 100) throw new Error("Limit must be between 1 and 100");
    if (offset < 0) throw new Error("Offset must be >= 0");

    return (await import("drizzle-orm").then(({ sql }) =>
      import("@/client").then(({ db }) =>
        db
          .select({
            review: review,
            reviewer: schemas.user,
            project: schemas.project,
          })
          .from(review)
          .leftJoin(schemas.user, eq(review.reviewerId, schemas.user.id))
          .leftJoin(schemas.project, eq(review.projectId, schemas.project.id))
          .where(eq(review.reviewedUserId, userId))
          .limit(limit)
          .offset(offset)
      )
    )) as Array<{
      review: typeof review.$inferSelect;
      reviewer: typeof schemas.user.$inferSelect;
      project: typeof schemas.project.$inferSelect;
    }>;
  },
};
