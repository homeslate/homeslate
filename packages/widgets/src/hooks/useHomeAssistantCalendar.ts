import { useCallback, useEffect, useState } from "react";
import type { CalendarEvent } from "../services/calendar";
import {
  HomeAssistantHttpError,
  fetchHomeAssistantCalendarEvents,
} from "../services/homeAssistant";
import { getNextPollDelay } from "./polling";
import { CACHE_POLICIES, haCalendarKey } from "../services/cachePolicies";
import { WIDGET_CACHE_LARGE_MAX_BYTES } from "../services/widgetCache";
import { useHaResource } from "./useHaResource";

const CALENDAR_POLL_INTERVAL_MS = 5 * 60 * 1000;

export type UseHomeAssistantCalendarResult = {
  events: CalendarEvent[];
  isLoading: boolean;
  error: string | null;
  /** HTTP status of the last fetch; `501` means Home Assistant is unconfigured. */
  status: number | null;
  lastUpdated: number | null;
  isStale: boolean;
  refresh: () => void;
};

/**
 * Read a Home Assistant `calendar` entity over the next `daysAhead` days and
 * normalize events into the existing `CalendarEvent` shape.
 */
export function useHomeAssistantCalendar(
  entityId: string,
  daysAhead: number,
  fetchFailureCopy: string,
): UseHomeAssistantCalendarResult {
  const cacheKey = entityId ? haCalendarKey(entityId, daysAhead) : null;
  const { data, isLoading, isStale, error, setError, lastUpdated, beginLoad, commit } =
    useHaResource<CalendarEvent[]>(
      cacheKey,
      CACHE_POLICIES.haCalendar,
      WIDGET_CACHE_LARGE_MAX_BYTES,
    );
  const [status, setStatus] = useState<number | null>(null);
  const [consecutiveFailures, setConsecutiveFailures] = useState(0);
  const events = (data ?? []).map((event) => ({
    ...event,
    start: new Date(event.start),
    end: new Date(event.end),
  }));

  const fetchData = useCallback(async () => {
    if (!entityId || !cacheKey) {
      commit({ type: "clear" });
      setStatus(null);
      setConsecutiveFailures(0);
      return;
    }

    beginLoad();
    try {
      const next = await fetchHomeAssistantCalendarEvents(entityId, daysAhead, fetchFailureCopy);
      commit({
        type: "success",
        data: next.map((event) => ({
          id: event.id,
          title: event.title,
          description: event.description,
          location: event.location,
          start: new Date(event.start),
          end: new Date(event.end),
          allDay: event.allDay,
        })),
        now: Date.now(),
      });
      setError(null);
      setStatus(200);
      setConsecutiveFailures(0);
    } catch (err) {
      setError(err instanceof Error ? err.message : fetchFailureCopy);
      commit({ type: "failure" });
      if (err instanceof HomeAssistantHttpError) setStatus(err.status);
      setConsecutiveFailures((value) => value + 1);
    }
  }, [beginLoad, cacheKey, commit, daysAhead, entityId, fetchFailureCopy, setError]);

  useEffect(() => {
    void fetchData();
  }, [fetchData]);

  useEffect(() => {
    if (!entityId) return;
    const timeout = setTimeout(
      fetchData,
      getNextPollDelay(CALENDAR_POLL_INTERVAL_MS, consecutiveFailures),
    );
    return () => clearTimeout(timeout);
  }, [consecutiveFailures, entityId, fetchData]);

  return { events, isLoading, error, isStale, status, lastUpdated, refresh: fetchData };
}
