import { Elysia } from "elysia";
import { ProjectsRouter } from "../routes/v1/projects";
import { NotificationRouter } from "../routes/v1/notification";
import { MessageRouter } from "../routes/v1/message";
import { UserPreferenceRouter } from "../routes/v1/user_preferences";
import { SavedTicketRouter } from "../routes/v1/saved_ticket";
import { ReviewRouter } from "../routes/v1/review";
import { authPlugin } from "../modules/auth_plugin";

export function createTestApp() {
  const app = new Elysia()
    .use(authPlugin)
    .use(ProjectsRouter)
    .use(NotificationRouter)
    .use(MessageRouter)
    .use(UserPreferenceRouter)
    .use(SavedTicketRouter)
    .use(ReviewRouter)
    .get("/health", () => ({ OK: true }));

  return app;
}
