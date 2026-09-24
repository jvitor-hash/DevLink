import Elysia from "elysia";
import { UserPreferenceCreateSchema, UserPreferenceSchema, UserPreferenceUpdateSchema, type UserPreferenceCreate, type UserPreferenceUpdate } from "@/database/data-transfer-object/user_preferences_dto";
import { UserPreferenceService } from "./service";
import { ErrorSchema } from "@/modules/error_schema";
import { z } from "zod";
import { and, eq, type SQL } from "drizzle-orm";
import { schemas } from "@/database/schema";
import { authPlugin } from "@/modules/auth_plugin";
import { logError } from "@/modules/logger";

export const UserPreferenceRouter = new Elysia({ prefix: "/api/v1/user-preferences" })
  .use(authPlugin)
  .post("/", async ({ body, user, set }) => {
    try {
      const data = body as UserPreferenceCreate;
      const newPreference = await UserPreferenceService.create({
        ...data,
        userId: user.id,
      });
      set.status = 201;
      return newPreference;
    } catch (error) {
      logError("POST /api/v1/user-preferences", error);
      set.status = 500;
      return { error: "Failed to create user preference" };
    }
  }, {
    body: UserPreferenceCreateSchema,
    response: {
      201: UserPreferenceSchema,
      500: ErrorSchema,
    },
    tags: ["User Preferences"],
    auth: true,
  })
  .get("/", async ({ query, user, set }) => {
    try {
      if (!user) {
        set.status = 401;
        return { error: "Unauthorized" };
      }
      return await UserPreferenceService.findAllByUser(user.id, query.limit, query.offset);
    } catch (error) {
      logError("GET /api/v1/user-preferences", error);
      set.status = 500;
      return { error: "Failed to fetch user preferences" };
    }
  }, {
    query: z.object({
      limit: z.coerce.number().min(1).max(100).default(10),
      offset: z.coerce.number().min(0).default(0),
    }),
    response: {
      200: z.array(UserPreferenceSchema),
      500: ErrorSchema,
    },
    tags: ["User Preferences"],
    auth: true,
  })
  .get("/user/:userId", async ({ params, user, set }) => {
    try {
      if (params.userId !== user.id) {
        set.status = 403;
        return { error: "Forbidden" };
      }

      const preference = await UserPreferenceService.findByUser(params.userId);
      return preference;
    } catch (error) {
      logError("GET /api/v1/user-preferences/user/:userId", error);
      set.status = 500;
      return { error: "Failed to fetch user preference" };
    }
  }, {
    params: z.object({
      userId: z.string().uuid(),
    }),
    response: {
      200: UserPreferenceSchema.nullable(),
      403: ErrorSchema,
      500: ErrorSchema,
    },
    tags: ["User Preferences"],
    auth: true,
  })
  .get("/:id", async ({ params, user, set }) => {
    try {
      const preference = await UserPreferenceService.findOne(
        and(eq(schemas.userPreference.id, params.id), eq(schemas.userPreference.userId, user.id)) as SQL<unknown>
      );
      return preference;
    } catch (error) {
      logError("GET /api/v1/user-preferences/:id", error);
      set.status = 404;
      return { error: "User preference not found" };
    }
  }, {
    params: z.object({
      id: z.string().uuid(),
    }),
    response: {
      200: UserPreferenceSchema,
      404: ErrorSchema,
      500: ErrorSchema,
    },
    tags: ["User Preferences"],
    auth: true,
  })
  .put("/:userId", async ({ params, body, user, set }) => {
    try {
      if (params.userId !== user.id) {
        set.status = 403;
        return { error: "Forbidden" };
      }

      const data = body as UserPreferenceUpdate;
      const updated = await UserPreferenceService.upsertByUser(params.userId, data);
      return updated;
    } catch (error) {
      logError("PUT /api/v1/user-preferences/:userId", error);
      set.status = 500;
      return { error: "Failed to update user preference" };
    }
  }, {
    params: z.object({
      userId: z.string().uuid(),
    }),
    body: UserPreferenceUpdateSchema,
    response: {
      200: UserPreferenceSchema,
      403: ErrorSchema,
      500: ErrorSchema,
    },
    tags: ["User Preferences"],
    auth: true,
  })
  .delete("/:id", async ({ params, user, set }) => {
    try {
      const deleted = await UserPreferenceService.remove(
        and(eq(schemas.userPreference.id, params.id), eq(schemas.userPreference.userId, user.id)) as SQL<unknown>
      );
      return deleted;
    } catch (error) {
      logError("DELETE /api/v1/user-preferences/:id", error);
      set.status = 404;
      return { error: "User preference not found or unauthorized" };
    }
  }, {
    params: z.object({
      id: z.string().uuid(),
    }),
    response: {
      200: UserPreferenceSchema,
      404: ErrorSchema,
      500: ErrorSchema,
    },
    tags: ["User Preferences"],
    auth: true,
  });
