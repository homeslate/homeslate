import { describe, expect, it } from "vite-plus/test";
import { countdownRemaining } from "./countdown";

describe("countdownRemaining", () => {
  it("returns invalid for an empty or unparsable target", () => {
    expect(countdownRemaining(new Date("2026-09-11T12:00:00"), "", false).kind).toBe("invalid");
    expect(countdownRemaining(new Date("2026-09-11T12:00:00"), "not-a-date", false).kind).toBe(
      "invalid",
    );
  });

  it("returns past after the target", () => {
    const result = countdownRemaining(new Date("2026-09-12T12:00:00"), "2026-09-11", true);
    expect(result.kind).toBe("past");
    expect(result.dateLabel).toMatch(/Sep/);
  });

  it("returns remaining days hours and minutes for a future datetime", () => {
    const result = countdownRemaining(
      new Date("2026-09-11T12:00:00"),
      "2026-09-14T16:15:00",
      false,
    );
    expect(result.kind).toBe("remaining");
    expect(result.parts).toEqual({ days: 3, hours: 4, minutes: 15, seconds: 0 });
  });

  it("treats an all-day target as the start of that local date", () => {
    const result = countdownRemaining(new Date("2026-09-11T12:00:00"), "2026-09-12", true);
    expect(result.kind).toBe("remaining");
    expect(result.parts?.days).toBe(0);
    expect(result.parts?.hours).toBe(12);
  });
});
