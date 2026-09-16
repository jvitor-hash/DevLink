import { Elysia } from "elysia";
import { auth } from "@/auth";

export const authPlugin = new Elysia({ name: "auth-plugin" })
  .macro({
    auth: {
      async resolve({ status, request: { headers } }) {
        const session = await auth.api.getSession({
          headers,
        });

        if (!session) {
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
        const session = await auth.api.getSession({
          headers,
        }).catch(() => null);

        return {
          user: session?.user ?? null,
          session: session?.session ?? null,
        };
      },
    },
  });
