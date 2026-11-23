import { Elysia } from "elysia";
import { auth } from "@/auth";
import { logger } from "@/modules/logger";

export const authPlugin = new Elysia({ name: "auth-plugin" })
  .macro({
    auth: {
      async resolve({ status, request }) {
        const session = await auth.api.getSession({
          headers: request.headers,
        });

        if (!session) {
          logger.warn("[auth] rejected unauthenticated request", { method: request.method });
          return status(401);
        }

        return {
          user: session.user,
          session: session.session,
        };
      },
    },
    authOptional: {
      async resolve({ request: { headers } }) {
        const session = await auth.api.getSession({ headers }).catch((error) => {
          logger.warn("[auth] optional session lookup failed", { error });
          return null;
        });

        return {
          user: session?.user ?? null,
          session: session?.session ?? null,
        };
      },
    },
  });
