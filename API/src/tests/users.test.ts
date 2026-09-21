import { describe, expect, test } from "bun:test";
import { UserService } from "../routes/v1/users/service";

describe("Users Route Definition", () => {
  test("UserService exposes profile update", () => {
    expect(typeof UserService.updateOwnProfile).toBe("function");
  });

  test("UserService profile update rejects empty name", async () => {
    const result = await UserService.updateOwnProfile("00000000-0000-0000-0000-000000000000", { name: "   " }).catch(
      (error: unknown) => (error instanceof Error ? error.message : "unknown error"),
    );

    expect(result).toBe("Name must be between 1 and 120 characters");
  });

  test("UserService profile update rejects over-long bio", async () => {
    const result = await UserService.updateOwnProfile("00000000-0000-0000-0000-000000000000", {
      bio: "a".repeat(501),
    }).catch((error: unknown) => (error instanceof Error ? error.message : "unknown error"));

    expect(result).toBe("Bio must be at most 500 characters");
  });

  test("UserService profile update rejects empty patch", async () => {
    const result = await UserService.updateOwnProfile("00000000-0000-0000-0000-000000000000", {}).catch(
      (error: unknown) => (error instanceof Error ? error.message : "unknown error"),
    );

    expect(result).toBe("No fields to update");
  });
});
