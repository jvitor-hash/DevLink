import Elysia from "elysia";
import { UserPreferenceCreateSchema, UserPreferenceSchema, UserPreferenceUpdateSchema } from "@/database/data-transfer-object/user_preferences_dto";
import { UserPreferenceService } from "./service";
import { ErrorSchema } from "@/modules/error_schema";
import { z } from "zod";
import { eq } from "drizzle-orm";
import { schemas } from "@/database/schema";

export const UserPreferenceRouter = new Elysia({ prefix: "/api/v1/user_preferences" })
  .post("/", async ({ body, set }) => {
    try {
      return await UserPreferenceService.create(body);
    } catch (error) {
      set.status = 500;
      return { error: "Failed to create user preference" };
    }
  }, {
    body: UserPreferenceCreateSchema,
    response: {
      201: UserPreferenceSchema,
      500: ErrorSchema
    },
    tags: ["User Preferences"],
    auth: true,
  })
  .get("/", async ({ query, set }) => {
    try {
      return await UserPreferenceService.findAll(query.limit, query.offset);
    } catch (error) {
      set.status = 500;
      return { error: "Failed to fetch user preferences" };
    };
  }, {
    query: z.object({
      limit: z.coerce.number().min(10).max(100).default(10),
      offset: z.coerce.number().min(0).default(0),
    }),
    response: {
      200: z.array(UserPreferenceSchema),
      500: ErrorSchema,
    },
    tags: ["User Preferences"],
    auth: true,
  })
  .get("/:id", async ({ params, set }) => {
    try {
      const [preference] = await UserPreferenceService.findWhere(eq(schemas.userPreference.id, params.id));
      return preference;
    } catch (error) {
      set.status = 404;
      return { error: "User preference not found" };
    }
  }, {
    params: z.object({
      id: z.uuid()
    }),
    response: {
      200: UserPreferenceSchema,
      404: ErrorSchema,
      500: ErrorSchema
    },
    tags: ["User Preferences"],
    auth: true
  })
  .put("/:id", async ({ params, body, set }) => {
    try {
      const [updated] = await UserPreferenceService.update(eq(schemas.userPreference.id, params.id), body);
      return updated;
    } catch (error) {
      set.status = 404;
      return { error: "User preference not found" };
    }
  }, {
    params: z.object({
      id: z.uuid()
    }),
    body: UserPreferenceUpdateSchema,
    response: {
      200: UserPreferenceSchema,
      404: ErrorSchema,
      500: ErrorSchema
    },
    tags: ["User Preferences"],
    auth: true
  })
  .delete("/:id", async ({ params, set }) => {
    try {
      const [deleted] = await UserPreferenceService.remove(eq(schemas.userPreference.id, params.id));
      return deleted;
    } catch (error) {
      set.status = 404;
      return { error: "User preference not found" };
    }
  }, {
    params: z.object({
      id: z.uuid()
    }),
    response: {
      200: UserPreferenceSchema,
      404: ErrorSchema,
      500: ErrorSchema
    },
    tags: ["User Preferences"],
    auth: true
  });
