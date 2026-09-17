const SESSION_CACHE_PREFIX = "devlink";

export const CACHE_KEYS = {
  CURRENT_USER: "current_user",
  AUTH_TOKEN: "auth_token",
  TOKEN_EXPIRY: "token_expiry",
} as const;

const storageKey = (key: string) : string => `${SESSION_CACHE_PREFIX}:${key}`;

const read = <T>(key: string) : T | undefined => {
  try {
    const raw = localStorage.getItem(storageKey(key));

    return raw === null ? undefined : (JSON.parse(raw) as T);
  } catch {
    return undefined;
  }
};

const write = (key: string, value: unknown) : void => {
  try {
    localStorage.setItem(storageKey(key), JSON.stringify(value));
  } catch {
    // Storage can be unavailable (private mode, quota); ignore write failures.
  }
};

export const cache = {
  get: <T>(key: string) : T | undefined => read<T>(key),

  set: (key: string, value: unknown) : void => write(key, value),

  has: (key: string) : boolean => read(key) !== undefined,

  delete: (key: string) : boolean => {
    const existed = read(key) !== undefined;

    try {
      localStorage.removeItem(storageKey(key));
    } catch {
      return false;
    }

    return existed;
  },
};
