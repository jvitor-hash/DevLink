import z from "zod";

// Reusable Schemas
export const ErrorSchema = z.object({
  error: z.string(),
});
