export const WIDGET_CACHE_PREFIX = "homeslate:widgetCache:v1:";
export const WIDGET_CACHE_INDEX_KEY = "homeslate:widgetCache:index:v1";
export const WIDGET_CACHE_MAX_ENTRIES = 200;
/** Single-entity payloads. Larger lists pass their own cap. */
export const WIDGET_CACHE_MAX_BYTES = 32_768;
export const WIDGET_CACHE_LARGE_MAX_BYTES = 256 * 1024;

export interface CacheStore {
  getItem(key: string): string | null;
  setItem(key: string, value: string): void;
  removeItem(key: string): void;
}

export interface WidgetCachePolicy {
  freshMs: number;
  maxStaleMs: number;
}

export interface WidgetCacheHit<T> {
  data: T;
  savedAt: number;
  isFresh: boolean;
  isStale: boolean;
}

interface StoredEntry<T> {
  savedAt: number;
  data: T;
}

type CacheIndex = Record<string, number>;

export function createMemoryCacheStore(): CacheStore {
  const values = new Map<string, string>();
  return {
    getItem: (key) => values.get(key) ?? null,
    setItem: (key, value) => {
      values.set(key, value);
    },
    removeItem: (key) => {
      values.delete(key);
    },
  };
}

function browserCacheStore(): CacheStore {
  return {
    getItem(key) {
      try {
        return globalThis.localStorage?.getItem(key) ?? null;
      } catch {
        return null;
      }
    },
    setItem(key, value) {
      if (typeof localStorage === "undefined") {
        throw new Error("localStorage is unavailable");
      }
      localStorage.setItem(key, value);
    },
    removeItem(key) {
      try {
        localStorage?.removeItem(key);
      } catch {
        // Private mode and quota failures are a cache miss.
      }
    },
  };
}

function resolveStore(store?: CacheStore): CacheStore {
  return store ?? browserCacheStore();
}

function storageKey(key: string): string {
  return `${WIDGET_CACHE_PREFIX}${key}`;
}

function readIndex(store: CacheStore): CacheIndex {
  const raw = store.getItem(WIDGET_CACHE_INDEX_KEY);
  if (!raw) return {};
  try {
    const parsed = JSON.parse(raw) as unknown;
    if (!parsed || typeof parsed !== "object" || Array.isArray(parsed)) return {};
    return parsed as CacheIndex;
  } catch {
    return {};
  }
}

function writeIndex(store: CacheStore, index: CacheIndex): void {
  store.setItem(WIDGET_CACHE_INDEX_KEY, JSON.stringify(index));
}

export function readWidgetCache<T>(
  key: string,
  policy: WidgetCachePolicy,
  options?: { now?: number; store?: CacheStore },
): WidgetCacheHit<T> | null {
  const store = resolveStore(options?.store);
  const now = options?.now ?? Date.now();
  let raw: string | null;
  try {
    raw = store.getItem(storageKey(key));
  } catch {
    return null;
  }
  if (!raw) return null;

  let parsed: StoredEntry<T>;
  try {
    parsed = JSON.parse(raw) as StoredEntry<T>;
  } catch {
    clearWidgetCache(key, store);
    return null;
  }
  if (!parsed || typeof parsed.savedAt !== "number" || !("data" in parsed)) {
    clearWidgetCache(key, store);
    return null;
  }

  const age = now - parsed.savedAt;
  if (age >= policy.maxStaleMs) {
    clearWidgetCache(key, store);
    return null;
  }

  const isFresh = age < policy.freshMs;
  return {
    data: parsed.data,
    savedAt: parsed.savedAt,
    isFresh,
    isStale: !isFresh,
  };
}

export function writeWidgetCache<T>(
  key: string,
  data: T,
  options?: { now?: number; store?: CacheStore; maxBytes?: number },
): boolean {
  const store = resolveStore(options?.store);
  const now = options?.now ?? Date.now();
  const payload = JSON.stringify({ savedAt: now, data } satisfies StoredEntry<T>);
  if (payload.length > (options?.maxBytes ?? WIDGET_CACHE_MAX_BYTES)) return false;

  try {
    store.setItem(storageKey(key), payload);
  } catch {
    return false;
  }

  try {
    const index = readIndex(store);
    index[key] = now;
    const keys = Object.keys(index);
    if (keys.length > WIDGET_CACHE_MAX_ENTRIES) {
      const oldest = keys.sort((left, right) => index[left] - index[right]);
      const extra = keys.length - WIDGET_CACHE_MAX_ENTRIES;
      for (let indexPosition = 0; indexPosition < extra; indexPosition += 1) {
        const drop = oldest[indexPosition];
        store.removeItem(storageKey(drop));
        delete index[drop];
      }
    }
    writeIndex(store, index);
  } catch {
    return true;
  }
  return true;
}

export function clearWidgetCache(key?: string, store?: CacheStore): void {
  try {
    const resolved = resolveStore(store);
    if (!key) {
      clearWidgetCacheWhere(() => true, resolved);
      return;
    }
    resolved.removeItem(storageKey(key));
    const index = readIndex(resolved);
    delete index[key];
    writeIndex(resolved, index);
  } catch {
    // Storage can throw in private mode.
  }
}

export function clearWidgetCacheWhere(
  predicate: (key: string) => boolean,
  store?: CacheStore,
): void {
  const resolved = resolveStore(store);
  const index = readIndex(resolved);
  for (const key of Object.keys(index)) {
    if (!predicate(key)) continue;
    resolved.removeItem(storageKey(key));
    delete index[key];
  }
  if (Object.keys(index).length === 0) {
    resolved.removeItem(WIDGET_CACHE_INDEX_KEY);
    return;
  }
  try {
    writeIndex(resolved, index);
  } catch {
    // Remaining entries still expire on read.
  }
}
