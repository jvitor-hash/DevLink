class SessionCache {
  private storageKey: string | null = null;

  constructor(session_key_prefix: string) {
    this.storageKey = session_key_prefix;
  }

  read<T>(key: string) : T | undefined {
    try {
      const data = localStorage.getItem(this.storageKey + key);
      return data === null ? undefined : (JSON.parse(data) as T);
    } catch (error) {
      console.error(`Failed to read storage (${this.storageKey}): ${key}`);
      return undefined;
    }
  }

  write(key: string, value: unknown) : void {
    try {
      localStorage.setItem(this.storageKey + key, JSON.stringify(value));
    } catch (error) {
      console.error(`Failed to write to storage (${this.storageKey}): ${key}`);
    }
  }

  delete(key: string) : boolean {
    const exists = this.read(key) !== undefined;

    try {
      localStorage.removeItem(this.storageKey + key);
    } catch (error) {
      console.error(`Failed to delete storage item (${this.storageKey}): ${key}`);
      return false;
    }

    return exists;
  }
}

export const sessionCache = new SessionCache("devlink");