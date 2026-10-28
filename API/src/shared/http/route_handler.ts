import type { Handler } from "elysia";

/**
 * Elysia's macro-generated context currently cannot express route-specific
 * status narrowing for handlers declared in separate domain modules.
 */
export const routeHandler = (handler: Handler): never => handler as never;
