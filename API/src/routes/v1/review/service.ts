import { review } from "@/database/schema/review_schemas";
import { crud } from "@/modules/crud_factory";

export const ReviewService = {
  ...crud(review)
};
