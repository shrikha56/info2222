import { decryptJSON, encryptJSON } from "./security";

type StoredUser = {
  id: string;
  username: string;
  passwordHash: string;
  encryptedProfile: string;
};

type PublicUser = {
  id: string;
  username: string;
  displayName: string;
};

type UserProfile = {
  displayName: string;
};

type AuthStore = {
  usersByUsername: Map<string, StoredUser>;
  usersById: Map<string, StoredUser>;
};

const getStore = (): AuthStore => {
  const globalStore = globalThis as typeof globalThis & { __authStore?: AuthStore };
  if (!globalStore.__authStore) {
    globalStore.__authStore = {
      usersByUsername: new Map(),
      usersById: new Map(),
    };
  }
  return globalStore.__authStore;
};

const toPublicUser = (user: StoredUser): PublicUser => {
  const profile = decryptJSON<UserProfile>(user.encryptedProfile);
  return {
    id: user.id,
    username: user.username,
    displayName: profile.displayName,
  };
};

export const createUser = (params: {
  username: string;
  passwordHash: string;
  displayName: string;
}) => {
  const store = getStore();
  const normalizedUsername = params.username.trim().toLowerCase();
  if (store.usersByUsername.has(normalizedUsername)) {
    return null;
  }

  const id = crypto.randomUUID();
  const user: StoredUser = {
    id,
    username: normalizedUsername,
    passwordHash: params.passwordHash,
    encryptedProfile: encryptJSON({ displayName: params.displayName }),
  };

  store.usersByUsername.set(normalizedUsername, user);
  store.usersById.set(id, user);
  return toPublicUser(user);
};

export const getUserByUsername = (username: string) => {
  const store = getStore();
  const user = store.usersByUsername.get(username.trim().toLowerCase());
  if (!user) return null;
  return user;
};

export const getPublicUserById = (id: string) => {
  const store = getStore();
  const user = store.usersById.get(id);
  if (!user) return null;
  return toPublicUser(user);
};
