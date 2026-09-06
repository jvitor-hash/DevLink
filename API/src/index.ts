import { Elysia } from "elysia";
import { openapi } from "@elysia/openapi";
import { auth } from '@/auth';
import { env } from "@/env";
import cors from "@elysiajs/cors";
import { ProjectsRouter } from '@/routes/v1/projects/index';

const schema = await auth.api.generateOpenAPISchema();

const app = new Elysia()
  .use(cors({
    origin: "http://localhost:3333",
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    credentials: true,
    allowedHeaders: ["Content-Type", "Authorization"]
  }))
  .use(openapi({
    documentation: schema as any
  }))
  .use(ProjectsRouter)
  .get("/health", () => JSON.stringify({ OK: true }), {
    detail: {
      summary: "/health",
      description: "A service health check",
    }
  })
  .mount(auth.handler)
  .macro({
    auth: {
      async resolve({ status, request: { headers } }) {
        const session = await auth.api.getSession({
          headers
        });

        if (!session)
          return status(401);

        return {
          user: session.user,
          session: session.session,
        };
      }
    }
  })
  .listen(env.PORT);

console.log(`Elysia is running at ${app.server?.hostname}:${app.server?.port}`);

export type App = typeof app;
