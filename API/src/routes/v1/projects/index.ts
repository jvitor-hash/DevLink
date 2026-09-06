import Elysia from "elysia";
import { ProjectService } from "./service";
import { z } from 'zod';
import { schemas } from "@/database/schema";

export const ProjectsRouter = new Elysia({ prefix: "/api/projects" })
  .post("/", async ({ body, set }) => {
    try {
      await ProjectService.create(body);
    } catch (error) {
      set.status = 500;
      return { error: "Failed to create project" };
    }
  }, {

    response: {
      200: z.object({
        id: z.number()
      }),
      500: {
        // TODO: MAKE ALL OF THIS WORK
      }
    },
    body: z.object({
      authorId: z.string(),
      title: z.string(),
      category: z.string(),
      subcategory: z.string(),
      problem: z.string(),
      public: z.string(),
      programming_language: z.string(),
      internet_access: z.boolean(),
    }),
    tags: ["Projects"],
    auth: true,
  })
  .get("/", async ({ query, set }) => {
    try {
      return await ProjectService.findAll(query.limit, query.offset);
    } catch (error) {
      set.status = 500;
      return { error: "Failed to fetch projects" };
    };
  }, {
    query: z.object({
      limit: z.number().min(10).max(100).default(10),
      offset: z.number().min(0).default(0),
    }),
    response: {
      200: z.object({
        id: z.number(),
        authorId: z.string(),
        title: z.string(),
        category: z.string(),
        subcategory: z.string(),
        problem: z.string(),
        public: z.string(),
        programming_language: z.string(),
        internet_access: z.boolean(),
      }),
      500: z.object({
        message: z.string()
      }),
    },
    tags: ["Projects"],
    auth: true,
  })
