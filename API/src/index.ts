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
import { ClientAuthRouter } from "./routes/v1/client";
import { ProgrammerAuthRouter } from "./routes/v1/programmer";
import { loggerPlugin, Logger, LoggerLevelEnum } from "./modules/logger";

const schema = await auth.api.generateOpenAPISchema();

export const logger = new Logger(env.LOGGER_LEVEL as LoggerLevelEnum);

const app = new Elysia()
  .use(loggerPlugin(logger))
  .use(cors({
    origin: [Bun.env.FRONT_END_URL ?? "http://localhost:5173", "http://127.0.0.1:5173"],
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    credentials: true,
    allowedHeaders: ["Content-Type", "Authorization"],
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
