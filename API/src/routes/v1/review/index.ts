import Elysia from "elysia";
import { ReviewService } from "./service";
import { ReviewSchema, ReviewCreateSchema, ReviewUpdateSchema } from "@/database/data-transfer-object/review_dto";
import z from "zod";
import { ErrorSchema } from "@/modules/error_schema";
import { eq } from "drizzle-orm";
import { schemas } from "@/database/schema";

export const ReviewRouter = new Elysia({ prefix: "/api/v1/reviews" })
  .post("/", async ({ body, set }) => {
    try {
      await ReviewService.create(body);
    } catch (error) {
      set.status = 500;
      return { error: "Failed to create reviews" };
    }
  }, {
    body: ReviewCreateSchema,
    response: {
      201: ReviewSchema,
      500: ErrorSchema
    },
    tags: ["Reviews"],
    auth: true,
  })
  .get("/", async ({ query, set }) => {
    try {
      return await ReviewService.findAll(query.limit, query.offset);
    } catch (error) {
      set.status = 500;
      return { error: "Failed to fetch reviews" };
    };
  }, {
    query: z.object({
      limit: z.number().min(10).max(100).default(10),
      offset: z.number().min(0).default(0),
    }),
    response: {
      200: z.array(ReviewCreateSchema),
      500: ErrorSchema,
    },
    tags: ["Reviews"],
    auth: true,
  })
  .get("/:id", async ({ params, set }) => {
    try {
      const [project] = await ReviewService.findWhere(eq(schemas.review.id, params.id));
      return project;
    } catch (error) {
      set.status = 404;
      return { error: "Review not found" };
    }
  }, {
    params: z.object({
      id: z.uuid()
    }),
    response: {
      200: ReviewSchema,
      404: ErrorSchema,
      500: ErrorSchema
    },
    tags: ["Reviews"],
    auth: true
  })
  .put("/:id", async ({ body, params, set }) => {
    try {
      return await ReviewService.update(eq(schemas.review.id, params.id), body);
    } catch (error) {
      set.status = 404;
      return { error: "Review not found" };
    }
  }, {
    params: z.object({
      id: z.uuid()
    }),
    body: ReviewUpdateSchema,
    response: {
      200: z.array(ReviewUpdateSchema),
      404: ErrorSchema,
      500: ErrorSchema
    },
    tags: ["Reviews"],
    auth: true
  })
  .delete("/:id", async ({ params, set }) => {
    try {
      return await ReviewService.remove(eq(schemas.review.id, params.id));
    } catch (error) {
      set.status = 500;
      return { error: "Failed to delete review" };
    }
  }, {
    params: z.object({
      id: z.uuid()
    }),
    response: {
      200: z.object({
        id: z.number()
      }),
      404: ErrorSchema,
      500: ErrorSchema
    },
    tags: ["Reviews"],
    auth: true
  })
