import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { getNextPollDelay } from "./polling";
import { useRefreshingPoll } from "./useRefreshingPoll";
import {
  readWidgetCache,
  writeWidgetCache,
  type CacheStore,
  type WidgetCachePolicy,
} from "../services/widgetCache";

export interface CachedResourceState<T> {
  data: T | null;
  isLoading: boolean;
  isStale: boolean;
  error: string | null;
  lastUpdated: number | null;
  consecutiveFailures: number;
}

export interface UseCachedResourceOptions<T> {
  key: string | null;
  fetcher: () => Promise<T>;
  freshMs: number;
  maxStaleMs: number;
  pollMs?: number;
  enabled?: boolean;
  /**
   * When false, a fresh cache entry skips the network until the next poll
   * or an explicit refresh. Home Assistant reads revalidate on mount instead.
   */
  revalidateOnMount?: boolean;
  maxBytes?: number;
  store?: CacheStore;
}

export interface UseCachedResourceResult<T> {
  data: T | null;
  isLoading: boolean;
  isStale: boolean;
  error: string | null;
  lastUpdated: number | null;
  refresh: () => void;
}

function policyOf(freshMs: number, maxStaleMs: number): WidgetCachePolicy {
  return { freshMs, maxStaleMs };
}

export function hydrateCachedResource<T>(
  key: string | null,
  policy: WidgetCachePolicy,
  store?: CacheStore,
  now = Date.now(),
): CachedResourceState<T> {
  if (!key) {
    return {
      data: null,
      isLoading: false,
      isStale: false,
      error: null,
      lastUpdated: null,
      consecutiveFailures: 0,
    };
  }
  const hit = readWidgetCache<T>(key, policy, { store, now });
  if (!hit) {
    return {
      data: null,
      isLoading: true,
      isStale: false,
      error: null,
      lastUpdated: null,
      consecutiveFailures: 0,
    };
  }
  return {
    data: hit.data,
    isLoading: false,
    isStale: hit.isStale,
    error: null,
    lastUpdated: hit.savedAt,
    consecutiveFailures: 0,
  };
}

export async function revalidateCached<T>(options: {
  key: string;
  fetcher: () => Promise<T>;
  policy: WidgetCachePolicy;
  force?: boolean;
  previous?: CachedResourceState<T> | null;
  now?: number;
  store?: CacheStore;
  maxBytes?: number;
}): Promise<CachedResourceState<T>> {
  const now = options.now ?? Date.now();
  const hit = readWidgetCache<T>(options.key, options.policy, { store: options.store, now });
  const previous = options.previous;
  const remembered = hit?.data ?? previous?.data ?? null;
  const rememberedAt = hit?.savedAt ?? previous?.lastUpdated ?? null;

  if (hit?.isFresh && !options.force) {
    return {
      data: hit.data,
      isLoading: false,
      isStale: false,
      error: null,
      lastUpdated: hit.savedAt,
      consecutiveFailures: 0,
    };
  }

  try {
    const data = await options.fetcher();
    writeWidgetCache(options.key, data, {
      now,
      store: options.store,
      maxBytes: options.maxBytes,
    });
    return {
      data,
      isLoading: false,
      isStale: false,
      error: null,
      lastUpdated: now,
      consecutiveFailures: 0,
    };
  } catch (error) {
    const message = error instanceof Error ? error.message : "Failed to load";
    if (remembered != null && rememberedAt != null) {
      return {
        data: remembered,
        isLoading: false,
        isStale: true,
        error: message,
        lastUpdated: rememberedAt,
        consecutiveFailures: (previous?.consecutiveFailures ?? 0) + 1,
      };
    }
    return {
      data: null,
      isLoading: false,
      isStale: false,
      error: message,
      lastUpdated: null,
      consecutiveFailures: (previous?.consecutiveFailures ?? 0) + 1,
    };
  }
}

export function useCachedResource<T>({
  key,
  fetcher,
  freshMs,
  maxStaleMs,
  pollMs,
  enabled = true,
  revalidateOnMount = false,
  maxBytes,
  store,
}: UseCachedResourceOptions<T>): UseCachedResourceResult<T> {
  const policy = useMemo(() => policyOf(freshMs, maxStaleMs), [freshMs, maxStaleMs]);
  const fetcherRef = useRef(fetcher);
  fetcherRef.current = fetcher;
  const stateRef = useRef<CachedResourceState<T> | null>(null);
  const [state, setState] = useState<CachedResourceState<T>>(() =>
    hydrateCachedResource<T>(enabled ? key : null, policy, store),
  );
  stateRef.current = state;

  const seenKey = useRef(enabled ? key : null);
  const activeKey = enabled ? key : null;
  if (seenKey.current !== activeKey) {
    seenKey.current = activeKey;
    const next = hydrateCachedResource<T>(activeKey, policy, store);
    stateRef.current = next;
    setState(next);
  }

  const apply = useCallback((next: CachedResourceState<T>) => {
    stateRef.current = next;
    setState(next);
  }, []);

  const run = useCallback(
    (force: boolean) => {
      if (!activeKey) return Promise.resolve();
      return revalidateCached<T>({
        key: activeKey,
        fetcher: () => fetcherRef.current(),
        policy,
        force,
        previous: stateRef.current,
        store,
        maxBytes,
      }).then(apply);
    },
    [activeKey, apply, maxBytes, policy, store],
  );

  useEffect(() => {
    if (!activeKey) return;
    const hit = readWidgetCache(activeKey, policy, { store });
    if (hit?.isFresh && !revalidateOnMount) return;
    let cancelled = false;
    void revalidateCached<T>({
      key: activeKey,
      fetcher: () => fetcherRef.current(),
      policy,
      force: revalidateOnMount,
      previous: stateRef.current,
      store,
      maxBytes,
    }).then((next) => {
      if (!cancelled) apply(next);
    });
    return () => {
      cancelled = true;
    };
  }, [activeKey, apply, maxBytes, policy, revalidateOnMount, store]);

  useRefreshingPoll(
    Boolean(activeKey && pollMs),
    getNextPollDelay(pollMs ?? 0, state.consecutiveFailures),
    () => run(true),
  );

  const refresh = useCallback(() => {
    void run(true);
  }, [run]);

  return {
    data: state.data,
    isLoading: state.isLoading,
    isStale: state.isStale,
    error: state.error,
    lastUpdated: state.lastUpdated,
    refresh,
  };
}
