import { useState, useEffect, useCallback } from "react";
import { DISPLAY_CALENDAR_DAYS_BACK_DEFAULT } from "@homeslate/google";
import { useGoogleRuntime } from "../googleRuntime";
import type {
  GoogleCalendar,
  ParsedCalendarEvent,
  CalendarEventInput,
} from "../services/googleCalendar";
import {
  fetchDisplayCalendarCached,
  displayCalendarCacheAction,
} from "../services/displayCalendarCache";
import { CACHE_POLICIES, googleCalendarKey } from "../services/cachePolicies";
import {
  readWidgetCache,
  WIDGET_CACHE_LARGE_MAX_BYTES,
  writeWidgetCache,
} from "../services/widgetCache";
import {
  fromStoredGoogleCalendar,
  googleCalendarFreshness,
  toStoredGoogleCalendar,
} from "../store/calendarCacheStore";
import {
  displayCalendarUserMessage,
  isFatalGoogleAuthFailure,
} from "../widgets/googleCalendarError";
import { getDisplayCalendarPollDelay } from "./polling";
import { useRefreshingPoll } from "./useRefreshingPoll";

export function displayCalendarUrl(
  kioskFetchBaseUrl: string,
  params: { displayId: string; calendarIds: string; daysAhead: number; daysBack: number },
): string {
  const search = new URLSearchParams({
    displayId: params.displayId,
    calendarIds: params.calendarIds,
    daysAhead: String(params.daysAhead),
    daysBack: String(params.daysBack),
  });
  return `${kioskFetchBaseUrl}/display-calendar?${search}`;
}

const REFRESH_INTERVAL_MS = 5 * 60 * 1000;

interface UseDisplayCalendarOptions {
  displayId: string | null;
  selectedCalendarIds: string[];
  daysAhead?: number;
  daysBack?: number;
}

interface UseDisplayCalendarResult {
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

const EMPTY_RESULT: UseDisplayCalendarResult = {
  isAuthenticated: false,
  isLoading: false,
  error: null,
  calendars: [],
  events: [],
  lastUpdated: null,
  isStale: false,
  refresh: () => {},
  addEvent: async () => {},
  editEvent: async () => {},
  removeEvent: async () => {},
};

function parseEventFromServer(ev: {
  start: string;
  end: string;
  [k: string]: unknown;
}): ParsedCalendarEvent {
  return {
    id: ev.id as string,
    calendarId: ev.calendarId as string,
    calendarName: ev.calendarName as string | undefined,
    title: (ev.title as string) ?? "(No title)",
    description: ev.description as string | undefined,
    location: ev.location as string | undefined,
    start: new Date(ev.start as string),
    end: new Date(ev.end as string),
    allDay: !!ev.allDay,
    color: (ev.color as string) ?? "#4285f4",
    htmlLink: ev.htmlLink as string | undefined,
  };
}

export function useDisplayCalendar({
  displayId,
  selectedCalendarIds,
  daysAhead = 30,
  daysBack = DISPLAY_CALENDAR_DAYS_BACK_DEFAULT,
}: UseDisplayCalendarOptions): UseDisplayCalendarResult {
  const { kioskFetchBaseUrl } = useGoogleRuntime();
  const selectedCalendarIdsKey = selectedCalendarIds.join(",");
  const widgetKey = googleCalendarKey(selectedCalendarIds, daysAhead, daysBack);
  const persistedHit =
    displayId && selectedCalendarIdsKey
      ? readWidgetCache<ReturnType<typeof toStoredGoogleCalendar>>(
          widgetKey,
          CACHE_POLICIES.googleCalendar,
        )
      : null;
  const persisted =
    persistedHit && googleCalendarFreshness(persistedHit.savedAt) !== "expired"
      ? { ...fromStoredGoogleCalendar(persistedHit.data), fetchedAt: persistedHit.savedAt }
      : null;

  const [isLoading, setIsLoading] = useState(!persisted);
  const [isStale, setIsStale] = useState(
    persisted ? googleCalendarFreshness(persisted.fetchedAt) === "stale" : false,
  );
  const [error, setError] = useState<string | null>(null);
  const [calendars, setCalendars] = useState<GoogleCalendar[]>(persisted?.calendars ?? []);
  const [events, setEvents] = useState<ParsedCalendarEvent[]>(persisted?.events ?? []);
  const [lastUpdated, setLastUpdated] = useState<number | null>(persisted?.fetchedAt ?? null);
  const [consecutiveFailures, setConsecutiveFailures] = useState(0);
  const [authFailureReason, setAuthFailureReason] = useState<string | null>(null);

  const fetchData = useCallback(async () => {
    if (!displayId || selectedCalendarIdsKey.length === 0) {
      setCalendars([]);
      setEvents([]);
      setLastUpdated(null);
      setConsecutiveFailures(0);
      setAuthFailureReason(null);
      setIsLoading(false);
      return;
    }
    const hit = readWidgetCache<ReturnType<typeof toStoredGoogleCalendar>>(
      widgetKey,
      CACHE_POLICIES.googleCalendar,
    );
    const snapshot =
      hit && googleCalendarFreshness(hit.savedAt) !== "expired"
        ? { ...fromStoredGoogleCalendar(hit.data), fetchedAt: hit.savedAt }
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
    if (!snapshot) setIsLoading(true);
    try {
      const url = displayCalendarUrl(kioskFetchBaseUrl, {
        displayId,
        calendarIds: selectedCalendarIdsKey,
        daysAhead,
        daysBack,
      });
      console.info("[display-calendar] fetching", {
        displayId,
        calendarCount: selectedCalendarIdsKey.split(",").filter(Boolean).length,
        daysAhead,
        daysBack,
      });
      const res = await fetchDisplayCalendarCached(url, undefined, fetch);
      const data = (await res.json()) as {
        error?: string;
        reason?: string;
        details?: unknown;
        calendars?: Array<{ id: string; summary?: string; backgroundColor?: string }>;
        events?: Array<{ start: string; end: string; [k: string]: unknown }>;
      };
      if (!res.ok) {
        console.warn("[display-calendar] request failed", {
          displayId,
          status: res.status,
          error: data.error,
          reason: data.reason,
          details: data.details,
        });
        setAuthFailureReason(data.reason ?? null);
        setError(displayCalendarUserMessage(data.error ?? "Failed to load calendar", data.reason));
        return;
      }
      console.info("[display-calendar] request succeeded", {
        displayId,
        calendarCount: (data.calendars ?? []).length,
        eventCount: (data.events ?? []).length,
      });
      const calList = (data.calendars ?? []).map((c) => ({
        id: c.id,
        summary: c.summary ?? c.id,
        backgroundColor: c.backgroundColor,
      }));
      setCalendars(calList);
      setEvents((data.events ?? []).map(parseEventFromServer));
      const fetchedAtHeader = Number(res.headers.get("X-Homeslate-Calendar-Fetched-At"));
      const savedAt = Number.isFinite(fetchedAtHeader) ? fetchedAtHeader : Date.now();
      const fromCache = res.headers.get("X-Homeslate-Calendar-Cache") === "hit";
      writeWidgetCache(
        widgetKey,
        toStoredGoogleCalendar(calList, (data.events ?? []).map(parseEventFromServer)),
        {
          now: savedAt,
          maxBytes: WIDGET_CACHE_LARGE_MAX_BYTES,
        },
      );
      setLastUpdated(savedAt);
      setIsStale(fromCache && displayCalendarCacheAction(savedAt) === "stale");
      setAuthFailureReason(null);
      setConsecutiveFailures(0);
    } catch (err) {
      console.warn("[display-calendar] network error", {
        displayId,
        error: err instanceof Error ? err.message : String(err),
      });
      setAuthFailureReason(null);
      setError(err instanceof Error ? err.message : "Failed to load calendar");
      setIsStale(true);
      setConsecutiveFailures((prev) => prev + 1);
    } finally {
      setIsLoading(false);
    }
  }, [displayId, selectedCalendarIdsKey, daysAhead, daysBack, kioskFetchBaseUrl, widgetKey]);

  useEffect(() => {
    if (!displayId) {
      setIsLoading(false);
      setError(null);
      setAuthFailureReason(null);
      setCalendars([]);
      setEvents([]);
      setLastUpdated(null);
      return;
    }
    fetchData();
  }, [displayId, fetchData]);

  useRefreshingPoll(
    Boolean(displayId) && selectedCalendarIdsKey.length > 0,
    getDisplayCalendarPollDelay(
      REFRESH_INTERVAL_MS,
      consecutiveFailures,
      isFatalGoogleAuthFailure(authFailureReason),
    ),
    () => fetchData(),
  );

  if (!displayId) return EMPTY_RESULT;

  return {
    isAuthenticated: true,
    isLoading,
    error,
    calendars,
    events,
    lastUpdated,
    isStale,
    refresh: fetchData,
    addEvent: async () => {}, // display-only: no write
    editEvent: async () => {},
    removeEvent: async () => {},
  };
}
