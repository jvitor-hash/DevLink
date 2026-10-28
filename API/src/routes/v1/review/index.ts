import Elysia from "elysia";
import { z } from "zod";
import { ReviewSchema, ReviewCreateSchema, ReviewUpdateSchema } from "@/database/data-transfer-object/review_dto";
import { ErrorSchema } from "@/modules/error_schema";
import { authPlugin } from "@/modules/auth_plugin";
import { ReviewController } from "@/app/dependencies";

const pagination = z.object({ limit: z.coerce.number().min(1).max(100).default(10), offset: z.coerce.number().min(0).default(0) });
const id = z.object({ id: z.string().uuid() });
const receivedReview = z.object({ review: ReviewSchema, reviewer: z.object({ id: z.string(), name: z.string(), image: z.string().nullable() }), project: z.object({ id: z.string(), title: z.string() }) });

export const ReviewRouter = new Elysia({ prefix: "/api/v1/reviews" })
  .use(authPlugin)
  .post("/", ReviewController.create, { body: ReviewCreateSchema, response: { 201: ReviewSchema, 500: ErrorSchema }, tags: ["Reviews"], auth: true })
  .get("/", ReviewController.list, { query: pagination, response: { 200: z.array(ReviewSchema), 500: ErrorSchema }, tags: ["Reviews"], auth: true })
  .get("/by-user/:userId", ReviewController.byUser, { params: z.object({ userId: z.string().uuid() }), query: pagination, response: { 200: z.array(receivedReview), 500: ErrorSchema }, tags: ["Reviews"], auth: true })
  .get("/:id", ReviewController.get, { params: id, response: { 200: ReviewSchema, 404: ErrorSchema, 500: ErrorSchema }, tags: ["Reviews"], auth: true })
  .put("/:id", ReviewController.update, { params: id, body: ReviewUpdateSchema, response: { 200: ReviewSchema, 404: ErrorSchema, 500: ErrorSchema }, tags: ["Reviews"], auth: true })
  .delete("/:id", ReviewController.remove, { params: id, response: { 200: ReviewSchema, 404: ErrorSchema, 500: ErrorSchema }, tags: ["Reviews"], auth: true });
