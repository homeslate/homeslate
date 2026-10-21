import { useState, useEffect, useCallback, useRef } from "react";
import { DISPLAY_CALENDAR_DAYS_BACK_DEFAULT } from "@homeslate/google";
import { useGoogleRuntime } from "../googleRuntime";
import {
  fetchCalendarList,
  fetchAllCalendarEvents,
  createCalendarEvent,
  updateCalendarEvent,
  deleteCalendarEvent,
  type GoogleCalendar,
  type ParsedCalendarEvent,
  type CalendarEventInput,
} from "../services/googleCalendar";
import {
  useCalendarCacheStore,
  calendarCacheKey,
  fromStoredGoogleCalendar,
  googleCalendarFreshness,
  toStoredGoogleCalendar,
} from "../store/calendarCacheStore";
import { CACHE_POLICIES, googleCalendarKey } from "../services/cachePolicies";
import {
  readWidgetCache,
  WIDGET_CACHE_LARGE_MAX_BYTES,
  writeWidgetCache,
} from "../services/widgetCache";
import { getNextPollDelay } from "./polling";
import { useRefreshingPoll } from "./useRefreshingPoll";

interface UseGoogleCalendarOptions {
  // clientId is kept in the type for config backward-compatibility but is no
  // longer used — the shared GoogleRuntime token is used instead.
  clientId?: string;
  selectedCalendarIds: string[];
  daysAhead?: number;
  daysBack?: number;
  refreshInterval?: number;
  enabled?: boolean;
}

interface UseGoogleCalendarResult {
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
  calendars: GoogleCalendar[];
  events: ParsedCalendarEvent[];
  lastUpdated: number | null;
  isStale: boolean;
  refresh: () => void;
  addEvent: (calendarId: string, event: CalendarEventInput) => Promise<void>;
  editEvent: (calendarId: string, eventId: string, event: CalendarEventInput) => Promise<void>;
  removeEvent: (calendarId: string, eventId: string) => Promise<void>;
}

const TOKEN_EXPIRED_MSG = "Token expired. Please sign in again.";

export function useGoogleCalendar({
  selectedCalendarIds,
  daysAhead = 30,
  daysBack = DISPLAY_CALENDAR_DAYS_BACK_DEFAULT,
  refreshInterval = 5 * 60 * 1000,
  enabled = true,
}: UseGoogleCalendarOptions): UseGoogleCalendarResult {
  const { accessToken, isAuthenticated, refreshAccessToken } = useGoogleRuntime();
  const { getEntry, setEntry } = useCalendarCacheStore();
  const cacheKey = calendarCacheKey(selectedCalendarIds, daysAhead, daysBack);
  const widgetKey = googleCalendarKey(selectedCalendarIds, daysAhead, daysBack);
  const memory = getEntry(cacheKey);
  const persistedHit = memory
    ? null
    : readWidgetCache<ReturnType<typeof toStoredGoogleCalendar>>(
        widgetKey,
        CACHE_POLICIES.googleCalendar,
      );
  const persisted = persistedHit
    ? { ...fromStoredGoogleCalendar(persistedHit.data), fetchedAt: persistedHit.savedAt }
    : null;
  const seeded =
    (memory ?? persisted) && googleCalendarFreshness((memory ?? persisted)!.fetchedAt) !== "expired"
      ? (memory ?? persisted)
      : null;

  const [isLoading, setIsLoading] = useState(enabled && !seeded);
  const [isStale, setIsStale] = useState(
    seeded ? googleCalendarFreshness(seeded.fetchedAt) === "stale" : false,
  );
  const [error, setError] = useState<string | null>(null);
  const [calendars, setCalendars] = useState<GoogleCalendar[]>(seeded?.calendars ?? []);
  const [events, setEvents] = useState<ParsedCalendarEvent[]>(seeded?.events ?? []);
  const [lastUpdated, setLastUpdated] = useState<number | null>(seeded?.fetchedAt ?? null);
  const [consecutiveFailures, setConsecutiveFailures] = useState(0);
  const eventCount = useRef(events.length);
  eventCount.current = events.length;

  const fetchCalendars = useCallback(async () => {
    if (!enabled) return;
    if (!accessToken) return;
    const doFetch = async (token: string) => {
      const result = await fetchCalendarList(token);
      setCalendars(result);
      const existing = getEntry(cacheKey);
      if (existing) {
        setEntry(cacheKey, { ...existing, calendars: result });
      }
    };
    try {
      await doFetch(accessToken);
    } catch (err) {
      if (err instanceof Error && err.message === TOKEN_EXPIRED_MSG) {
        const newToken = await refreshAccessToken();
        if (newToken) {
          try {
            await doFetch(newToken);
            setError(null);
            return;
          } catch {
            /* fall through to set error */
          }
        }
      }
      setError(err instanceof Error ? err.message : "Failed to fetch calendars");
    }
  }, [enabled, accessToken, cacheKey, getEntry, setEntry, refreshAccessToken]);

  const fetchEvents = useCallback(
    async (force = false) => {
      if (!enabled) return;
      if (!accessToken || selectedCalendarIds.length === 0) {
        setEvents([]);
        setLastUpdated(null);
        setConsecutiveFailures(0);
        return;
      }
      if (!force) {
        const existing = getEntry(cacheKey);
        const persistedExisting = existing
          ? null
          : readWidgetCache<ReturnType<typeof toStoredGoogleCalendar>>(
              widgetKey,
              CACHE_POLICIES.googleCalendar,
            );
        const snapshot = existing
          ? existing
          : persistedExisting
            ? {
                ...fromStoredGoogleCalendar(persistedExisting.data),
                fetchedAt: persistedExisting.savedAt,
              }
            : null;
        if (snapshot && googleCalendarFreshness(snapshot.fetchedAt) === "fresh") {
          setCalendars(snapshot.calendars);
          setEvents(snapshot.events);
          setLastUpdated(snapshot.fetchedAt);
          setIsStale(false);
          setIsLoading(false);
          setError(null);
          return;
        }
        if (snapshot && googleCalendarFreshness(snapshot.fetchedAt) === "stale") {
          setIsStale(true);
        }
      }
      setIsLoading((current) => current && eventCount.current === 0);
      const doFetch = async (token: string) => {
        const [calendarList, eventList] = await Promise.all([
          fetchCalendarList(token),
          fetchAllCalendarEvents(token, selectedCalendarIds, daysAhead, daysBack),
        ]);
        setCalendars(calendarList);
        setEvents(eventList);
        const fetchedAt = Date.now();
        setEntry(cacheKey, { calendars: calendarList, events: eventList, fetchedAt });
        writeWidgetCache(widgetKey, toStoredGoogleCalendar(calendarList, eventList), {
          now: fetchedAt,
          maxBytes: WIDGET_CACHE_LARGE_MAX_BYTES,
        });
        setLastUpdated(fetchedAt);
        setIsStale(false);
        setError(null);
        setConsecutiveFailures(0);
      };
      try {
        await doFetch(accessToken);
      } catch (err) {
        if (err instanceof Error && err.message === TOKEN_EXPIRED_MSG) {
          const newToken = await refreshAccessToken();
          if (newToken) {
            try {
              await doFetch(newToken);
              setError(null);
              return;
            } catch {
              /* fall through to set error */
            }
          }
        }
        setError(err instanceof Error ? err.message : "Failed to fetch events");
        setIsStale(true);
        setConsecutiveFailures((prev) => prev + 1);
      } finally {
        setIsLoading(false);
      }
    },
    [
      enabled,
      accessToken,
      selectedCalendarIds,
      daysAhead,
      daysBack,
      cacheKey,
      widgetKey,
      getEntry,
      setEntry,
      refreshAccessToken,
    ],
  );

  // Always fetch calendar list when authenticated (needed for settings dropdown even when none selected)
  useEffect(() => {
    if (!enabled) return;
    if (isAuthenticated) void fetchCalendars();
  }, [enabled, isAuthenticated, fetchCalendars]);

  useEffect(() => {
    if (!enabled) return;
    if (isAuthenticated && selectedCalendarIds.length > 0) void fetchEvents();
  }, [enabled, isAuthenticated, selectedCalendarIds, fetchEvents]);

  useRefreshingPoll(
    enabled && isAuthenticated && selectedCalendarIds.length > 0,
    getNextPollDelay(refreshInterval, consecutiveFailures),
    () => fetchEvents(true),
  );

  useEffect(() => {
    if (!enabled) {
      setIsLoading(false);
      setError(null);
      setConsecutiveFailures(0);
    }
  }, [enabled]);

  const refresh = useCallback(() => {
    if (!enabled) return;
    void fetchCalendars();
    void fetchEvents(true);
  }, [enabled, fetchCalendars, fetchEvents]);

  const withTokenRetry = useCallback(
    async <T>(fn: (token: string) => Promise<T>): Promise<T> => {
      if (!accessToken) throw new Error("Not authenticated");
      try {
        return await fn(accessToken);
      } catch (err) {
        if (err instanceof Error && err.message === TOKEN_EXPIRED_MSG) {
          const newToken = await refreshAccessToken();
          if (newToken) return fn(newToken);
        }
        throw err;
      }
    },
    [accessToken, refreshAccessToken],
  );

  const addEvent = useCallback(
    async (calendarId: string, event: CalendarEventInput) => {
      await withTokenRetry((token) => createCalendarEvent(token, calendarId, event));
      void fetchEvents(true);
    },
    [withTokenRetry, fetchEvents],
  );

  const editEvent = useCallback(
    async (calendarId: string, eventId: string, event: CalendarEventInput) => {
      await withTokenRetry((token) => updateCalendarEvent(token, calendarId, eventId, event));
      void fetchEvents(true);
    },
    [withTokenRetry, fetchEvents],
  );

  const removeEvent = useCallback(
    async (calendarId: string, eventId: string) => {
      await withTokenRetry((token) => deleteCalendarEvent(token, calendarId, eventId));
      void fetchEvents(true);
    },
    [withTokenRetry, fetchEvents],
  );

  return {
    isAuthenticated,
    isLoading,
    error,
    calendars,
    events,
    lastUpdated,
    isStale,
    refresh,
    addEvent,
    editEvent,
    removeEvent,
  };
}
