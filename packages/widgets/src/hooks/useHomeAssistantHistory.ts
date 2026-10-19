import { useCallback, useEffect, useState } from "react";
import { HomeAssistantHttpError, fetchHomeAssistantHistory } from "../services/homeAssistant";
import type { HomeAssistantHistoryPoint } from "../widgets/homeAssistantHistory";

const HISTORY_POLL_INTERVAL_MS = 5 * 60 * 1000;

export interface UseHomeAssistantHistoryResult {
  points: HomeAssistantHistoryPoint[];
  isLoading: boolean;
  error: string | null;
  status: number | null;
  lastUpdated: number | null;
  refresh: () => Promise<void>;
}

/** Load and periodically refresh a numeric entity's history window. */
export function useHomeAssistantHistory(
  entityId: string,
  hours: number,
  failureCopy: string,
): UseHomeAssistantHistoryResult {
  const [points, setPoints] = useState<HomeAssistantHistoryPoint[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [status, setStatus] = useState<number | null>(null);
  const [lastUpdated, setLastUpdated] = useState<number | null>(null);

  const fetchData = useCallback(async () => {
    if (!entityId) {
      setPoints([]);
      setError(null);
      setStatus(null);
      setLastUpdated(null);
      return;
    }
    setIsLoading(true);
    try {
      setPoints(await fetchHomeAssistantHistory(entityId, hours, failureCopy));
      setError(null);
      setStatus(200);
      setLastUpdated(Date.now());
    } catch (err) {
      setError(err instanceof Error ? err.message : failureCopy);
      if (err instanceof HomeAssistantHttpError) setStatus(err.status);
    } finally {
      setIsLoading(false);
    }
  }, [entityId, failureCopy, hours]);

  useEffect(() => {
    void fetchData();
  }, [fetchData]);

  useEffect(() => {
    if (!entityId) return;
    const timer = setInterval(fetchData, HISTORY_POLL_INTERVAL_MS);
    return () => clearInterval(timer);
  }, [entityId, fetchData]);

  return { points, isLoading, error, status, lastUpdated, refresh: fetchData };
}
