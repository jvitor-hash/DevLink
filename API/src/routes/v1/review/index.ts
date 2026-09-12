import Elysia from "elysia";
import { ReviewService } from "./service";
import { ReviewSchema, ReviewCreateSchema, ReviewUpdateSchema, type ReviewCreate, type ReviewUpdate } from "@/database/data-transfer-object/review_dto";
import { z } from "zod";
import { ErrorSchema } from "@/modules/error_schema";
import { and, eq, type SQL } from "drizzle-orm";
import { schemas } from "@/database/schema";
import { authPlugin } from "@/modules/auth_plugin";

export const ReviewRouter = new Elysia({ prefix: "/api/v1/reviews" })
  .use(authPlugin)
  .post("/", async ({ body, user, set }) => {
    try {
      const data = body as ReviewCreate;
      const newReview = await ReviewService.create({
        ...data,
        reviewerId: schemas.user.id,
      });
      set.status = 201;
      return newReview;
    } catch (error) {
      set.status = 500;
      return { error: "Failed to create review" };
    }
  }, {
    body: ReviewCreateSchema,
    response: {
      201: ReviewSchema,
      500: ErrorSchema,
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
    }
  }, {
    query: z.object({
      limit: z.coerce.number().min(1).max(100).default(10),
      offset: z.coerce.number().min(0).default(0),
    }),
    response: {
      200: z.array(ReviewSchema),
      500: ErrorSchema,
    },
    tags: ["Reviews"],
    auth: true,
  })
  .get("/by-user/:userId", async ({ params, query, set }) => {
    try {
      return await ReviewService.findReceivedByUser(params.userId, query.limit, query.offset);
    } catch (error) {
      set.status = 500;
      return { error: "Failed to fetch reviews" };
    }
  }, {
    params: z.object({
      userId: z.string().uuid(),
    }),
    query: z.object({
      limit: z.coerce.number().min(1).max(100).default(10),
      offset: z.coerce.number().min(0).default(0),
    }),
    response: {
      200: z.array(
        z.object({
          review: ReviewSchema,
          reviewer: z.object({
            id: z.string(),
            name: z.string(),
            image: z.string().nullable(),
          }),
          project: z.object({
            id: z.string(),
            title: z.string(),
          }),
        })
      ),
      500: ErrorSchema,
    },
    tags: ["Reviews"],
    auth: true,
  })
  .get("/:id", async ({ params, set }) => {
    try {
      const reviewItem = await ReviewService.findOne(eq(schemas.review.id, params.id));
      return reviewItem;
    } catch (error) {
      set.status = 404;
      return { error: "Review not found" };
    }
  }, {
    params: z.object({
      id: z.string().uuid(),
    }),
    response: {
      200: ReviewSchema,
      404: ErrorSchema,
      500: ErrorSchema,
    },
    tags: ["Reviews"],
    auth: true,
  })
  .put("/:id", async ({ body, params, user, set }) => {
    try {
      const data = body as ReviewUpdate;
      const updated = await ReviewService.update(
        and(eq(schemas.review.id, params.id), eq(schemas.review.reviewerId, schemas.user.id)) as SQL<unknown>,
        data
      );
      return updated;
    } catch (error) {
      set.status = 404;
      return { error: "Review not found or unauthorized" };
    }
  }, {
    params: z.object({
      id: z.string().uuid(),
    }),
    body: ReviewUpdateSchema,
    response: {
      200: ReviewSchema,
      404: ErrorSchema,
      500: ErrorSchema,
    },
    tags: ["Reviews"],
    auth: true,
  })
  .delete("/:id", async ({ params, user, set }) => {
    try {
      const deleted = await ReviewService.remove(
        and(eq(schemas.review.id, params.id), eq(schemas.review.reviewerId, schemas.user.id)) as SQL<unknown>
      );
      return deleted;
    } catch (error) {
      set.status = 404;
      return { error: "Review not found or unauthorized" };
    }
  }, {
    params: z.object({
      id: z.string().uuid(),
    }),
    response: {
      200: ReviewSchema,
      404: ErrorSchema,
      500: ErrorSchema,
    },
    tags: ["Reviews"],
    auth: true,
  });
