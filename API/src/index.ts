import { Elysia } from "elysia";
import { openapi } from "@elysia/openapi";
import { auth } from "@/auth";
import { env } from "@/env";
import cors from "@elysiajs/cors";
import { authPlugin } from "@/modules/auth_plugin";
import { ProjectsRouter } from "@/routes/v1/projects";
import { NotificationRouter } from "@/routes/v1/notification";
import { MessageRouter } from "@/routes/v1/message";
import { ReviewRouter } from "@/routes/v1/review";
import { UserPreferenceRouter } from "@/routes/v1/user_preferences";
import { SavedTicketRouter } from "@/routes/v1/saved_ticket";

const schema = await auth.api.generateOpenAPISchema();

const app = new Elysia()
  .use(cors({
    origin: ["http://localhost:5173", "http://127.0.0.1:5173"],
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    credentials: true,
    allowedHeaders: ["Content-Type", "Authorization"],
  }))
  .use(openapi({
    documentation: schema as any,
  }))
  .use(authPlugin)
  .mount(auth.handler)
  .use(ProjectsRouter)
  .use(NotificationRouter)
  .use(MessageRouter)
  .use(ReviewRouter)
  .use(SavedTicketRouter)
  .use(UserPreferenceRouter)
  .get("/health", () => ({ OK: true }), {
    detail: {
      summary: "/health",
      description: "A service health check",
    },
  })
  .listen(env.PORT);

console.log(`Elysia is running at ${app.server?.hostname}:${app.server?.port}`);

export type App = typeof app;
export { app };
