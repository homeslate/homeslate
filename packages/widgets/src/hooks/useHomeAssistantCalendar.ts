import { useCallback, useEffect, useState } from "react";
import type { CalendarEvent } from "../services/calendar";
import {
  HomeAssistantHttpError,
  fetchHomeAssistantCalendarEvents,
} from "../services/homeAssistant";
import { getNextPollDelay } from "./polling";

const CALENDAR_POLL_INTERVAL_MS = 5 * 60 * 1000;

export type UseHomeAssistantCalendarResult = {
  events: CalendarEvent[];
  isLoading: boolean;
  error: string | null;
  /** HTTP status of the last fetch; `501` means Home Assistant is unconfigured. */
  status: number | null;
  lastUpdated: number | null;
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
  const [events, setEvents] = useState<CalendarEvent[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [status, setStatus] = useState<number | null>(null);
  const [lastUpdated, setLastUpdated] = useState<number | null>(null);
  const [consecutiveFailures, setConsecutiveFailures] = useState(0);

  const fetchData = useCallback(async () => {
    if (!entityId) {
      setEvents([]);
      setError(null);
      setStatus(null);
      setLastUpdated(null);
      setConsecutiveFailures(0);
      return;
    }

    setIsLoading(true);
    try {
      const next = await fetchHomeAssistantCalendarEvents(entityId, daysAhead, fetchFailureCopy);
      setEvents(
        next.map((event) => ({
          id: event.id,
          title: event.title,
          description: event.description,
          location: event.location,
          start: new Date(event.start),
          end: new Date(event.end),
          allDay: event.allDay,
        })),
      );
      setError(null);
      setStatus(200);
      setLastUpdated(Date.now());
      setConsecutiveFailures(0);
    } catch (err) {
      setError(err instanceof Error ? err.message : fetchFailureCopy);
      if (err instanceof HomeAssistantHttpError) setStatus(err.status);
      setConsecutiveFailures((value) => value + 1);
    } finally {
      setIsLoading(false);
    }
  }, [daysAhead, entityId, fetchFailureCopy]);

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

  return { events, isLoading, error, status, lastUpdated, refresh: fetchData };
}
