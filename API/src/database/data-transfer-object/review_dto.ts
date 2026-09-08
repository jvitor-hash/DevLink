import z from "zod";
import { createCrudSchemas, idSchema, timestampsSchema } from "./helper";

export const ReviewSchema = z.object({
  id: idSchema,
  projectId: idSchema,
  reviewerId: idSchema,
  reviewedUserId: idSchema,
  title: z.string().max(150),
  description: z.string(),
  rating: z.number().int().min(1).max(5),
}).merge(timestampsSchema);

const ReviewDTOs = createCrudSchemas(ReviewSchema, [
  "id"
]);

export const ReviewCreateSchema = ReviewDTOs.create;
export const ReviewUpdateSchema = ReviewDTOs.update;

// export type ReviewDTO = z.infer<typeof ReviewDTOs.dto>;
// export type ReviewCreate = z.infer<typeof ReviewDTOs.create>;
// export type ReviewUpdate = z.infer<typeof ReviewDTOs.update>;
