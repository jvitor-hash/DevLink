const encoder = new TextEncoder();
const decoder = new TextDecoder();

const toBase64 = (bytes: ArrayBufferLike): string => btoa(String.fromCharCode(...new Uint8Array(bytes)));
const fromBase64 = (value: string): Uint8Array => Uint8Array.from(atob(value), (char) => char.charCodeAt(0));

export const generateKeyPair = (): Promise<CryptoKeyPair> => crypto.subtle.generateKey(
  { name: "ECDH", namedCurve: "P-256" },
  true,
  ["deriveKey"],
) as Promise<CryptoKeyPair>;

export const exportPublicKey = async (keyPair: CryptoKeyPair): Promise<string> =>
  toBase64(await crypto.subtle.exportKey("spki", keyPair.publicKey));

export const importPeerPublicKey = (encoded: string): Promise<CryptoKey> =>
  crypto.subtle.importKey(
    "spki",
    fromBase64(encoded) as BufferSource,
    { name: "ECDH", namedCurve: "P-256" },
    true,
    [],
  );

export const deriveSharedKey = (keyPair: CryptoKeyPair, peerPublicKey: CryptoKey): Promise<CryptoKey> =>
  crypto.subtle.deriveKey(
    { name: "ECDH", public: peerPublicKey },
    keyPair.privateKey,
    { name: "AES-GCM", length: 256 },
    false,
    ["encrypt", "decrypt"],
  );

export const encryptMessage = async (key: CryptoKey, message: string): Promise<{ iv: string; ciphertext: string }> => {
  const iv = crypto.getRandomValues(new Uint8Array(12));
  const ciphertext = await crypto.subtle.encrypt({ name: "AES-GCM", iv: iv as BufferSource }, key, encoder.encode(message) as BufferSource);
  return { iv: toBase64(iv.buffer as ArrayBuffer), ciphertext: toBase64(ciphertext) };
};

export const decryptMessage = async (key: CryptoKey, iv: string, ciphertext: string): Promise<string> => {
  const plaintext = await crypto.subtle.decrypt({ name: "AES-GCM", iv: fromBase64(iv) as BufferSource }, key, fromBase64(ciphertext) as BufferSource);
  return decoder.decode(plaintext);
};
