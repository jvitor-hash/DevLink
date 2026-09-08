import { Elysia } from "elysia";
import { openapi } from "@elysia/openapi";
import { auth } from '@/auth';
import { env } from "@/env";
import cors from "@elysiajs/cors";
import { ProjectsRouter } from '@/routes/v1/projects/index';
import { NotificationRouter } from "@/routes/v1/notification";
import { MessageRouter } from "./routes/v1/message";
import { ReviewRouter } from "./routes/v1/review";
import { UserPreferenceRouter } from "./routes/v1/user_preferences";
import { SavedTicketRouter } from "./routes/v1/saved_ticket";

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
  .use(NotificationRouter)
  .use(MessageRouter)
  .use(ReviewRouter)
  .use(SavedTicketRouter)
  .use(UserPreferenceRouter)
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
