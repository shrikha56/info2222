type IdentityKeyMaterial = {
  publicKey: CryptoKey;
  privateKey: CryptoKey;
};

type KeyPackage = {
  wrappedKey: string;
  iv: string;
};

export type EncryptedEnvelope<T extends string> = {
  sender: T;
  ciphertext: string;
  payloadIv: string;
  keyPackages: Record<T, KeyPackage>;
};

const toBase64 = (bytes: Uint8Array) => {
  let binary = "";
  for (let i = 0; i < bytes.length; i += 1) {
    binary += String.fromCharCode(bytes[i]);
  }
  return btoa(binary);
};

const fromBase64 = (value: string) => {
  const binary = atob(value);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i += 1) {
    bytes[i] = binary.charCodeAt(i);
  }
  return bytes;
};

const ensureBrowser = () => {
  if (typeof window === "undefined") {
    throw new Error("E2EE utilities can only run in the browser.");
  }
};

const identityStorageKey = (id: string) => `hifi-e2ee-identity-${id}`;

const importIdentityFromStorage = async (id: string) => {
  const raw = window.localStorage.getItem(identityStorageKey(id));
  if (!raw) return null;

  const data = JSON.parse(raw) as { publicJwk: JsonWebKey; privateJwk: JsonWebKey };
  const publicKey = await crypto.subtle.importKey(
    "jwk",
    data.publicJwk,
    { name: "ECDH", namedCurve: "P-256" },
    true,
    []
  );
  const privateKey = await crypto.subtle.importKey(
    "jwk",
    data.privateJwk,
    { name: "ECDH", namedCurve: "P-256" },
    true,
    ["deriveBits"]
  );

  return { publicKey, privateKey } as IdentityKeyMaterial;
};

const createIdentity = async (id: string) => {
  const keyPair = await crypto.subtle.generateKey(
    { name: "ECDH", namedCurve: "P-256" },
    true,
    ["deriveBits"]
  );
  const publicJwk = await crypto.subtle.exportKey("jwk", keyPair.publicKey);
  const privateJwk = await crypto.subtle.exportKey("jwk", keyPair.privateKey);

  window.localStorage.setItem(
    identityStorageKey(id),
    JSON.stringify({ publicJwk, privateJwk })
  );

  return {
    publicKey: keyPair.publicKey,
    privateKey: keyPair.privateKey,
  } as IdentityKeyMaterial;
};

export const loadOrCreateIdentityKeys = async <T extends string>(
  participantIds: readonly T[]
) => {
  ensureBrowser();

  const entries = await Promise.all(
    participantIds.map(async (id) => {
      const existing = await importIdentityFromStorage(id);
      if (existing) return [id, existing] as const;
      const created = await createIdentity(id);
      return [id, created] as const;
    })
  );

  return Object.fromEntries(entries) as Record<T, IdentityKeyMaterial>;
};

const derivePairKek = async <T extends string>(params: {
  privateKey: CryptoKey;
  publicKey: CryptoKey;
  channel: string;
  participantA: T;
  participantB: T;
}) => {
  const sharedBits = await crypto.subtle.deriveBits(
    { name: "ECDH", public: params.publicKey },
    params.privateKey,
    256
  );

  const pairLabel = [params.participantA, params.participantB].sort().join("|");
  const baseKey = await crypto.subtle.importKey("raw", sharedBits, "HKDF", false, [
    "deriveKey",
  ]);

  return crypto.subtle.deriveKey(
    {
      name: "HKDF",
      hash: "SHA-256",
      salt: new TextEncoder().encode(`hifi-e2ee-salt-${params.channel}`),
      info: new TextEncoder().encode(`hifi-e2ee-kek-${pairLabel}`),
    },
    baseKey,
    { name: "AES-GCM", length: 256 },
    false,
    ["encrypt", "decrypt"]
  );
};

export const encryptMessageForParticipants = async <T extends string>(params: {
  channel: string;
  plaintext: string;
  sender: T;
  recipients: readonly T[];
  identities: Record<T, IdentityKeyMaterial>;
}) => {
  ensureBrowser();

  const payloadIv = crypto.getRandomValues(new Uint8Array(12));
  const messageKey = await crypto.subtle.generateKey(
    { name: "AES-GCM", length: 256 },
    true,
    ["encrypt", "decrypt"]
  );
  const rawMessageKey = new Uint8Array(await crypto.subtle.exportKey("raw", messageKey));

  const ciphertext = await crypto.subtle.encrypt(
    { name: "AES-GCM", iv: payloadIv },
    messageKey,
    new TextEncoder().encode(params.plaintext)
  );

  const keyPackageEntries = await Promise.all(
    params.recipients.map(async (recipient) => {
      const kek = await derivePairKek({
        privateKey: params.identities[params.sender].privateKey,
        publicKey: params.identities[recipient].publicKey,
        channel: params.channel,
        participantA: params.sender,
        participantB: recipient,
      });
      const wrapIv = crypto.getRandomValues(new Uint8Array(12));
      const wrapped = await crypto.subtle.encrypt(
        { name: "AES-GCM", iv: wrapIv },
        kek,
        rawMessageKey
      );

      return [
        recipient,
        {
          wrappedKey: toBase64(new Uint8Array(wrapped)),
          iv: toBase64(wrapIv),
        },
      ] as const;
    })
  );

  return {
    sender: params.sender,
    ciphertext: toBase64(new Uint8Array(ciphertext)),
    payloadIv: toBase64(payloadIv),
    keyPackages: Object.fromEntries(keyPackageEntries) as Record<T, KeyPackage>,
  } as EncryptedEnvelope<T>;
};

export const decryptMessageForParticipant = async <T extends string>(params: {
  channel: string;
  envelope: EncryptedEnvelope<T>;
  participant: T;
  identities: Record<T, IdentityKeyMaterial>;
}) => {
  ensureBrowser();

  const keyPackage = params.envelope.keyPackages[params.participant];
  if (!keyPackage) {
    throw new Error("No key package for participant.");
  }

  const kek = await derivePairKek({
    privateKey: params.identities[params.participant].privateKey,
    publicKey: params.identities[params.envelope.sender].publicKey,
    channel: params.channel,
    participantA: params.participant,
    participantB: params.envelope.sender,
  });

  const rawMessageKey = await crypto.subtle.decrypt(
    { name: "AES-GCM", iv: fromBase64(keyPackage.iv) },
    kek,
    fromBase64(keyPackage.wrappedKey)
  );
  const messageKey = await crypto.subtle.importKey(
    "raw",
    rawMessageKey,
    { name: "AES-GCM", length: 256 },
    false,
    ["decrypt"]
  );

  const plaintext = await crypto.subtle.decrypt(
    { name: "AES-GCM", iv: fromBase64(params.envelope.payloadIv) },
    messageKey,
    fromBase64(params.envelope.ciphertext)
  );

  return new TextDecoder().decode(plaintext);
};
