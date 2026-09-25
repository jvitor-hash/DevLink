import { describe, expect, mock, test } from "bun:test";

const accountUser = {
  id: "u1",
  name: "Ada",
  email: "ada@devlink.dev",
  emailVerified: true,
  role: "CLIENT",
};

const sessionUser = {
  id: "u2",
  name: "Sessao",
  email: "sessao@devlink.dev",
  emailVerified: true,
  role: "CLIENT",
};

const store = new Map<string, unknown>();

const postCalls: Array<{ path: string; body: unknown }> = [];

await mock.module("@/lib/utils/session_cache", () => ({
  cache: {
    get: <T>(key: string) : T | undefined => store.get(key) as T | undefined,
    set: (key: string, value: unknown) : void => { store.set(key, value); },
    has: (key: string) : boolean => store.has(key),
    delete: (key: string) : boolean => store.delete(key),
  },
  CACHE_KEYS: {
    CURRENT_USER: "current_user",
    AUTH_TOKEN: "auth_token",
    TOKEN_EXPIRY: "token_expiry",
    QUESTIONNAIRE_DRAFT: "questionnaire_draft",
  },
}));

await mock.module("@/lib/api_client", () => ({
  apiClient: {
    get: async () => ({ user: sessionUser }),
    post: async (path: string, body: unknown) => {
      postCalls.push({ path, body });

      if (path.includes("sign-in") || path.includes("sign-up")) return { user: accountUser, session: null };
      if (path.includes("has-permission")) return { success: true, error: null };

      return undefined;
    },
  },
}));

const { CachedUser, userSingleton } = await import("@/lib/types/user");

describe("CachedUser singleton", () => {
  test("login stores the authenticated user in memory and cache", async () => {
    await userSingleton.login({ email: "ada@devlink.dev", password: "secret" });

    expect(userSingleton.isSignedIn).toBe(true);
    expect(userSingleton.id).toBe("u1");
    expect(userSingleton.name).toBe("Ada");
    expect(userSingleton.getCachedUser()?.email).toBe("ada@devlink.dev");
  });

  test("a fresh instance hydrates from the session cache", () => {
    const hydrated = new CachedUser();

    expect(hydrated.isSignedIn).toBe(true);
    expect(hydrated.id).toBe("u1");
  });

  test("register stores the registered user", async () => {
    const fresh = new CachedUser();

    await fresh.register({ name: "Ada", email: "ada@devlink.dev", password: "secret", registrationRole: "CLIENT" });

    expect(fresh.isSignedIn).toBe(true);
    expect(fresh.role).toBe("CLIENT");
  });

  test("logout clears the singleton and cache", async () => {
    await userSingleton.logout();

    expect(userSingleton.isSignedIn).toBe(false);
    expect(userSingleton.getCachedUser()).toBeNull();
  });

  test("getCurrentUser falls back to the service session", async () => {
    const current = await userSingleton.getCurrentUser();

    expect(current?.id).toBe("u2");
    expect(userSingleton.id).toBe("u2");
  });

  test("hasPermission delegates to the auth service", async () => {
    postCalls.length = 0;

    const allowed = await userSingleton.hasPermission({ projects: ["create"] });

    expect(allowed).toBe(true);
    expect(postCalls.some((call) => call.path.includes("has-permission"))).toBe(true);
  });
});
