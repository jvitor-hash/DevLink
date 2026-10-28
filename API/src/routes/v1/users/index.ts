import Elysia from "elysia";
import { z } from "zod";
import { ErrorSchema } from "@/modules/error_schema";
import { authPlugin } from "@/modules/auth_plugin";
import { UserController } from "@/app/dependencies";

const PublicUserSchema = z.object({ id: z.string().uuid(), name: z.string(), bio: z.string().nullable(), image: z.string().nullable(), role: z.string().nullable() });
const ProminentClientSchema = PublicUserSchema.extend({ projectCount: z.number() });
const pagination = z.object({ limit: z.coerce.number().min(1).max(100).default(10), offset: z.coerce.number().min(0).default(0) });
const publicKey = z.object({ publicKey: z.string().nullable() });

export const UsersRouter = new Elysia({ prefix: "/api/v1/users" })
  .use(authPlugin)
  .get("/", UserController.search, {
    query: pagination.extend({ q: z.string().optional(), role: z.string().optional() }),
    response: { 200: z.array(PublicUserSchema), 500: ErrorSchema }, tags: ["Users"], authOptional: true,
  })
  .get("/prominent-clients", UserController.prominentClients, {
    query: z.object({ limit: z.coerce.number().min(1).max(50).default(5) }),
    response: { 200: z.array(ProminentClientSchema), 500: ErrorSchema }, tags: ["Users"], authOptional: true,
  })
  .put("/me", UserController.updateMe, {
    body: z.object({ name: z.string().trim().min(1).max(120).optional(), bio: z.string().trim().max(500).nullable().optional(), image: z.string().trim().max(2048).nullable().optional() }),
    response: { 200: PublicUserSchema, 404: ErrorSchema, 422: ErrorSchema, 500: ErrorSchema }, tags: ["Users"], auth: true,
  })
  .get("/me/public-key", UserController.publicKey, { response: { 200: publicKey, 500: ErrorSchema }, tags: ["Users"], auth: true })
  .put("/me/public-key", UserController.updatePublicKey, {
    body: z.object({ publicKey: z.string().trim().min(1).max(512) }), response: { 200: z.object({ publicKey: z.string() }), 500: ErrorSchema }, tags: ["Users"], auth: true,
  })
  .get("/:id/public-key", UserController.userPublicKey, {
    params: z.object({ id: z.string().uuid() }), response: { 200: publicKey, 500: ErrorSchema }, tags: ["Users"], auth: true,
  })
  .get("/:id", UserController.getById, {
    params: z.object({ id: z.string().uuid() }), response: { 200: PublicUserSchema, 404: ErrorSchema, 500: ErrorSchema }, tags: ["Users"], authOptional: true,
  });
