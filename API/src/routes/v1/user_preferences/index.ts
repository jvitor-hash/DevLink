import Elysia from "elysia";
import { z } from "zod";
import { UserPreferenceCreateSchema, UserPreferenceSchema, UserPreferenceUpdateSchema } from "@/database/data-transfer-object/user_preferences_dto";
import { ErrorSchema } from "@/modules/error_schema";
import { authPlugin } from "@/modules/auth_plugin";
import { UserPreferenceController } from "@/app/dependencies";

const pagination = z.object({ limit: z.coerce.number().min(1).max(100).default(10), offset: z.coerce.number().min(0).default(0) });
const id = z.object({ id: z.string().uuid() });

export const UserPreferenceRouter = new Elysia({ prefix: "/api/v1/user-preferences" })
  .use(authPlugin)
  .post("/", UserPreferenceController.create, { 
    body: UserPreferenceCreateSchema, 
    response: { 201: UserPreferenceSchema, 500: ErrorSchema }, tags: ["User Preferences"], auth: true 
  })
  .get("/", UserPreferenceController.list, { 
    query: pagination, 
    response: { 200: z.array(UserPreferenceSchema), 500: ErrorSchema }, tags: ["User Preferences"], auth: true 
  })
  .get("/user/:userId", UserPreferenceController.byUser, { 
    params: z.object({ userId: z.uuid() }), 
    response: { 200: UserPreferenceSchema.nullable(), 403: ErrorSchema, 500: ErrorSchema }, tags: ["User Preferences"], auth: true 
  })
  .get("/:id", UserPreferenceController.get, { 
    params: id, 
    response: { 200: UserPreferenceSchema, 404: ErrorSchema, 500: ErrorSchema }, tags: ["User Preferences"], auth: true 
  })
  .put("/:userId", UserPreferenceController.update, { 
    params: z.object({ userId: z.uuid() }), 
    body: UserPreferenceUpdateSchema, 
    response: { 200: UserPreferenceSchema, 403: ErrorSchema, 500: ErrorSchema }, tags: ["User Preferences"], auth: true 
  })
  .delete("/:id", UserPreferenceController.remove, { 
    params: id, 
    response: { 200: UserPreferenceSchema, 404: ErrorSchema, 500: ErrorSchema }, tags: ["User Preferences"], auth: true 
  });
