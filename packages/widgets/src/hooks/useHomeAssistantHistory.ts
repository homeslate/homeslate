import { useCallback, useEffect, useState } from "react";
import { HomeAssistantHttpError, fetchHomeAssistantHistory } from "../services/homeAssistant";
import type { HomeAssistantHistoryPoint } from "../widgets/homeAssistantHistory";
import { CACHE_POLICIES, haHistoryKey } from "../services/cachePolicies";
import { WIDGET_CACHE_LARGE_MAX_BYTES } from "../services/widgetCache";
import { useHaResource } from "./useHaResource";

const HISTORY_POLL_INTERVAL_MS = 5 * 60 * 1000;

export interface UseHomeAssistantHistoryResult {
  points: HomeAssistantHistoryPoint[];
  isLoading: boolean;
  error: string | null;
  status: number | null;
  lastUpdated: number | null;
  isStale: boolean;
  refresh: () => Promise<void>;
}

/** Load and periodically refresh a numeric entity's history window. */
export function useHomeAssistantHistory(
  entityId: string,
  hours: number,
  failureCopy: string,
): UseHomeAssistantHistoryResult {
  const cacheKey = entityId ? haHistoryKey(entityId, hours) : null;
  const { data, isLoading, isStale, error, setError, lastUpdated, beginLoad, commit } =
    useHaResource<HomeAssistantHistoryPoint[]>(
      cacheKey,
      CACHE_POLICIES.haHistory,
      WIDGET_CACHE_LARGE_MAX_BYTES,
    );
  const [status, setStatus] = useState<number | null>(null);

  const fetchData = useCallback(async () => {
    if (!entityId || !cacheKey) {
      commit({ type: "clear" });
      setStatus(null);
      return;
    }
    beginLoad();
    try {
      const points = await fetchHomeAssistantHistory(entityId, hours, failureCopy);
      commit({ type: "success", data: points, now: Date.now() });
      setError(null);
      setStatus(200);
    } catch (err) {
      setError(err instanceof Error ? err.message : failureCopy);
      commit({ type: "failure" });
      if (err instanceof HomeAssistantHttpError) setStatus(err.status);
    }
  }, [beginLoad, cacheKey, commit, entityId, failureCopy, hours, setError]);

  useEffect(() => {
    void fetchData();
  }, [fetchData]);

  useEffect(() => {
    if (!entityId) return;
    const timer = setInterval(fetchData, HISTORY_POLL_INTERVAL_MS);
    return () => clearInterval(timer);
  }, [entityId, fetchData]);

  return { points: data ?? [], isLoading, error, isStale, status, lastUpdated, refresh: fetchData };
}
