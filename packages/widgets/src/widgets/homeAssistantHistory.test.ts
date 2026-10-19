import { describe, expect, it } from "vite-plus/test";
import {
  HISTORY_HOURS_DEFAULT,
  HISTORY_HOURS_MAX,
  buildSparklinePath,
  clampHistoryHours,
  downsampleHistory,
  formatHistoryValue,
  historyApiUrl,
  historyLatest,
  historyRange,
  type HomeAssistantHistoryPoint,
} from "./homeAssistantHistory";

const point = (value: number, minute = 0): HomeAssistantHistoryPoint => ({
  at: new Date(2026, 0, 1, 0, minute).toISOString(),
  value,
});

describe("clampHistoryHours", () => {
  it("clamps to 1–168 and falls back for invalid input", () => {
    expect(clampHistoryHours(24)).toBe(24);
    expect(clampHistoryHours(0)).toBe(1);
    expect(clampHistoryHours(999)).toBe(HISTORY_HOURS_MAX);
    expect(clampHistoryHours(Number.NaN)).toBe(HISTORY_HOURS_DEFAULT);
  });
});

describe("downsampleHistory", () => {
  it("keeps the first and last points and caps the series", () => {
    const points = Array.from({ length: 1000 }, (_, index) => point(index, index));
    const sampled = downsampleHistory(points, 10);
    expect(sampled.length).toBeLessThanOrEqual(11);
    expect(sampled[0]).toEqual(points[0]);
    expect(sampled[sampled.length - 1]).toEqual(points[points.length - 1]);
  });

  it("returns short series unchanged", () => {
    const points = [point(1), point(2)];
    expect(downsampleHistory(points, 10)).toEqual(points);
  });
});

describe("history values", () => {
  it("computes the range and latest value", () => {
    const points = [point(5), point(2), point(9)];
    expect(historyRange(points)).toEqual({ min: 2, max: 9 });
    expect(historyLatest(points)).toBe(9);
    expect(historyRange([])).toBeNull();
    expect(historyLatest([])).toBeNull();
  });

  it("formats values with units", () => {
    expect(formatHistoryValue(21.46, "°C")).toBe("21.5°C");
    expect(formatHistoryValue(12, null)).toBe("12");
    expect(formatHistoryValue(null, "°C")).toBe("—");
  });
});

describe("buildSparklinePath", () => {
  it("builds an SVG path for at least two points", () => {
    const path = buildSparklinePath([point(1), point(2), point(3)], 100, 50);
    expect(path.startsWith("M")).toBe(true);
    expect(path).toContain("L");
    expect(path).not.toContain("NaN");
  });

  it("returns an empty path for too few points", () => {
    expect(buildSparklinePath([point(1)], 100, 50)).toBe("");
  });
});

describe("historyApiUrl", () => {
  it("encodes the entity and clamps the window", () => {
    expect(historyApiUrl("sensor.outdoor", 24)).toBe(
      "/api/homeassistant/history/sensor.outdoor?hours=24",
    );
    expect(historyApiUrl("sensor.outdoor", 999)).toBe(
      `/api/homeassistant/history/sensor.outdoor?hours=${HISTORY_HOURS_MAX}`,
    );
  });
});
