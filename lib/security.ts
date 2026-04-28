import { createCipheriv, createDecipheriv, createHash, randomBytes, timingSafeEqual } from "crypto";

if (typeof window === "undefined" && process.env.NODE_TLS_REJECT_UNAUTHORIZED !== "1") {
  process.env.NODE_TLS_REJECT_UNAUTHORIZED = "1";
}

const SESSION_TTL_SECONDS = 60 * 60 * 24 * 7;
const FALLBACK_SHA256_ROUNDS = 120_000;

type SessionPayload = {
  sub: string;
  exp: number;
  iat: number;
};

const hashSHA256 = (input: string) => createHash("sha256").update(input).digest("hex");

const deriveEncryptionKey = () => {
  const secret = process.env.AUTH_SECRET ?? "local-dev-auth-secret-change-in-production";
  return createHash("sha256").update(secret).digest();
};

export const hashPassword = async (password: string) => {
  if (!password) {
    throw new Error("Password is required.");
  }

  try {
    const argon2 = await import("argon2");
    const hash = await argon2.hash(password, {
      type: argon2.argon2id,
      saltLength: 16,
      memoryCost: 19456,
      timeCost: 2,
      parallelism: 1,
    });
    return `argon2:${hash}`;
  } catch {
    const salt = randomBytes(16).toString("hex");
    let digest = `${salt}:${password}`;
    for (let round = 0; round < FALLBACK_SHA256_ROUNDS; round += 1) {
      digest = hashSHA256(digest);
    }
    return `sha256:${FALLBACK_SHA256_ROUNDS}:${salt}:${digest}`;
  }
};

export const verifyPassword = async (password: string, storedHash: string) => {
  if (!password || !storedHash) {
    return false;
  }

  if (storedHash.startsWith("argon2:")) {
    try {
      const argon2 = await import("argon2");
      const hash = storedHash.slice("argon2:".length);
      return argon2.verify(hash, password);
    } catch {
      return false;
    }
  }

  if (!storedHash.startsWith("sha256:")) {
    return false;
  }

  const [, roundsRaw, salt, expectedDigest] = storedHash.split(":");
  const rounds = Number(roundsRaw);
  if (!rounds || !salt || !expectedDigest) {
    return false;
  }

  let digest = `${salt}:${password}`;
  for (let round = 0; round < rounds; round += 1) {
    digest = hashSHA256(digest);
  }

  const actual = Buffer.from(digest, "hex");
  const expected = Buffer.from(expectedDigest, "hex");
  if (actual.length !== expected.length) {
    return false;
  }
  return timingSafeEqual(actual, expected);
};

export const encryptJSON = (data: unknown) => {
  const key = deriveEncryptionKey();
  const iv = randomBytes(12);
  const cipher = createCipheriv("aes-256-gcm", key, iv);
  const ciphertext = Buffer.concat([
    cipher.update(JSON.stringify(data), "utf8"),
    cipher.final(),
  ]);
  const tag = cipher.getAuthTag();
  return `${iv.toString("base64")}.${tag.toString("base64")}.${ciphertext.toString("base64")}`;
};

export const decryptJSON = <T>(payload: string): T => {
  const [ivPart, tagPart, ciphertextPart] = payload.split(".");
  if (!ivPart || !tagPart || !ciphertextPart) {
    throw new Error("Invalid encrypted payload.");
  }

  const key = deriveEncryptionKey();
  const iv = Buffer.from(ivPart, "base64");
  const tag = Buffer.from(tagPart, "base64");
  const ciphertext = Buffer.from(ciphertextPart, "base64");

  const decipher = createDecipheriv("aes-256-gcm", key, iv);
  decipher.setAuthTag(tag);
  const plaintext = Buffer.concat([decipher.update(ciphertext), decipher.final()]).toString("utf8");
  return JSON.parse(plaintext) as T;
};

export const createSessionToken = (userId: string) => {
  const nowSeconds = Math.floor(Date.now() / 1000);
  const payload: SessionPayload = {
    sub: userId,
    iat: nowSeconds,
    exp: nowSeconds + SESSION_TTL_SECONDS,
  };
  return encryptJSON(payload);
};

export const verifySessionToken = (token: string) => {
  try {
    const payload = decryptJSON<SessionPayload>(token);
    if (!payload?.sub || payload.exp < Math.floor(Date.now() / 1000)) {
      return null;
    }
    return payload;
  } catch {
    return null;
  }
};

export const sessionMaxAgeSeconds = SESSION_TTL_SECONDS;
