import { afterAll, describe, expect, test } from "bun:test";
import { eq } from "drizzle-orm";
import { UserService } from "../routes/v1/users/service";
import { Websocket_Chat } from "../modules/websocket";
import { db } from "../client";
import { schemas } from "../database/schema";

describe("Public Key Persistence", () => {
  const TEST_USER = "550e8400-e29b-41d4-a716-446655440001";
  const TEST_EMAIL = "public-key-test@example.com";
  const TEST_KEY = "MFkwEwYHKoZIzj0CAQYIKoZIzj0DAQcDQgAEtest+public+key==";

  const seedUser = async () => {
    await db
      .insert(schemas.user)
      .values({
        id: TEST_USER,
        name: "Public Key Test",
        email: TEST_EMAIL,
        createdAt: new Date(),
        updatedAt: new Date(),
      })
      .onConflictDoNothing();
  };

  afterAll(async () => {
    await db.delete(schemas.user).where(eq(schemas.user.id, TEST_USER));
  });

  test("updatePublicKey stores the key", async () => {
    await seedUser();

    const result = await UserService.updatePublicKey(TEST_USER, TEST_KEY);
    expect(result.publicKey).toBe(TEST_KEY);
  });

  test("getPublicKey returns the stored key", async () => {
    const result = await UserService.getPublicKey(TEST_USER);
    expect(result.publicKey).toBe(TEST_KEY);
  });

  test("findPublicKeyById returns the key for another user lookup", async () => {
    const key = await UserService.findPublicKeyById(TEST_USER);
    expect(key).toBe(TEST_KEY);
  });

  test("findPublicKeyById returns null for unknown user", async () => {
    const key = await UserService.findPublicKeyById("550e8400-e29b-41d4-a716-446655440999");
    expect(key).toBeNull();
  });

  test("updatePublicKey overwrites a previous key", async () => {
    const rotated = "MFkwEwYHKoZIzj0CAQYIKoZIzj0DAQcDQgAErotated+key==";
    await UserService.updatePublicKey(TEST_USER, rotated);

    const result = await UserService.getPublicKey(TEST_USER);
    expect(result.publicKey).toBe(rotated);
  });
});

describe("Websocket Chat Module", () => {
  test("Websocket_Chat is properly configured", () => {
    expect(Websocket_Chat).toBeDefined();
    expect(typeof Websocket_Chat.ws).toBe("function");
  });
});
