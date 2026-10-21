import { useCallback, useRef, useState } from "react";
import { reduceHaRead, type HaReadEvent } from "../services/haCache";
import { CACHE_POLICIES, type CachePolicy } from "../services/cachePolicies";
import { readWidgetCache, writeWidgetCache, WIDGET_CACHE_MAX_BYTES } from "../services/widgetCache";

export function useHaResource<T>(
  cacheKey: string | null,
  policy: CachePolicy = CACHE_POLICIES.haEntity,
  maxBytes = WIDGET_CACHE_MAX_BYTES,
) {
  const seeded = cacheKey ? readWidgetCache<T>(cacheKey, policy) : null;
  const [data, setDataState] = useState<T | null>(seeded?.data ?? null);
  const [isLoading, setIsLoading] = useState(Boolean(cacheKey) && !seeded);
  const [isStale, setIsStale] = useState(Boolean(seeded && !seeded.isFresh));
  const [error, setError] = useState<string | null>(null);
  const [lastUpdated, setLastUpdated] = useState<number | null>(seeded?.savedAt ?? null);
  const dataRef = useRef(data);
  const lastUpdatedRef = useRef(lastUpdated);
  const hasValue = useRef(seeded != null);
  const keyRef = useRef(cacheKey);
  dataRef.current = data;
  lastUpdatedRef.current = lastUpdated;

  if (keyRef.current !== cacheKey) {
    keyRef.current = cacheKey;
    const next = cacheKey ? readWidgetCache<T>(cacheKey, policy) : null;
    hasValue.current = next != null;
    dataRef.current = next?.data ?? null;
    setDataState(next?.data ?? null);
    setIsLoading(Boolean(cacheKey) && !next);
    setIsStale(Boolean(next && !next.isFresh));
    lastUpdatedRef.current = next?.savedAt ?? null;
    setLastUpdated(next?.savedAt ?? null);
    setError(null);
  }

  const setData = useCallback((updater: T | null | ((current: T | null) => T | null)) => {
    setDataState((current) => {
      const value =
        typeof updater === "function"
          ? (updater as (current: T | null) => T | null)(current)
          : updater;
      dataRef.current = value;
      if (value != null) hasValue.current = true;
      return value;
    });
  }, []);

  const beginLoad = useCallback(() => {
    if (!hasValue.current) setIsLoading(true);
  }, []);

  const commit = useCallback(
    (event: HaReadEvent<T>) => {
      const reduced = reduceHaRead(
        { data: dataRef.current, lastUpdated: lastUpdatedRef.current },
        event,
      );
      if (reduced.persist && keyRef.current && reduced.data != null) {
        writeWidgetCache(keyRef.current, reduced.data, { maxBytes });
      }
      hasValue.current = reduced.data != null && event.type !== "clear";
      dataRef.current = reduced.data;
      setDataState(reduced.data);
      setIsStale(reduced.isStale);
      setIsLoading(false);
      if (event.type === "success") {
        lastUpdatedRef.current = reduced.lastUpdated;
        setLastUpdated(reduced.lastUpdated);
      }
      if (event.type === "clear") {
        lastUpdatedRef.current = null;
        setLastUpdated(null);
        setError(null);
        hasValue.current = false;
      }
    },
    [maxBytes],
  );

  return { data, setData, isLoading, isStale, error, setError, lastUpdated, beginLoad, commit };
}
