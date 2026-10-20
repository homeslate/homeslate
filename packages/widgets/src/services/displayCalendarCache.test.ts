import { describe, expect, it } from "vite-plus/test";
import {
  displayCalendarCacheAction,
  DISPLAY_CALENDAR_CLIENT_TTL_MS,
  DISPLAY_CALENDAR_MAX_STALE_MS,
  isDisplayCalendarCacheFresh,
} from "./displayCalendarCache";
import { toStoredGoogleCalendar } from "../store/calendarCacheStore";
import type { ParsedCalendarEvent } from "./googleCalendar";

describe("isDisplayCalendarCacheFresh", () => {
  it("is fresh inside TTL", () => {
    const now = 1_000_000;
    expect(isDisplayCalendarCacheFresh(now - DISPLAY_CALENDAR_CLIENT_TTL_MS + 1, now)).toBe(true);
  });

  it("is stale at or beyond TTL", () => {
    const now = 1_000_000;
    expect(isDisplayCalendarCacheFresh(now - DISPLAY_CALENDAR_CLIENT_TTL_MS, now)).toBe(false);
  });
});

describe("display calendar freshness", () => {
  it("skips the network while fresh and revalidates while stale", () => {
    const now = 1_000_000;
    expect(displayCalendarCacheAction(now - 1_000, now)).toBe("fresh");
    expect(displayCalendarCacheAction(now - DISPLAY_CALENDAR_CLIENT_TTL_MS, now)).toBe("stale");
    expect(displayCalendarCacheAction(now - DISPLAY_CALENDAR_MAX_STALE_MS, now)).toBe("expired");
  });
});

describe("google calendar cache", () => {
  it("does not store oauth tokens", () => {
    const event = {
      id: "1",
      calendarId: "cal",
      title: "Standup",
      start: new Date("2026-10-20T15:00:00Z"),
      end: new Date("2026-10-20T15:30:00Z"),
      allDay: false,
      color: "#4285f4",
      accessToken: "ya29.secret",
    } as ParsedCalendarEvent & { accessToken: string };
    const stored = toStoredGoogleCalendar([], [event]);
    const json = JSON.stringify(stored);
    expect(json).not.toContain("ya29.secret");
    expect(json).not.toContain("accessToken");
  });
});
