export type TtlCache<T> = {
  get(key: string, now: number): T | undefined;
  set(key: string, value: T, ttlMs: number, now: number): void;
};

export function createTtlCache<T>(): TtlCache<T> {
  const entries = new Map<string, { value: T; expiresAt: number }>();

  return {
    get(key, now) {
      const entry = entries.get(key);
      if (!entry) return undefined;
      if (now >= entry.expiresAt) {
        entries.delete(key);
        return undefined;
      }
      return entry.value;
    },
    set(key, value, ttlMs, now) {
      entries.set(key, { value, expiresAt: now + ttlMs });
    },
  };
}
