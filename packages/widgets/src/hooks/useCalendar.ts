import { CACHE_POLICIES, icalKey } from "../services/cachePolicies";
import { fetchCalendarEventsCached, type CalendarEvent } from "../services/calendar";
import { WIDGET_CACHE_LARGE_MAX_BYTES } from "../services/widgetCache";
import { useCachedResource } from "./useCachedResource";

interface UseCalendarOptions {
  icalUrl: string;
  daysAhead?: number;
  refreshInterval?: number;
}

interface UseCalendarResult {
  events: CalendarEvent[];
  isLoading: boolean;
  isStale: boolean;
  error: string | null;
  lastUpdated: number | null;
  refresh: () => void;
}

function reviveEvents(events: CalendarEvent[]): CalendarEvent[] {
  return events.map((event) => ({
    ...event,
    start: new Date(event.start),
    end: new Date(event.end),
  }));
}

export function useCalendar({
  icalUrl,
  daysAhead = 30,
  refreshInterval = CACHE_POLICIES.ical.freshMs,
}: UseCalendarOptions): UseCalendarResult {
  const cacheKey = icalUrl ? icalKey(icalUrl, daysAhead) : null;
  const resource = useCachedResource<CalendarEvent[]>({
    key: cacheKey,
    freshMs: CACHE_POLICIES.ical.freshMs,
    maxStaleMs: CACHE_POLICIES.ical.maxStaleMs,
    pollMs: refreshInterval,
    maxBytes: WIDGET_CACHE_LARGE_MAX_BYTES,
    fetcher: () => fetchCalendarEventsCached(icalUrl, daysAhead),
  });

  return {
    events: reviveEvents(resource.data ?? []),
    isLoading: resource.isLoading,
    isStale: resource.isStale,
    error: resource.error,
    lastUpdated: resource.lastUpdated,
    refresh: resource.refresh,
  };
}
