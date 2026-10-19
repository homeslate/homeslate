import { describe, expect, it } from "vite-plus/test";
import { mapCalendarEvents } from "./calendarState";

describe("mapCalendarEvents", () => {
  it("maps timed and all-day events, skipping malformed entries", () => {
    expect(
      mapCalendarEvents(
        {
          "calendar.home": {
            events: [
              {
                summary: "Standup",
                uid: "abc",
                start: { dateTime: "2026-10-19T09:00:00+00:00" },
                end: { dateTime: "2026-10-19T09:30:00+00:00" },
                location: "Zoom",
                description: "Daily",
              },
              { summary: "Holiday", start: { date: "2026-10-20" }, end: { date: "2026-10-21" } },
              { start: { date: "2026-10-22" }, end: { date: "2026-10-23" } },
            ],
          },
        },
        "calendar.home",
      ),
    ).toEqual([
      {
        id: "abc",
        title: "Standup",
        location: "Zoom",
        description: "Daily",
        start: "2026-10-19T09:00:00+00:00",
        end: "2026-10-19T09:30:00+00:00",
        allDay: false,
      },
      {
        id: "2026-10-20-1",
        title: "Holiday",
        start: "2026-10-20",
        end: "2026-10-21",
        allDay: true,
      },
    ]);
  });

  it("accepts the websocket wrapper and returns [] for junk", () => {
    expect(
      mapCalendarEvents(
        {
          service_response: {
            events: [
              {
                summary: "A",
                start: { dateTime: "2026-10-19T09:00:00Z" },
                end: { dateTime: "2026-10-19T10:00:00Z" },
              },
            ],
          },
        },
        "calendar.home",
      ),
    ).toHaveLength(1);
    expect(mapCalendarEvents(null, "calendar.home")).toEqual([]);
  });
});
