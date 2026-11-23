import { Elysia } from "elysia";
import { ProjectsRouter } from "../routes/v1/projects";
import { EventsRouter } from "../routes/v1/events";
import { UserPreferenceRouter } from "../routes/v1/user_preferences";
import { ReviewRouter } from "../routes/v1/review";
import { authPlugin } from "../modules/auth_plugin";

export function createTestApp() {
  const app = new Elysia()
    .use(authPlugin)
    .use(ProjectsRouter)
    .use(EventsRouter)
    .use(UserPreferenceRouter)
    .use(ReviewRouter)
    .get("/health", () => ({ OK: true }));

  return app;
}
