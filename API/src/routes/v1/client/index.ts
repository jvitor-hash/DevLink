import { auth } from "@/auth";
import { db } from "@/client";
import { schemas } from "@/database/schema";
import { ErrorSchema } from "@/modules/error_schema";
import { eq } from "drizzle-orm";
import Elysia from "elysia";
import z from "zod";

export const ClientAuthRouter = new Elysia({
  prefix: "/api/auth/sign-up/client",
}).post(
  "/",
  async ({ body, set }) => {
    try {
      const created = await auth.api.signUpEmail({
        body: {
          email: body.email,
          password: body.password,
          name: body.name,
        },
        returnHeaders: true,
      });

      const [user] = await db
        .update(schemas.user)
        .set({ role: "CLIENT" })
        .where(eq(schemas.user.id, created.response.user.id))
        .returning();

      const setCookies = created.headers.getSetCookie();
      if (setCookies.length > 0) {
        set.headers["set-cookie"] = setCookies as unknown as string;
      }

      return {
        user,
        token: created.response.token,
      };
    } catch (error) {
      set.status = 500;
      return { error: "Failed to register a client" };
    }
  },
  {
    body: z.object({
      email: z.email(),
      name: z.string(),
      password: z.string().min(8, "Must be at least 8 characters"),
    }),
    response: {
      200: z.object({
        user: z.object({
          id: z.uuid(),
          name: z.string(),
          email: z.email(),
          emailVerified: z.boolean(),
          role: z.string(),
          image: z.any(),
          updatedAt: z.date(),
          createdAt: z.date(),
        }),
        token: z.string().nullable(),
      }),
      500: ErrorSchema,
    },
    tags: ["Users"],
  },
);
