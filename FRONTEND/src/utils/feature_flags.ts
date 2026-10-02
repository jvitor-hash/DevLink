// Compile-time-ish runtime flags read from Vite env vars.
// Prefixed with VITE_ so they are inlined into the client bundle.

const flagValue = (name: string): boolean => {
  const value = (import.meta.env as Record<string, string | undefined>)[name];

  return value === "true" || value === "1";
};

// Master switch for the action + SSE flow. When off, services and hooks
// fall back to local mocks so the UI works without the API.
export const projectActionsEnabled = (): boolean => flagValue("VITE_ENABLE_PROJECT_ACTIONS");
