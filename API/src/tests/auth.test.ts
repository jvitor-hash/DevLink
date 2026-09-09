import { describe, expect, test } from "bun:test";
import { env } from "../env";
import { auth } from "../auth";

describe("Auth Password Hashing", () => {
  test("should hash password using argon2id", async () => {
    const password = "secure-test-password-123";
    
    const hash = await Bun.password.hash(password, {
      algorithm: "argon2id",
      memoryCost: 65536,
      timeCost: 3,
    });

    expect(hash).toBeDefined();
    expect(typeof hash).toBe("string");
    expect(hash.startsWith("$argon2id$")).toBe(true);
  });

  test("should verify correct password", async () => {
    const password = "secure-test-password-123";
    
    const hash = await Bun.password.hash(password, {
      algorithm: "argon2id",
      memoryCost: 65536,
      timeCost: 3,
    });

    const isValid = await Bun.password.verify(password, hash);
    expect(isValid).toBe(true);
  });

  test("should reject incorrect password", async () => {
    const password = "secure-test-password-123";
    const wrongPassword = "incorrect-password";
    
    const hash = await Bun.password.hash(password, {
      algorithm: "argon2id",
      memoryCost: 65536,
      timeCost: 3,
    });

    const isValid = await Bun.password.verify(wrongPassword, hash);
    expect(isValid).toBe(false);
  });
});

describe("Auth Module Configuration", () => {
  test("should have valid environment configuration loaded", () => {
    expect(env.BETTER_AUTH_SECRET.length).toBeGreaterThanOrEqual(32);
    expect(env.BETTER_AUTH_URL).toBeDefined();
    expect(env.DATABASE_URL).toBeDefined();
    expect(typeof env.PORT).toBe("number");
  });

  test("BetterAuth instance should be initialized with correct plugins and routes", () => {
    expect(auth).toBeDefined();
    expect(auth.options.basePath).toBe("/api/auth");
    expect(auth.options.emailAndPassword?.enabled).toBe(true);
    expect(auth.handler).toBeDefined();
  });
});
