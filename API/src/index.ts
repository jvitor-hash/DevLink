import { Elysia } from "elysia";
import { openapi } from "@elysia/openapi";
import { auth } from "@/auth";
import { env } from "@/env";
import cors from "@elysiajs/cors";
import { authPlugin } from "@/modules/auth_plugin";
import { ProjectsRouter } from "@/routes/v1/projects";
import { ReviewRouter } from "@/routes/v1/review";
import { UserPreferenceRouter } from "@/routes/v1/user_preferences";
import { TodoRouter } from "@/routes/v1/todo";
import { TicketRouter } from "@/routes/v1/ticket";
import { UsersRouter } from "@/routes/v1/users";
import { EventsRouter } from "@/routes/v1/events";
import { MessageRouter } from "@/routes/v1/messages";
import { ConversationRouter } from "@/routes/v1/conversation";
import { NotificationRouter } from "@/routes/v1/notification";
import { ClientAuthRouter } from "./routes/v1/client";
import { ProgrammerAuthRouter } from "./routes/v1/programmer";
import { logger, loggerPlugin } from "./modules/logger";
import { SseHub } from "./infrastructure/realtime/sse_hub";

const schema = await auth.api.generateOpenAPISchema();

const app = new Elysia()
  .use(loggerPlugin(logger))
  .use(cors({
    origin: [Bun.env.FRONT_END_URL ?? "http://localhost:5173", "http://127.0.0.1:5173"],
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    credentials: true,
    allowedHeaders: ["Content-Type", "Authorization", "Idempotency-Key"],
  }))
  .use(openapi({
    documentation: schema as any,
  }))
  .trace(async ({ onHandle, onRequest, onBeforeHandle, onAfterHandle, onError }) => {
    onRequest(({ onStop }) => {
      onStop(({ elapsed }) => {
        logger.info("[request] received", { elapsedMs: elapsed });
      })
    })

    onBeforeHandle(({ onStop }) => {
      onStop(({ elapsed }) => {
        logger.info("[request] before handle", { elapsedMs: elapsed });
      })
    })

    onHandle(({ onStop }) => {
      onStop(({ elapsed }) => {
        logger.info("[request] handler complete", { elapsedMs: elapsed });
      })
    })

    onAfterHandle(({ onStop }) => {
      onStop(({ elapsed }) => {
        logger.info("[request] response complete", { elapsedMs: elapsed });
      })
    })

    onError(({ onStop }) => {
      onStop(({ elapsed }) => {
        logger.error("[request] failed", { elapsedMs: elapsed });
      })
    })
  })
  .use(authPlugin)
  .use(ClientAuthRouter)
  .use(ProgrammerAuthRouter)
  .mount(auth.handler)
  .use(ProjectsRouter)
  .use(ReviewRouter)
  .use(TodoRouter)
  .use(TicketRouter)
  .use(UserPreferenceRouter)
  .use(UsersRouter)
  .use(EventsRouter)
  .use(MessageRouter)
  .use(ConversationRouter)
  .use(NotificationRouter)
  .get("/health", () => ({ OK: true }), {
    detail: {
      summary: "/health",
      description: "A service health check",
    },
  })
  .listen(env.PORT);

// Keep SSE connections alive through reverse proxies and load balancers.
// The heartbeat interval is shorter than common idle connection timeouts.
const heartbeatTimer = SseHub.startHeartbeats(20_000);
process.on("exit", () => {
  clearInterval(heartbeatTimer);
});
SseHub.startHeartbeats();

logger.info("[startup] API is running", {
  hostname: app.server?.hostname,
  port: app.server?.port,
});

export type App = typeof app;
export { app };
