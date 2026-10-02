import { describe, expect, test } from "bun:test";
import { ProjectActionRateLimiter } from "../routes/v1/project_action/rate_limiter";

describe("Project Action Rate Limiter", () => {
  test("allows requests under the per-user limit", () => {
    ProjectActionRateLimiter.reset();

    const userId = "rate-limit-user-1";

    for (let i = 0; i < 5; i++) {
      expect(ProjectActionRateLimiter.consume(userId)).toBe(true);
    }
  });

  test("blocks requests past the limit inside the window", () => {
    ProjectActionRateLimiter.reset();

    const userId = "rate-limit-user-2";

    for (let i = 0; i < ProjectActionRateLimiter.max; i++) {
      expect(ProjectActionRateLimiter.consume(userId)).toBe(true);
    }

    expect(ProjectActionRateLimiter.consume(userId)).toBe(false);
  });

  test("tracks users independently", () => {
    ProjectActionRateLimiter.reset();

    const first = "rate-limit-user-3";
    const second = "rate-limit-user-4";

    for (let i = 0; i < ProjectActionRateLimiter.max; i++) {
      ProjectActionRateLimiter.consume(first);
    }

    expect(ProjectActionRateLimiter.consume(first)).toBe(false);
    expect(ProjectActionRateLimiter.consume(second)).toBe(true);
  });
});
