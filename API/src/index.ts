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
import { ProjectActionRouter } from "@/routes/v1/project_action";
import { EventsRouter } from "@/routes/v1/events";
import { ClientAuthRouter } from "./routes/v1/client";
import { ProgrammerAuthRouter } from "./routes/v1/programmer";
import { logger, loggerPlugin } from "./modules/logger";
import { OutboxDispatcher } from "./modules/outbox_dispatcher";
import { SseHub } from "./modules/sse_hub";

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
        logger.info('request:', elapsed, 'ms')
      })
    })

    onBeforeHandle(({ onStop }) => {
      onStop(({ elapsed }) => {
        logger.info('beforeHandle:', elapsed, 'ms')
      })
    })

    onHandle(({ onStop }) => {
      onStop(({ elapsed }) => {
        logger.info('handler:', elapsed, 'ms')
      })
    })

    onAfterHandle(({ onStop }) => {
      onStop(({ elapsed }) => {
        logger.info('afterHandle:', elapsed, 'ms')
      })
    })

    onError(({ onStop }) => {
      onStop(({ elapsed }) => {
        logger.error('error:', elapsed, 'ms')
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
  .use(ProjectActionRouter)
  .use(EventsRouter)
  .get("/health", () => ({ OK: true }), {
    detail: {
      summary: "/health",
      description: "A service health check",
    },
  })
  .listen(env.PORT);

OutboxDispatcher.startOutboxDispatcher();
const heartbeatTimer = SseHub.startHeartbeats(20_000);
process.on("exit", () => {
  OutboxDispatcher.stopOutboxDispatcher();
  clearInterval(heartbeatTimer);
});

console.log(`Elysia is running at ${app.server?.hostname}:${app.server?.port}`);

export type App = typeof app;
export { app };
