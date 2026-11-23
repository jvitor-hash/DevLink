import { ErrorSchema } from "@/modules/error_schema";
import { logError } from "@/modules/logger";
import { registerUser } from "@/app/dependencies";
import Elysia from "elysia";
import z from "zod";

export const ProgrammerAuthRouter = new Elysia({ prefix: "/api/auth/sign-up/programmer" })
  .post("/", async ({ body, set }) => {
    try {
      const created = await registerUser("PROGRAMMER", body);
      const setCookies = created.headers.getSetCookie();
      if (setCookies.length > 0) {
        set.headers["set-cookie"] = setCookies as unknown as string;
      }

      return {
        user: created.user,
      };
    } catch (error) {
      logError("POST /api/auth/sign-up/programmer", error);
      set.status = 500;
      return { error: "Failed to register a programmer" };
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
          role: z.string().nullable(),
          image: z.any(),
          updatedAt: z.date(),
          createdAt: z.date(),
        }),
      }),
      500: ErrorSchema,
    },
    tags: ["Users"],
  });
