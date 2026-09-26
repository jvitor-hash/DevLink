const CURVE = "P-256" as const;

const HKDF_INFO = new TextEncoder().encode("devlink-chat-v1");

const toBase64 = (bytes: ArrayBuffer | Uint8Array): string => {
  const view = bytes instanceof Uint8Array ? bytes : new Uint8Array(bytes);
  let binary = "";

  for (const byte of view) binary += String.fromCharCode(byte);

  return btoa(binary);
};

const fromBase64 = (value: string): Uint8Array<ArrayBuffer> => {
  const binary = atob(value);
  const buffer = new ArrayBuffer(binary.length);
  const bytes = new Uint8Array(buffer);

  for (let i = 0; i < binary.length; i++) bytes[i] = binary.charCodeAt(i);

  return bytes;
};

// ECDH keypair for the local user; private key stays in memory, the public
// key is shared with peers via the API/WS so they can derive the same secret.
export const generateKeyPair = async (): Promise<CryptoKeyPair> => {
  return crypto.subtle.generateKey({ name: "ECDH", namedCurve: CURVE }, true, ["deriveBits"]);
};

export const exportPublicKey = async (keyPair: CryptoKeyPair): Promise<string> => {
  const spki = await crypto.subtle.exportKey("spki", keyPair.publicKey);

  return toBase64(spki);
};

// JWK round-trip so the ECDH keypair survives reloads; without it, restored
// history would render as { iv, ciphertext } instead of plaintext.
export const serializeKeyPair = async (keyPair: CryptoKeyPair): Promise<{ publicJwk: JsonWebKey; privateJwk: JsonWebKey }> => {
  return {
    publicJwk: await crypto.subtle.exportKey("jwk", keyPair.publicKey),
    privateJwk: await crypto.subtle.exportKey("jwk", keyPair.privateKey),
  };
};

export const deserializeKeyPair = async (serialized: { publicJwk: JsonWebKey; privateJwk: JsonWebKey }): Promise<CryptoKeyPair> => {
  const publicKey = await crypto.subtle.importKey("jwk", serialized.publicJwk, { name: "ECDH", namedCurve: CURVE }, true, []);
  const privateKey = await crypto.subtle.importKey("jwk", serialized.privateJwk, { name: "ECDH", namedCurve: CURVE }, true, ["deriveBits"]);

  return { publicKey, privateKey };
};

export const importPeerPublicKey = async (publicKeyBase64: string): Promise<CryptoKey> => {
  return crypto.subtle.importKey("spki", fromBase64(publicKeyBase64), { name: "ECDH", namedCurve: CURVE }, true, []);
};

// ECDH -> HKDF (SHA-256) -> AES-GCM 256 key. Both peers calling this with
// opposite key pairs get the same key.
export const deriveSharedKey = async (keyPair: CryptoKeyPair, peerPublicKey: CryptoKey): Promise<CryptoKey> => {
  const sharedBits = await crypto.subtle.deriveBits(
    { name: "ECDH", public: peerPublicKey },
    keyPair.privateKey,
    256,
  );

  const hkdfBaseKey = await crypto.subtle.importKey("raw", sharedBits, "HKDF", false, ["deriveKey"]);

  return crypto.subtle.deriveKey(
    { name: "HKDF", hash: "SHA-256", salt: new Uint8Array(0), info: HKDF_INFO },
    hkdfBaseKey,
    { name: "AES-GCM", length: 256 },
    false,
    ["encrypt", "decrypt"],
  );
};

// Returns base64 parts matching the server frame shape.
export const encryptMessage = async (sharedKey: CryptoKey, plaintext: string): Promise<{ iv: string; ciphertext: string }> => {
  const iv = crypto.getRandomValues(new Uint8Array(12));
  const encoded = new TextEncoder().encode(plaintext);
  const ciphertext = await crypto.subtle.encrypt({ name: "AES-GCM", iv }, sharedKey, encoded);

  return { iv: toBase64(iv), ciphertext: toBase64(ciphertext) };
};

export const decryptMessage = async (sharedKey: CryptoKey, ivBase64: string, ciphertextBase64: string): Promise<string> => {
  const iv = fromBase64(ivBase64);
  const ciphertext = fromBase64(ciphertextBase64);
  const plaintext = await crypto.subtle.decrypt({ name: "AES-GCM", iv } as AesGcmParams, sharedKey, ciphertext);

  return new TextDecoder().decode(plaintext);
};

export const isEncryptedEnvelope = (content: string): boolean => {
  if (!content.startsWith("{")) return false;

  try {
    const parsed = JSON.parse(content) as { iv?: unknown; ciphertext?: unknown };

    return typeof parsed.iv === "string" && typeof parsed.ciphertext === "string";
  } catch {
    return false;
  }
};
