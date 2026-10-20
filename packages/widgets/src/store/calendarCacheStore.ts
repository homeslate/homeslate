import { create } from "zustand";
import { CACHE_POLICIES } from "../services/cachePolicies";
import type { GoogleCalendar, ParsedCalendarEvent } from "../services/googleCalendar";

export interface CalendarCacheEntry {
  calendars: GoogleCalendar[];
  events: ParsedCalendarEvent[];
  fetchedAt: number; // Date.now()
}

interface CalendarCacheState {
  // Key: stable string derived from the widget's config (see cacheKey helper)
  cache: Record<string, CalendarCacheEntry>;
  setEntry: (key: string, entry: CalendarCacheEntry) => void;
  getEntry: (key: string) => CalendarCacheEntry | undefined;
  invalidateEntry: (key: string) => void;
}

export const useCalendarCacheStore = create<CalendarCacheState>()((set, get) => ({
  cache: {},

  setEntry: (key, entry) => set((state) => ({ cache: { ...state.cache, [key]: entry } })),

  getEntry: (key) => get().cache[key],

  invalidateEntry: (key) =>
    set((state) => {
      const next = { ...state.cache };
      delete next[key];
      return { cache: next };
    }),
}));

/** Stable cache key for a given set of calendar IDs + fetch window. */
export function calendarCacheKey(
  selectedCalendarIds: string[],
  daysAhead: number,
  daysBack: number,
): string {
  return [...selectedCalendarIds].sort().join(",") + "|" + daysBack + "|" + daysAhead;
}

export function googleCalendarFreshness(
  fetchedAt: number,
  now = Date.now(),
): "fresh" | "stale" | "expired" {
  const age = now - fetchedAt;
  if (age >= CACHE_POLICIES.googleCalendar.maxStaleMs) return "expired";
  if (age < CACHE_POLICIES.googleCalendar.freshMs) return "fresh";
  return "stale";
}

export interface StoredGoogleCalendarEvent {
  id: string;
  calendarId: string;
  calendarName?: string;
  title: string;
  description?: string;
  location?: string;
  start: string;
  end: string;
  allDay: boolean;
  color: string;
  htmlLink?: string;
}

export interface StoredGoogleCalendar {
  calendars: Array<Pick<GoogleCalendar, "id" | "summary" | "backgroundColor">>;
  events: StoredGoogleCalendarEvent[];
}

/** Persist calendars and events only. OAuth tokens are never copied. */
export function toStoredGoogleCalendar(
  calendars: GoogleCalendar[],
  events: ParsedCalendarEvent[],
): StoredGoogleCalendar {
  return {
    calendars: calendars.map((calendar) => ({
      id: calendar.id,
      summary: calendar.summary,
      backgroundColor: calendar.backgroundColor,
    })),
    events: events.map((event) => ({
      id: event.id,
      calendarId: event.calendarId,
      calendarName: event.calendarName,
      title: event.title,
      description: event.description,
      location: event.location,
      start: event.start.toISOString(),
      end: event.end.toISOString(),
      allDay: event.allDay,
      color: event.color,
      htmlLink: event.htmlLink,
    })),
  };
}

export function fromStoredGoogleCalendar(stored: StoredGoogleCalendar): {
  calendars: GoogleCalendar[];
  events: ParsedCalendarEvent[];
} {
  return {
    calendars: stored.calendars.map((calendar) => ({
      id: calendar.id,
      summary: calendar.summary,
      backgroundColor: calendar.backgroundColor,
    })),
    events: stored.events.map((event) => ({
      ...event,
      start: new Date(event.start),
      end: new Date(event.end),
    })),
  };
}
