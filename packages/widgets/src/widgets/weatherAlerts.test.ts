import { describe, expect, it } from "vite-plus/test";
import fixture from "./weatherAlerts.fixture.json" with { type: "json" };
import {
  mapNwsAlerts,
  sortWeatherAlerts,
  WEATHER_ALERTS_COVERAGE_COPY,
  WEATHER_ALERTS_EMPTY_COPY,
  WEATHER_ALERTS_NEED_LOCATION_COPY,
} from "./weatherAlerts";

describe("weather alert helpers", () => {
  it("maps NWS properties and prefers ends over expires", () => {
    const alerts = mapNwsAlerts(fixture);
    expect(alerts[0]).toMatchObject({
      event: "Wind Advisory",
      severity: "moderate",
      endsAt: "2026-09-11T23:00:00-07:00",
    });
    expect(alerts.find((a) => a.severity === "extreme")?.endsAt).toBe("2026-09-11T20:00:00-07:00");
    expect(alerts.find((a) => a.event === "Special Weather Statement")?.severity).toBe("unknown");
  });

  it("sorts extreme → severe → moderate → minor → unknown, then endsAt ascending", () => {
    const sorted = sortWeatherAlerts([
      {
        id: "m-late",
        event: "A",
        headline: "A",
        severity: "moderate",
        endsAt: "2026-09-12T02:00:00Z",
      },
      {
        id: "m-early",
        event: "B",
        headline: "B",
        severity: "moderate",
        endsAt: "2026-09-12T01:00:00Z",
      },
      { id: "x", event: "C", headline: "C", severity: "extreme" },
      { id: "u", event: "D", headline: "D", severity: "unknown" },
    ]);
    expect(sorted.map((a) => a.id)).toEqual(["x", "m-early", "m-late", "u"]);
  });

  it("uses quiet coverage and empty copy", () => {
    expect(WEATHER_ALERTS_COVERAGE_COPY).toBe("Alerts are available for US locations.");
    expect(WEATHER_ALERTS_EMPTY_COPY).toBe("No active alerts");
    expect(WEATHER_ALERTS_NEED_LOCATION_COPY).toBe("Search for a location");
  });
});
