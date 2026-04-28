type SessionPayload = {
  sub: string;
  exp: number;
  iat: number;
};

const DEFAULT_AUTH_SECRET = "local-dev-auth-secret-change-in-production";
const textEncoder = new TextEncoder();
const textDecoder = new TextDecoder();

let cachedKeyPromise: Promise<CryptoKey> | null = null;

const base64ToBytes = (value: string) => {
  const binary = atob(value);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i += 1) {
    bytes[i] = binary.charCodeAt(i);
  }
  return bytes;
};

const getSessionKey = async () => {
  if (!cachedKeyPromise) {
    const secret = process.env.AUTH_SECRET ?? DEFAULT_AUTH_SECRET;
    cachedKeyPromise = crypto.subtle
      .digest("SHA-256", textEncoder.encode(secret))
      .then((digest) =>
        crypto.subtle.importKey("raw", digest, { name: "AES-GCM" }, false, ["decrypt"])
      );
  }
  return cachedKeyPromise;
};

export const verifySessionTokenEdge = async (token: string) => {
  try {
    const [ivPart, tagPart, ciphertextPart] = token.split(".");
    if (!ivPart || !tagPart || !ciphertextPart) {
      return null;
    }

    const iv = base64ToBytes(ivPart);
    const tag = base64ToBytes(tagPart);
    const ciphertext = base64ToBytes(ciphertextPart);
    const encrypted = new Uint8Array(ciphertext.length + tag.length);
    encrypted.set(ciphertext, 0);
    encrypted.set(tag, ciphertext.length);

    const key = await getSessionKey();
    const plaintextBuffer = await crypto.subtle.decrypt(
      { name: "AES-GCM", iv, tagLength: 128 },
      key,
      encrypted
    );

    const payload = JSON.parse(textDecoder.decode(plaintextBuffer)) as SessionPayload;
    if (!payload?.sub || payload.exp < Math.floor(Date.now() / 1000)) {
      return null;
    }
    return payload;
  } catch {
    return null;
  }
};
