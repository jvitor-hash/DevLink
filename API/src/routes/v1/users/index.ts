import Elysia from "elysia";
import { z } from "zod";
import { UserService } from "./service";
import { ErrorSchema } from "@/modules/error_schema";
import { authPlugin } from "@/modules/auth_plugin";
import { logError } from "@/modules/logger";

const PublicUserSchema = z.object({
  id: z.string().uuid(),
  name: z.string(),
  bio: z.string().nullable(),
  image: z.string().nullable(),
  role: z.string().nullable(),
});

const ProminentClientSchema = PublicUserSchema.extend({
  projectCount: z.number(),
});

export const UsersRouter = new Elysia({ prefix: "/api/v1/users" })
  .use(authPlugin)
  .get("/", async ({ query, set }) => {
    try {
      return await UserService.search(query.q ?? "", query.role, query.limit, query.offset);
    } catch (error) {
      logError("GET /api/v1/users", error);
      set.status = 500;
      return { error: "Failed to search users" };
    }
  }, {
    query: z.object({
      limit: z.coerce.number().min(1).max(100).default(10),
      offset: z.coerce.number().min(0).default(0),
      q: z.string().optional(),
      role: z.string().optional(),
    }),
    response: {
      200: z.array(PublicUserSchema),
      500: ErrorSchema,
    },
    tags: ["Users"],
    authOptional: true,
  })
  .get("/prominent-clients", async ({ query, set }) => {
    try {
      return await UserService.findProminentClients(query.limit);
    } catch (error) {
      logError("GET /api/v1/users/prominent-clients", error);
      set.status = 500;
      return { error: "Failed to fetch prominent clients" };
    }
  }, {
    query: z.object({
      limit: z.coerce.number().min(1).max(50).default(5),
    }),
    response: {
      200: z.array(ProminentClientSchema),
      500: ErrorSchema,
    },
    tags: ["Users"],
    authOptional: true,
  })
  .put("/me", async ({ body, user, set }) => {
    try {
      const updated = await UserService.updateOwnProfile(user.id, body);
      if (!updated) {
        set.status = 404;
        return { error: "User not found" };
      }
      return updated;
    } catch (error) {
      logError("PUT /api/v1/users/me", error);
      set.status = error instanceof Error && error.message.startsWith("Name must") ? 422 : 500;
      return { error: error instanceof Error ? error.message : "Failed to update user" };
    }
  }, {
    body: z.object({
      name: z.string().trim().min(1).max(120).optional(),
      bio: z.string().trim().max(500).nullable().optional(),
      image: z.string().trim().max(2048).nullable().optional(),
    }),
    response: {
      200: PublicUserSchema,
      404: ErrorSchema,
      422: ErrorSchema,
      500: ErrorSchema,
    },
    tags: ["Users"],
    auth: true,
  })
  .get("/me/public-key", async ({ user }) => {
    return await UserService.getPublicKey(user.id);
  }, {
    response: {
      200: z.object({ publicKey: z.string().nullable() }),
    },
    tags: ["Users"],
    auth: true,
  })
  .put("/me/public-key", async ({ body, user }) => {
    return await UserService.updatePublicKey(user.id, body.publicKey);
  }, {
    body: z.object({
      publicKey: z.string().trim().min(1).max(512),
    }),
    response: {
      200: z.object({ publicKey: z.string() }),
    },
    tags: ["Users"],
    auth: true,
  })
  .get("/:id/public-key", async ({ params }) => {
    const publicKey = await UserService.findPublicKeyById(params.id);
    return { publicKey };
  }, {
    params: z.object({
      id: z.string().uuid(),
    }),
    response: {
      200: z.object({ publicKey: z.string().nullable() }),
    },
    tags: ["Users"],
    auth: true,
  })
  .get("/:id", async ({ params, set }) => {
    try {
      const user = await UserService.findById(params.id);
      if (!user) {
        set.status = 404;
        return { error: "User not found" };
      }
      return user;
    } catch (error) {
      logError("GET /api/v1/users/:id", error);
      set.status = 500;
      return { error: "Failed to fetch user" };
    }
  }, {
    params: z.object({
      id: z.string().uuid(),
    }),
    response: {
      200: PublicUserSchema,
      404: ErrorSchema,
      500: ErrorSchema,
    },
    tags: ["Users"],
    authOptional: true,
  });
