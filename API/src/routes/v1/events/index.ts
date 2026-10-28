import Elysia from "elysia";
import { authPlugin } from "@/modules/auth_plugin";
import { streamEvents } from "@/app/dependencies";

export const EventsRouter = new Elysia({ prefix: "/api/v1/events" })
  .use(authPlugin)
  .get("/stream", streamEvents, {
    tags: ["Events"],
    auth: true,
  });
