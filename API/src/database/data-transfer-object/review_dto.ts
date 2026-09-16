import { z } from "zod";
import { createCrudSchemas, idSchema, timestampsSchema } from "./helper";

export const ReviewSchema = z.object({
  id: idSchema,
  projectId: idSchema,
  reviewerId: idSchema,
  reviewedUserId: idSchema,
  title: z.string().min(1).max(150),
  description: z.string().min(1),
  rating: z.number().int().min(0).max(5),
}).merge(timestampsSchema);

const ReviewDTOs = createCrudSchemas(ReviewSchema, [
  "id",
  "reviewerId",
  "createdAt",
  "updatedAt",
]);

export const ReviewCreateSchema = ReviewDTOs.create;
export const ReviewUpdateSchema = ReviewDTOs.update;

export type ReviewDTO = z.infer<typeof ReviewSchema>;
export type ReviewCreate = z.infer<typeof ReviewCreateSchema>;
export type ReviewUpdate = z.infer<typeof ReviewUpdateSchema>;
