import { describe, expect, test } from "bun:test";

import {
  generateKeyPair,
  exportPublicKey,
  importPeerPublicKey,
  deriveSharedKey,
  encryptMessage,
  decryptMessage,
} from "@/lib/crypto";

describe("crypto helpers", () => {
  test("generates an exportable SPKI public key", async () => {
    const keyPair = await generateKeyPair();
    const publicKey = await exportPublicKey(keyPair);

    expect(typeof publicKey).toBe("string");
    expect(publicKey.length).toBeGreaterThan(0);
  });

  test("both peers derive the same shared key", async () => {
    const alice = await generateKeyPair();
    const bob = await generateKeyPair();

    const aliceKey = await deriveSharedKey(alice, await importPeerPublicKey(await exportPublicKey(bob)));
    const bobKey = await deriveSharedKey(bob, await importPeerPublicKey(await exportPublicKey(alice)));

    const { iv, ciphertext } = await encryptMessage(aliceKey, "segredo");
    const plaintext = await decryptMessage(bobKey, iv, ciphertext);

    expect(plaintext).toBe("segredo");
  });

  test("different key pairs derive different secrets", async () => {
    const alice = await generateKeyPair();
    const bob = await generateKeyPair();
    const eve = await generateKeyPair();

    const aliceBobKey = await deriveSharedKey(alice, await importPeerPublicKey(await exportPublicKey(bob)));
    const eveKey = await deriveSharedKey(eve, await importPeerPublicKey(await exportPublicKey(alice)));

    const { iv, ciphertext } = await encryptMessage(aliceBobKey, "segredo");

    await expect(decryptMessage(eveKey, iv, ciphertext)).rejects.toThrow();
  });

  test("modified ciphertext fails authentication", async () => {
    const alice = await generateKeyPair();
    const bob = await generateKeyPair();

    const aliceKey = await deriveSharedKey(alice, await importPeerPublicKey(await exportPublicKey(bob)));
    const bobKey = await deriveSharedKey(bob, await importPeerPublicKey(await exportPublicKey(alice)));

    const { iv, ciphertext } = await encryptMessage(aliceKey, "segredo");
    const raw = atob(ciphertext);
    const tampered = btoa(raw.slice(0, -1) + String.fromCharCode(raw.charCodeAt(raw.length - 1) ^ 1));

    await expect(decryptMessage(bobKey, iv, tampered)).rejects.toThrow();
  });
});
