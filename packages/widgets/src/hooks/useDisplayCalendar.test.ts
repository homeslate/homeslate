import { describe, expect, it } from "vite-plus/test";
import { displayCalendarUrl } from "./useDisplayCalendar";

describe("displayCalendarUrl", () => {
  it("prefixes the host kiosk base URL", () => {
    expect(
      displayCalendarUrl("/api", {
        displayId: "abc",
        calendarIds: "cal1",
        daysAhead: 30,
        daysBack: 42,
      }),
    ).toBe("/api/display-calendar?displayId=abc&calendarIds=cal1&daysAhead=30&daysBack=42");
  });
});
